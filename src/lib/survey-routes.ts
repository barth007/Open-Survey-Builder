export const PUBLIC_SURVEY_ROUTE = '/p/:code';
export const LEGACY_PUBLIC_SURVEY_ROUTE = '/public/:code';
export const LEGACY_PUBLIC_RESPONSE_ROUTE = '/public-response/:code';
export const PENDING_APPROVAL_ROUTE = '/pending';

export const getPublicSurveyPath = (code: string) => `/p/${encodeURIComponent(code)}`;
export const getPreviewSurveyPath = (code: string) => `/p/${encodeURIComponent(code)}?preview=true`;

export const getSurveyCodeParam = (params: {
  code?: string;
  publicCode?: string;
}) => params.code ?? params.publicCode ?? '';
