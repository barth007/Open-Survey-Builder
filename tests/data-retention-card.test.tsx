import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { DataRetentionCard } from '@/features/survey-editor/components/DataRetentionCard';

describe('data retention card', () => {
  it('renders configured retention and trash grace controls', () => {
    const html = renderToStaticMarkup(
      <DataRetentionCard
        retention={{
          enabled: true,
          value: 90,
          unit: 'days',
          trashGracePeriodDays: 14,
        }}
        onRetentionChange={() => {}}
      />,
    );

    expect(html).toContain('Data Retention');
    expect(html).toContain('value="90"');
    expect(html).toContain('value="14"');
    expect(html).toContain('Trash Grace Period');
  });
});
