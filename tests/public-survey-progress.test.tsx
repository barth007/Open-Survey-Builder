import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { PublicSurveyLayout } from '@/features/survey-editor/components/PublicSurveyLayout';

describe('public survey progress', () => {
  it('renders a real progress bar with page progress when enabled', () => {
    const html = renderToStaticMarkup(
      <PublicSurveyLayout
        surveyTitle="Hiring survey"
        appearance={{
          progressBar: {
            enabled: true,
            position: 'top',
          },
        }}
        progress={{
          currentPage: 2,
          totalPages: 4,
        }}
      >
        <div>Page body</div>
      </PublicSurveyLayout>,
    );

    expect(html).toContain('aria-label="Form progress"');
    expect(html).toContain('Page 2 of 4');
    expect(html).toContain('50% complete');
    expect(html).toContain('data-progress-position="top"');
  });

  it('does not render the progress shell when the feature is disabled', () => {
    const html = renderToStaticMarkup(
      <PublicSurveyLayout
        surveyTitle="Hiring survey"
        appearance={{
          progressBar: {
            enabled: false,
          },
        }}
        progress={{
          currentPage: 1,
          totalPages: 4,
        }}
      >
        <div>Page body</div>
      </PublicSurveyLayout>,
    );

    expect(html).not.toContain('aria-label="Form progress"');
    expect(html).not.toContain('Page 1 of 4');
  });
});
