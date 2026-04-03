const DOMAIN_CNAME_TARGET = 'cname.survey-builder.local';

export const normalizeCustomDomainHost = (host: string) => (
  host
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/:\d+$/, '')
);

export const normalizeDomainRouteSlug = (slug: string) => {
  const normalized = slug
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized;
};

export const resolveDomainRouteSlugFromPath = (path: string) => (
  normalizeDomainRouteSlug(path)
);

export const buildCustomDomainProviderSnapshot = ({
  host,
  verificationToken,
}: {
  host: string;
  verificationToken: string;
}) => ({
  dnsRecordType: 'TXT' as const,
  dnsRecordName: `_survey.${normalizeCustomDomainHost(host)}`,
  dnsRecordValue: verificationToken,
  cnameTarget: DOMAIN_CNAME_TARGET,
});

export const isCustomDomainActive = ({
  status,
  sslStatus,
}: {
  status?: string | null;
  sslStatus?: string | null;
}) => (
  (status === 'active' || status === 'verified')
  && sslStatus !== 'failed'
);

export const formatDomainRoutePath = (slug: string) => (
  slug ? `/${slug}` : '/'
);
