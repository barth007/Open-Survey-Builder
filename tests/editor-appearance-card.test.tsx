import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { SurveyAppearanceCard } from '@/features/survey-editor/components/SurveyAppearanceCard';
import { SurveyBrandingCard } from '@/features/survey-editor/components/SurveyBrandingCard';

describe('editor appearance cards', () => {
  it('renders default appearance controls even when the survey has no appearance config yet', () => {
    const html = renderToStaticMarkup(
      <SurveyAppearanceCard
        onAppearanceChange={() => {}}
      />,
    );

    expect(html).toContain('Form Theme');
    expect(html).toContain('Background Color');
    expect(html).toContain('Primary Color');
    expect(html).toContain('Progress Bar');
    expect(html).toContain('value="#f4efe2"');
  });

  it('renders branding values in the editor when logo and cover image are configured', () => {
    const html = renderToStaticMarkup(
      <SurveyBrandingCard
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
        onBrandingChange={() => {}}
      />,
    );

    expect(html).toContain('https://example.com/logo.png');
    expect(html).toContain('Acme logo');
    expect(html).toContain('https://example.com/cover.png');
    expect(html).toContain('Office mural');
  });
});
