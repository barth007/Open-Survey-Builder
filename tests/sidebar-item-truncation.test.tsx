import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DndContext } from '@dnd-kit/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { SidebarProvider } from '@/components/ui/sidebar';
import { FolderItem } from '@/features/survey-editor/components/FolderItem';
import { DraggableSurveyItem } from '@/features/survey-editor/components/SurveyItem';
import type { Survey, SurveyFolder } from '@/types/survey-organization';

vi.mock('@/hooks/survey/useMutateSurvey', () => ({
  useMutateSurvey: () => ({
    updateSurvey: vi.fn(),
    duplicateSurvey: vi.fn(),
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');

  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ id: 'survey-1' }),
  };
});

vi.mock('@/features/survey-editor/components/MoveSurveyDialog', () => ({
  MoveSurveyDialog: () => null,
}));

const longSurvey: Survey = {
  id: 'survey-1',
  name: 'This is a very long survey title that should stay inside the sidebar button without spilling outside',
  createdAt: '2026-04-01T10:00:00.000Z',
};

const longFolder: SurveyFolder = {
  id: 'folder-1',
  name: 'This is a very long folder title that should stay inside the sidebar button without spilling outside',
  surveys: [],
};

const renderWithProviders = (node: React.ReactElement) => {
  const queryClient = new QueryClient();

  return renderToStaticMarkup(
    <QueryClientProvider client={queryClient}>
      <SidebarProvider defaultOpen>
        <DndContext>
          {node}
        </DndContext>
      </SidebarProvider>
    </QueryClientProvider>,
  );
};

describe('sidebar item truncation', () => {
  it('keeps long survey titles inside the sidebar button layout', () => {
    const html = renderWithProviders(
      <DraggableSurveyItem
        survey={longSurvey}
        onDelete={() => {}}
        onUpdateOrder={() => {}}
        folders={[]}
      />,
    );

    expect(html).toContain('min-w-0 flex-1');
    expect(html).toContain('truncate');
  });

  it('keeps long folder titles inside the sidebar button layout', () => {
    const html = renderWithProviders(
      <FolderItem
        folder={longFolder}
        isOpen={false}
        onToggle={() => {}}
        onDelete={() => {}}
        onCreateSurvey={() => {}}
        onDeleteSurvey={() => {}}
        onUpdateOrder={() => {}}
        folders={[]}
      />,
    );

    expect(html).toContain('min-w-0 flex-1');
    expect(html).toContain('truncate');
  });
});
