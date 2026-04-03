import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ShareMetadataCard } from '@/features/survey-editor/components/ShareMetadataCard';

describe('share metadata card', () => {
  it('renders og metadata and indexing controls', () => {
    const html = renderToStaticMarkup(
      <ShareMetadataCard
        shareMeta={{
          ogTitle: 'Hiring survey',
          ogDescription: 'Collect structured feedback from candidates.',
          ogImageUrl: 'https://example.com/og.png',
        }}
        seo={{
          allowIndexing: false,
        }}
        onShareMetaChange={() => {}}
        onSeoChange={() => {}}
      />,
    );

    expect(html).toContain('Share Metadata');
    expect(html).toContain('Hiring survey');
    expect(html).toContain('Collect structured feedback from candidates.');
    expect(html).toContain('https://example.com/og.png');
    expect(html).toContain('Search Indexing');
  });
});
