import { randomBytes } from 'node:crypto';
import type { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../prisma.js';
import {
  buildCustomDomainProviderSnapshot,
  formatDomainRoutePath,
  isCustomDomainActive,
  normalizeCustomDomainHost,
  normalizeDomainRouteSlug,
  resolveDomainRouteSlugFromPath,
} from '../lib/custom-domain-provider.js';
import { prepareDomainCodeInjectionInput } from '../lib/code-injection-policy.js';

type DomainMetadata = Record<string, unknown>;

const logDomainError = (scope: string, error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`[${scope}] ${message}`);
};

const jsonObject = (value: unknown): DomainMetadata => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as DomainMetadata
    : {}
);

const toPrismaJsonObject = (value: DomainMetadata) => (
  value as Prisma.InputJsonValue
);

const canManageSurvey = async (
  survey: { userId?: string | null; teamId?: string | null },
  userId?: string,
) => {
  if (!userId) {
    return false;
  }

  if (survey.userId === userId) {
    return true;
  }

  if (!survey.teamId) {
    return false;
  }

  const membership = await prisma.teamMember.findFirst({
    where: {
      teamId: survey.teamId,
      userId,
      role: {
        in: ['owner', 'admin'],
      },
    },
  });

  return Boolean(membership);
};

const mapCustomDomainForClient = (
  domain: {
    id: string;
    host: string;
    status: string;
    verificationToken: string;
    verifiedAt: Date | null;
    sslStatus: string;
    faviconUrl: string | null;
    brandName: string | null;
    removeBranding: boolean;
    metadata: unknown;
    headCode: string | null;
    bodyCode: string | null;
    routes: Array<{
      id: string;
      surveyId: string;
      slug: string;
      isPrimary: boolean;
      metadata: unknown;
      survey: {
        id: string;
        name: string;
        publicCode: string | null;
      } | null;
    }>;
  },
) => ({
  id: domain.id,
  host: domain.host,
  status: domain.status,
  verificationToken: domain.verificationToken,
  verifiedAt: domain.verifiedAt?.toISOString() ?? null,
  sslStatus: domain.sslStatus,
  faviconUrl: domain.faviconUrl,
  brandName: domain.brandName,
  removeBranding: domain.removeBranding,
  metadata: jsonObject(domain.metadata),
  headCode: domain.headCode,
  bodyCode: domain.bodyCode,
  provider: buildCustomDomainProviderSnapshot({
    host: domain.host,
    verificationToken: domain.verificationToken,
  }),
  routes: domain.routes.map((route) => ({
    id: route.id,
    surveyId: route.surveyId,
    surveyName: route.survey?.name,
    publicCode: route.survey?.publicCode,
    slug: route.slug,
    path: formatDomainRoutePath(route.slug),
    isPrimary: route.isPrimary,
    metadata: jsonObject(route.metadata),
  })),
});

const domainInclude = {
  routes: {
    orderBy: [
      { isPrimary: 'desc' as const },
      { updatedAt: 'desc' as const },
    ],
    include: {
      survey: {
        select: {
          id: true,
          name: true,
          publicCode: true,
        },
      },
    },
  },
};

const getDomainPolicyOptions = (metadata: DomainMetadata) => ({
  trusted: Boolean(metadata.trusted),
  allowScripts: Boolean(metadata.allowScripts),
});

export const listCustomDomains = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const domains = await prisma.customDomain.findMany({
      where: { userId },
      include: domainInclude,
      orderBy: { createdAt: 'desc' },
    });

    res.json(domains.map(mapCustomDomainForClient));
  } catch (error) {
    logDomainError('customDomains.list', error);
    res.status(500).json({ message: 'Error loading custom domains' });
  }
};

export const createCustomDomain = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const normalizedHost = typeof req.body?.host === 'string'
    ? normalizeCustomDomainHost(req.body.host)
    : '';

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!normalizedHost) {
    return res.status(400).json({ message: 'A valid hostname is required' });
  }

  try {
    const createdDomain = await prisma.customDomain.create({
      data: {
        userId,
        host: normalizedHost,
        status: 'pending',
        sslStatus: 'pending',
        verificationToken: randomBytes(12).toString('hex'),
        metadata: {
          trusted: false,
          allowScripts: false,
          allowIndexing: true,
        },
      },
    });

    const hydratedDomain = await prisma.customDomain.findUniqueOrThrow({
      where: { id: createdDomain.id },
      include: domainInclude,
    });

    res.status(201).json(mapCustomDomainForClient(hydratedDomain));
  } catch (error) {
    logDomainError('customDomains.create', error);
    res.status(500).json({ message: 'Error creating custom domain' });
  }
};

export const updateCustomDomain = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { domainId } = req.params;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const existingDomain = await prisma.customDomain.findUnique({
      where: { id: domainId as string },
      include: domainInclude,
    });

    if (!existingDomain) {
      return res.status(404).json({ message: 'Domain not found' });
    }

    if (existingDomain.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const existingMetadata = jsonObject(existingDomain.metadata);
    const incomingMetadata = jsonObject(req.body?.metadata);
    const nextMetadata = {
      ...existingMetadata,
      ...incomingMetadata,
    };
    const shouldRevalidateInjection = Object.prototype.hasOwnProperty.call(req.body ?? {}, 'headCode')
      || Object.prototype.hasOwnProperty.call(req.body ?? {}, 'bodyCode')
      || nextMetadata.trusted !== existingMetadata.trusted
      || nextMetadata.allowScripts !== existingMetadata.allowScripts;
    const injectionInput = shouldRevalidateInjection
      ? prepareDomainCodeInjectionInput(
        {
          headCode: Object.prototype.hasOwnProperty.call(req.body ?? {}, 'headCode')
            ? req.body.headCode
            : existingDomain.headCode,
          bodyCode: Object.prototype.hasOwnProperty.call(req.body ?? {}, 'bodyCode')
            ? req.body.bodyCode
            : existingDomain.bodyCode,
        },
        getDomainPolicyOptions(nextMetadata),
      )
      : {
        headCode: existingDomain.headCode,
        bodyCode: existingDomain.bodyCode,
      };
    const nextStatus = typeof req.body?.status === 'string'
      ? req.body.status
      : existingDomain.status;

    await prisma.customDomain.update({
      where: { id: domainId as string },
      data: {
        status: nextStatus,
        sslStatus: typeof req.body?.sslStatus === 'string' ? req.body.sslStatus : existingDomain.sslStatus,
        faviconUrl: typeof req.body?.faviconUrl === 'string' ? req.body.faviconUrl : existingDomain.faviconUrl,
        brandName: typeof req.body?.brandName === 'string' ? req.body.brandName : existingDomain.brandName,
        removeBranding: typeof req.body?.removeBranding === 'boolean' ? req.body.removeBranding : existingDomain.removeBranding,
        metadata: toPrismaJsonObject(nextMetadata),
        headCode: injectionInput.headCode,
        bodyCode: injectionInput.bodyCode,
        verifiedAt: nextStatus === 'active' || nextStatus === 'verified'
          ? existingDomain.verifiedAt ?? new Date()
          : existingDomain.verifiedAt,
      },
    });

    const hydratedDomain = await prisma.customDomain.findUniqueOrThrow({
      where: { id: domainId as string },
      include: domainInclude,
    });

    res.json(mapCustomDomainForClient(hydratedDomain));
  } catch (error) {
    logDomainError('customDomains.update', error);
    const message = error instanceof Error ? error.message : 'Error updating custom domain';
    res.status(400).json({ message });
  }
};

export const deleteCustomDomain = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { domainId } = req.params;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const existingDomain = await prisma.customDomain.findUnique({
      where: { id: domainId as string },
    });

    if (!existingDomain) {
      return res.status(404).json({ message: 'Domain not found' });
    }

    if (existingDomain.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.customDomain.delete({
      where: { id: domainId as string },
    });

    res.status(204).send();
  } catch (error) {
    logDomainError('customDomains.delete', error);
    res.status(500).json({ message: 'Error deleting custom domain' });
  }
};

export const createDomainRoute = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { domainId } = req.params;
  const surveyId = typeof req.body?.surveyId === 'string' ? req.body.surveyId : '';
  const slug = typeof req.body?.slug === 'string' ? normalizeDomainRouteSlug(req.body.slug) : '';
  const isPrimary = Boolean(req.body?.isPrimary);

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!surveyId) {
    return res.status(400).json({ message: 'A survey is required' });
  }

  try {
    const [domain, survey] = await Promise.all([
      prisma.customDomain.findUnique({
        where: { id: domainId as string },
      }),
      prisma.survey.findUnique({
        where: { id: surveyId },
      }),
    ]);

    if (!domain) {
      return res.status(404).json({ message: 'Domain not found' });
    }

    if (domain.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (!survey || !await canManageSurvey(survey, userId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (isPrimary) {
      await prisma.domainRoute.updateMany({
        where: { domainId: domainId as string },
        data: { isPrimary: false },
      });
    }

    const createdRoute = await prisma.domainRoute.create({
      data: {
        domainId: domainId as string,
        surveyId,
        slug,
        isPrimary,
        metadata: toPrismaJsonObject(jsonObject(req.body?.metadata)),
      },
    });

    const route = await prisma.domainRoute.findUniqueOrThrow({
      where: { id: createdRoute.id },
      include: {
        survey: {
          select: {
            id: true,
            name: true,
            publicCode: true,
          },
        },
      },
    });

    res.status(201).json({
      id: route.id,
      surveyId: route.surveyId,
      surveyName: route.survey?.name,
      publicCode: route.survey?.publicCode,
      slug: route.slug,
      path: formatDomainRoutePath(route.slug),
      isPrimary: route.isPrimary,
      metadata: jsonObject(route.metadata),
    });
  } catch (error) {
    logDomainError('customDomains.routes.create', error);
    res.status(400).json({ message: 'Error creating branded route' });
  }
};

export const updateDomainRoute = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { domainId, routeId } = req.params;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const [domain, route] = await Promise.all([
      prisma.customDomain.findUnique({
        where: { id: domainId as string },
      }),
      prisma.domainRoute.findUnique({
        where: { id: routeId as string },
      }),
    ]);

    if (!domain || !route || route.domainId !== domainId) {
      return res.status(404).json({ message: 'Route not found' });
    }

    if (domain.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const nextSurveyId = typeof req.body?.surveyId === 'string'
      ? req.body.surveyId
      : route.surveyId;

    if (nextSurveyId !== route.surveyId) {
      const survey = await prisma.survey.findUnique({
        where: { id: nextSurveyId },
      });

      if (!survey || !await canManageSurvey(survey, userId)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    const nextPrimary = typeof req.body?.isPrimary === 'boolean'
      ? req.body.isPrimary
      : route.isPrimary;

    if (nextPrimary) {
      await prisma.domainRoute.updateMany({
        where: {
          domainId: domainId as string,
          NOT: { id: routeId as string },
        },
        data: { isPrimary: false },
      });
    }

    const nextMetadata = Object.prototype.hasOwnProperty.call(req.body ?? {}, 'metadata')
      ? jsonObject(req.body.metadata)
      : jsonObject(route.metadata);

    const updatedRoute = await prisma.domainRoute.update({
      where: { id: routeId as string },
      data: {
        surveyId: nextSurveyId,
        slug: typeof req.body?.slug === 'string'
          ? normalizeDomainRouteSlug(req.body.slug)
          : route.slug,
        isPrimary: nextPrimary,
        metadata: toPrismaJsonObject(nextMetadata),
      },
      include: {
        survey: {
          select: {
            id: true,
            name: true,
            publicCode: true,
          },
        },
      },
    });

    res.json({
      id: updatedRoute.id,
      surveyId: updatedRoute.surveyId,
      surveyName: updatedRoute.survey?.name,
      publicCode: updatedRoute.survey?.publicCode,
      slug: updatedRoute.slug,
      path: formatDomainRoutePath(updatedRoute.slug),
      isPrimary: updatedRoute.isPrimary,
      metadata: jsonObject(updatedRoute.metadata),
    });
  } catch (error) {
    logDomainError('customDomains.routes.update', error);
    res.status(400).json({ message: 'Error updating branded route' });
  }
};

export const deleteDomainRoute = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { domainId, routeId } = req.params;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const [domain, route] = await Promise.all([
      prisma.customDomain.findUnique({
        where: { id: domainId as string },
      }),
      prisma.domainRoute.findUnique({
        where: { id: routeId as string },
      }),
    ]);

    if (!domain || !route || route.domainId !== domainId) {
      return res.status(404).json({ message: 'Route not found' });
    }

    if (domain.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.domainRoute.delete({
      where: { id: routeId as string },
    });

    res.status(204).send();
  } catch (error) {
    logDomainError('customDomains.routes.delete', error);
    res.status(500).json({ message: 'Error deleting branded route' });
  }
};

export const resolveCustomDomainRoute = async (req: Request, res: Response) => {
  const host = typeof req.query?.host === 'string'
    ? normalizeCustomDomainHost(req.query.host)
    : normalizeCustomDomainHost(String(req.headers.host ?? ''));
  const slug = resolveDomainRouteSlugFromPath(
    typeof req.query?.path === 'string' ? req.query.path : '/',
  );

  if (!host) {
    return res.status(400).json({ message: 'A host is required' });
  }

  try {
    const route = await prisma.domainRoute.findFirst({
      where: {
        slug,
        domain: {
          host,
        },
      },
      include: {
        domain: true,
        survey: true,
      },
    });

    if (
      !route ||
      !route.survey?.isPublished ||
      !route.survey?.publicCode ||
      !isCustomDomainActive({
        status: route.domain?.status,
        sslStatus: route.domain?.sslStatus,
      })
    ) {
      return res.status(404).json({ message: 'No branded route found for this hostname' });
    }

    res.json({
      publicCode: route.survey.publicCode,
      surveyId: route.survey.id,
      surveyTitle: route.survey.name,
      slug: route.slug,
      domain: {
        host: route.domain.host,
        brandName: route.domain.brandName,
        faviconUrl: route.domain.faviconUrl,
        removeBranding: route.domain.removeBranding,
        headCode: route.domain.headCode,
        bodyCode: route.domain.bodyCode,
        metadata: jsonObject(route.domain.metadata),
      },
    });
  } catch (error) {
    logDomainError('customDomains.resolve', error);
    res.status(500).json({ message: 'Error resolving branded route' });
  }
};
