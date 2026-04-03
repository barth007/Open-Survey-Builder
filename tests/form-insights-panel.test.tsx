import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { FormInsightsPanel } from '@/features/survey-analysis/components/FormInsightsPanel';

describe('form insights panel', () => {
  it('renders overview metrics and question drop-off rows', () => {
    const html = renderToStaticMarkup(
      <FormInsightsPanel
        insights={{
          overview: {
            views: 120,
            starts: 80,
            submissions: 32,
            conversionRate: 26.7,
          },
          questionDropOff: [
            {
              questionId: 'q-1',
              questionLabel: 'How did you hear about us?',
              reachedCount: 70,
              dropOffCount: 12,
            },
          ],
        }}
      />,
    );

    expect(html).toContain('Form Insights');
    expect(html).toContain('120');
    expect(html).toContain('26.7%');
    expect(html).toContain('How did you hear about us?');
    expect(html).toContain('12');
  });
});
