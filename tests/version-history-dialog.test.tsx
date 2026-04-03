import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { VersionHistoryDialog } from '@/features/survey-editor/components/VersionHistoryDialog';

describe('version history dialog', () => {
  it('renders revisions with restore actions and snapshot summaries', () => {
    const html = renderToStaticMarkup(
      <VersionHistoryDialog
        open={true}
        onOpenChange={() => {}}
        revisions={[
          {
            id: 'revision-1',
            label: 'Hiring survey',
            createdAt: '2026-04-01T18:00:00.000Z',
            restoredAt: null,
            snapshot: {
              name: 'Hiring survey',
              questions: [{ id: 'q-1' }, { id: 'q-2' }],
            },
          },
        ]}
        isRestoring={false}
        onRestore={() => {}}
      />,
    );

    expect(html).toContain('Version History');
    expect(html).toContain('Hiring survey');
    expect(html).toContain('2 questions');
    expect(html).toContain('Restore draft');
  });
});
