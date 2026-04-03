import { describe, expect, it } from 'vitest';

import { buildEmbedSnippet } from '@/lib/embed-snippet';

describe('embed snippet', () => {
  it('builds a deterministic popup snippet from delivery settings', () => {
    const snippet = buildEmbedSnippet({
      publicCode: 'public-1',
      delivery: {
        popup: {
          enabled: true,
          openMode: 'scroll',
          scrollPercent: 60,
          position: 'center',
          widthPx: 480,
          darkOverlay: true,
          preserveQueryParams: true,
        },
      },
    });

    expect(snippet).toContain('public-1');
    expect(snippet).toContain('scroll');
    expect(snippet).toContain('"scrollPercent":60');
    expect(snippet).toContain('iframe');
  });
});
