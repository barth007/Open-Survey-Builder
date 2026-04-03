import type { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../prisma.js';

type RevisionSnapshotField =
  | 'name'
  | 'description'
  | 'questions'
  | 'appearance'
  | 'branding'
  | 'shareMeta'
  | 'seo'
  | 'settings'
  | 'notifications'
  | 'retention'
  | 'hiddenFields'
  | 'computedFields'
  | 'automationRules'
  | 'delivery'
  | 'welcomeTitle'
  | 'welcomeMessage'
  | 'welcomeInstructions'
  | 'welcomeButtonText'
  | 'thankYouTitle'
  | 'thankYouMessage'
  | 'thankYouButtonText'
  | 'redirectUrl'
  | 'recordingEnabled'
  | 'recordingRequired'
  | 'publicCode';

const REVISION_SNAPSHOT_FIELDS: RevisionSnapshotField[] = [
  'name',
  'description',
  'questions',
  'appearance',
  'branding',
  'shareMeta',
  'seo',
  'settings',
  'notifications',
  'retention',
  'hiddenFields',
  'computedFields',
  'automationRules',
  'delivery',
  'welcomeTitle',
  'welcomeMessage',
  'welcomeInstructions',
  'welcomeButtonText',
  'thankYouTitle',
  'thankYouMessage',
  'thankYouButtonText',
  'redirectUrl',
  'recordingEnabled',
  'recordingRequired',
  'publicCode',
];

const REVISION_TRIGGER_FIELDS = new Set([
  'name',
  'description',
  'questions',
  'appearance',
  'branding',
  'shareMeta',
  'seo',
  'settings',
  'notifications',
  'retention',
  'hiddenFields',
  'computedFields',
  'automationRules',
  'delivery',
  'welcomeTitle',
  'welcomeMessage',
  'welcomeInstructions',
  'welcomeButtonText',
  'thankYouTitle',
  'thankYouMessage',
  'thankYouButtonText',
  'redirectUrl',
  'recordingEnabled',
  'recordingRequired',
]);

interface SurveyAccessContext {
  userId?: string | null;
  teamId?: string | null;
}

const logRevisionError = (scope: string, error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`[${scope}] ${message}`);
};

const hasSurveyManagementAccess = async (
  survey: SurveyAccessContext,
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

const normalizeSnapshotJsonValue = (value: unknown) => (
  value === null
    ? Prisma.JsonNull
    : value as Prisma.InputJsonValue
);

export const buildSurveyRevisionSnapshot = (survey: Record<string, unknown>) => (
  REVISION_SNAPSHOT_FIELDS.reduce<Record<string, unknown>>((acc, field) => {
    if (Object.prototype.hasOwnProperty.call(survey, field)) {
      acc[field] = survey[field];
    }

    return acc;
  }, {})
);

export const shouldCreateRevisionForUpdate = (updates: Record<string, unknown>) => (
  Object.keys(updates).some((field) => REVISION_TRIGGER_FIELDS.has(field))
);

export const createSurveyRevisionSnapshot = async (
  surveyId: string,
  survey: Record<string, unknown>,
) => {
  if (typeof (prisma as unknown as { surveyRevision?: { create?: unknown } }).surveyRevision?.create !== 'function') {
    return;
  }

  await prisma.surveyRevision.create({
    data: {
      surveyId,
      label: typeof survey.name === 'string' ? survey.name : undefined,
      snapshot: buildSurveyRevisionSnapshot(survey) as Prisma.InputJsonValue,
    },
  });
};

export const listSurveyRevisions = async (req: Request, res: Response) => {
  const { surveyId } = req.params;
  const userId = req.user?.id;

  try {
    const survey = await prisma.survey.findUnique({
      where: { id: surveyId as string },
    });

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    if (!await hasSurveyManagementAccess(survey, userId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const revisions = await prisma.surveyRevision.findMany({
      where: { surveyId: surveyId as string },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    res.json(revisions);
  } catch (error) {
    logRevisionError('surveyRevisions.list', error);
    res.status(500).json({ message: 'Error loading survey revisions' });
  }
};

export const restoreSurveyRevision = async (req: Request, res: Response) => {
  const { surveyId, revisionId } = req.params;
  const userId = req.user?.id;

  try {
    const survey = await prisma.survey.findUnique({
      where: { id: surveyId as string },
    });

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    if (!await hasSurveyManagementAccess(survey, userId)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const revision = await prisma.surveyRevision.findUnique({
      where: { id: revisionId as string },
    });

    if (!revision || revision.surveyId !== surveyId) {
      return res.status(404).json({ message: 'Revision not found' });
    }

    const snapshot = typeof revision.snapshot === 'object' && revision.snapshot !== null
      ? revision.snapshot as Record<string, unknown>
      : {};

    const updateData = REVISION_SNAPSHOT_FIELDS.reduce<Prisma.SurveyUncheckedUpdateInput>((acc, field) => {
      if (Object.prototype.hasOwnProperty.call(snapshot, field)) {
        const value = snapshot[field];
        const nextValue = field === 'name' || field === 'description' || field === 'welcomeTitle' ||
          field === 'welcomeMessage' || field === 'welcomeInstructions' || field === 'welcomeButtonText' ||
          field === 'thankYouTitle' || field === 'thankYouMessage' || field === 'thankYouButtonText' ||
          field === 'redirectUrl' || field === 'publicCode'
          ? value as string | null | undefined
          : field === 'recordingEnabled' || field === 'recordingRequired'
            ? value as boolean | undefined
            : normalizeSnapshotJsonValue(value);
        acc[field as keyof Prisma.SurveyUncheckedUpdateInput] = nextValue as never;
      }

      return acc;
    }, {});

    updateData.isPublished = false;

    const restoredSurvey = await prisma.survey.update({
      where: { id: surveyId as string },
      data: updateData,
    });

    await prisma.surveyRevision.update({
      where: { id: revisionId as string },
      data: {
        restoredAt: new Date(),
      },
    });

    res.json(restoredSurvey);
  } catch (error) {
    logRevisionError('surveyRevisions.restore', error);
    res.status(500).json({ message: 'Error restoring survey revision' });
  }
};
