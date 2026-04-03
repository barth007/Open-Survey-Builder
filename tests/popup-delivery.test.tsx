import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { DeliveryModesCard } from '@/features/survey-editor/components/DeliveryModesCard';

describe('popup delivery card', () => {
  it('renders popup trigger and presentation settings', () => {
    const html = renderToStaticMarkup(
      <DeliveryModesCard
        publicCode="public-1"
        delivery={{
          popup: {
            enabled: true,
            openMode: 'elapsed_time',
            delaySeconds: 8,
            position: 'bottom_right',
            widthPx: 420,
            showOnce: true,
            preserveQueryParams: true,
          },
        }}
        onDeliveryChange={() => {}}
      />,
    );

    expect(html).toContain('Delivery Modes');
    expect(html).toContain('Popup Form');
    expect(html).toContain('value="8"');
    expect(html).toContain('value="420"');
  });
});
