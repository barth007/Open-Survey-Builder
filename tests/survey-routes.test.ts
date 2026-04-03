import { describe, expect, it } from 'vitest';

import {
  getPublicSurveyPath,
  getSurveyCodeParam,
  LEGACY_PUBLIC_SURVEY_ROUTE,
  PENDING_APPROVAL_ROUTE,
  PUBLIC_SURVEY_ROUTE,
} from '@/lib/survey-routes';

describe('survey route helpers', () => {
  it('builds the canonical public survey path with the short /p prefix', () => {
    expect(getPublicSurveyPath('abc123')).toBe('/p/abc123');
  });

  it('extracts the survey code from route params using the canonical code param', () => {
    expect(getSurveyCodeParam({ code: 'xyz789' })).toBe('xyz789');
  });

  it('keeps the legacy public survey route available for compatibility', () => {
    expect(LEGACY_PUBLIC_SURVEY_ROUTE).toBe('/public/:code');
  });

  it('exposes a dedicated pending approval route', () => {
    expect(PENDING_APPROVAL_ROUTE).toBe('/pending');
    expect(PUBLIC_SURVEY_ROUTE).toBe('/p/:code');
  });
});
