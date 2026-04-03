export interface CustomDomainProviderSnapshot {
  dnsRecordType: 'TXT';
  dnsRecordName: string;
  dnsRecordValue: string;
  cnameTarget: string;
}

export interface CustomDomainRoute {
  id: string;
  surveyId: string;
  surveyName?: string;
  publicCode?: string | null;
  slug: string;
  isPrimary: boolean;
  metadata?: Record<string, unknown>;
}

export interface CustomDomainMetadata {
  trusted?: boolean;
  allowScripts?: boolean;
  allowIndexing?: boolean;
}

export interface CustomDomain {
  id: string;
  host: string;
  status: string;
  verificationToken: string;
  verifiedAt?: string | null;
  sslStatus: string;
  faviconUrl?: string | null;
  brandName?: string | null;
  removeBranding?: boolean;
  metadata?: CustomDomainMetadata;
  headCode?: string | null;
  bodyCode?: string | null;
  provider?: CustomDomainProviderSnapshot;
  routes: CustomDomainRoute[];
}

export interface DomainSurveyOption {
  id: string;
  name: string;
  publicCode?: string | null;
  isPublished?: boolean;
}

export interface ResolvedCustomDomainRoute {
  publicCode: string;
  surveyId: string;
  surveyTitle: string;
  slug: string;
  domain: {
    host: string;
    brandName?: string | null;
    faviconUrl?: string | null;
    removeBranding?: boolean;
    headCode?: string | null;
    bodyCode?: string | null;
    metadata?: CustomDomainMetadata;
  };
}
