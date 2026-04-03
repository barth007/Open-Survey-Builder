import { describe, expect, it } from 'vitest';

import { buildHiddenFieldMetadata, resolveHiddenFieldValues } from '@/features/survey-response/lib/hidden-fields';

describe('hidden fields', () => {
  it('prefers query values when override is allowed', () => {
    const values = resolveHiddenFieldValues(
      [
        {
          id: 'hidden-1',
          key: 'lead_id',
          defaultValue: 'fallback-123',
          allowQueryOverride: true,
        },
      ],
      new URLSearchParams('lead_id=query-abc'),
    );

    expect(values).toEqual({
      lead_id: 'query-abc',
    });
  });

  it('falls back to the configured default when no query value is present', () => {
    const values = resolveHiddenFieldValues(
      [
        {
          id: 'hidden-1',
          key: 'campaign',
          defaultValue: 'spring-launch',
          allowQueryOverride: true,
        },
      ],
      new URLSearchParams(''),
    );

    expect(values).toEqual({
      campaign: 'spring-launch',
    });
  });

  it('keeps the default value when query override is disabled', () => {
    const values = resolveHiddenFieldValues(
      [
        {
          id: 'hidden-1',
          key: 'campaign',
          defaultValue: 'spring-launch',
          allowQueryOverride: false,
        },
      ],
      new URLSearchParams('campaign=query-campaign'),
    );

    expect(values).toEqual({
      campaign: 'spring-launch',
    });
  });

  it('stores resolved hidden fields under metadata.hiddenFields', () => {
    expect(buildHiddenFieldMetadata({
      lead_id: 'query-abc',
      campaign: 'spring-launch',
    })).toEqual({
      hiddenFields: {
        lead_id: 'query-abc',
        campaign: 'spring-launch',
      },
    });
  });
});
