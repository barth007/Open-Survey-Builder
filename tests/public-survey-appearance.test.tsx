import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { PublicSurveyLayout } from '@/features/survey-editor/components/PublicSurveyLayout';

describe('public survey appearance', () => {
  it('applies survey theme variables and branding assets to the public shell', () => {
    const html = renderToStaticMarkup(
      <PublicSurveyLayout
        surveyTitle="Hiring survey"
        appearance={{
          colors: {
            background: '#101010',
            cardBackground: '#fff8ef',
            text: '#1b1b18',
            primary: '#cc5a24',
            primaryForeground: '#fffdf8',
            border: '#dccbb6',
            progress: '#cc5a24',
          },
          layout: {
            width: 'wide',
            showProductBranding: false,
          },
        }}
        branding={{
          logo: {
            url: 'https://example.com/logo.png',
            alt: 'Acme logo',
          },
          coverImage: {
            url: 'https://example.com/cover.png',
            alt: 'Office mural',
          },
        }}
      >
        <div>Public body</div>
      </PublicSurveyLayout>,
    );

    expect(html).toContain('--survey-background:#101010');
    expect(html).toContain('--survey-card-background:#fff8ef');
    expect(html).toContain('--survey-primary:#cc5a24');
    expect(html).toContain('https://example.com/logo.png');
    expect(html).toContain('https://example.com/cover.png');
    expect(html).not.toContain('Built with Survey-Builder');
  });
});
