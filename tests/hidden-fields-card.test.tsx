import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { HiddenFieldsCard } from '@/features/survey-editor/components/HiddenFieldsCard';

describe('hidden fields card', () => {
  it('renders hidden field rows with key, default value, and query override controls', () => {
    const html = renderToStaticMarkup(
      <HiddenFieldsCard
        hiddenFields={[
          {
            id: 'hidden-1',
            key: 'lead_id',
            defaultValue: 'fallback-123',
            allowQueryOverride: true,
          },
        ]}
        onHiddenFieldsChange={() => {}}
      />,
    );

    expect(html).toContain('Hidden Fields');
    expect(html).toContain('lead_id');
    expect(html).toContain('fallback-123');
    expect(html).toContain('Allow Query Override');
  });
});
