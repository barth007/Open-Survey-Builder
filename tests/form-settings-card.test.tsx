import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { FormSettingsCard } from '@/features/survey-editor/components/FormSettingsCard';

describe('form settings card', () => {
  it('renders persisted access, completion, and behavior settings', () => {
    const html = renderToStaticMarkup(
      <FormSettingsCard
        settings={{
          locale: 'it',
          completion: {
            redirectUrl: 'https://example.com/next-step',
          },
          access: {
            isClosed: true,
            closeAt: '2026-04-02T10:30:00.000Z',
            maxSubmissions: 125,
            closedMessage: {
              title: 'Submissions closed',
              description: 'We already collected enough responses.',
            },
            passwordProtection: {
              enabled: true,
              hasPassword: true,
            },
            duplicateProtection: {
              enabled: true,
              uniqueFieldRef: 'hidden:lead_id',
              appliesTo: 'submitted_and_partial',
            },
          },
          behavior: {
            autoJumpSingleQuestionPages: true,
            saveLocalDraft: true,
            capturePartialSubmissions: true,
          },
        }}
        onSettingsChange={() => {}}
      />,
    );

    expect(html).toContain('Form Settings');
    expect(html).toContain('Completion Redirect');
    expect(html).toContain('https://example.com/next-step');
    expect(html).toContain('Submissions closed');
    expect(html).toContain('We already collected enough responses.');
    expect(html).toContain('value="125"');
    expect(html).toContain('Password Protection');
    expect(html).toContain('Duplicate Protection');
    expect(html).toContain('hidden:lead_id');
  });
});
