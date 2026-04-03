import { describe, expect, it } from 'vitest';

import { getClosedFormContent, getEffectiveCompletionRedirect } from '@/features/survey-response/lib/form-settings';

describe('form settings runtime', () => {
  it('prefers the structured completion redirect over the legacy thank-you redirect', () => {
    expect(getEffectiveCompletionRedirect({
      redirectUrl: 'https://example.com/legacy',
      settings: {
        completion: {
          redirectUrl: 'https://example.com/new-flow',
        },
      },
    })).toBe('https://example.com/new-flow');
  });

  it('returns the custom closed-form content when the form is manually closed', () => {
    expect(getClosedFormContent({
      access: {
        isClosed: true,
        closedMessage: {
          title: 'Submissions closed',
          description: 'We already collected enough responses.',
        },
      },
    })).toEqual({
      title: 'Submissions closed',
      description: 'We already collected enough responses.',
    });
  });

  it('closes the form when the scheduled close date is in the past', () => {
    expect(getClosedFormContent(
      {
        access: {
          isClosed: false,
          closeAt: '2026-04-01T10:00:00.000Z',
        },
      },
      new Date('2026-04-01T12:00:00.000Z'),
    )).toEqual({
      title: 'This form is closed',
      description: 'This form is no longer accepting responses.',
    });
  });
});
