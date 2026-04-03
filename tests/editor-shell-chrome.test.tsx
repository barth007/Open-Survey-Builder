import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { SidebarProvider } from '@/components/ui/sidebar';
import { SurveyNavigationHeader } from '@/features/survey-editor/components/SurveyNavigationHeader';
import { SurveySidebar } from '@/features/survey-editor/components/SurveySidebar';
import type { Survey } from '@/types/survey';

vi.mock('@/hooks/useSurveyData', () => ({
  useSurveyData: () => ({
    surveyData: {
      folders: [],
      unorganizedSurveys: [
        { id: 'survey-1', name: 'Candidate Feedback' },
      ],
    },
    isLoading: false,
    createFolder: vi.fn(),
    createSurvey: vi.fn(),
    deleteFolder: vi.fn(),
    deleteSurvey: vi.fn(),
    updateSurveyOrder: vi.fn(),
    updateFolder: vi.fn(),
  }),
}));

vi.mock('@/components/UserProfile', () => ({
  default: ({ compact = false }: { compact?: boolean }) => (
    <div>{compact ? 'Compact profile' : 'Full profile'}</div>
  ),
}));

vi.mock('@/features/survey-editor/components/SurveyFolders', () => ({
  SurveyFolders: () => <div>Folders list</div>,
}));

vi.mock('@/features/survey-editor/components/UnorganizedSurveys', () => ({
  UnorganizedSurveys: () => <div>Unorganized surveys</div>,
}));

vi.mock('@/providers/auth/AuthProvider', () => ({
  useAuth: () => ({
    user: {
      id: 'user-1',
      name: 'Jane Editor',
      email: 'jane@example.com',
      avatarUrl: null,
    },
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

vi.mock('@/features/survey-editor/components/ShareSurveyButton', () => ({
  ShareSurveyButton: () => <div>Share action</div>,
}));

const survey: Survey = {
  id: 'survey-1',
  title: 'Candidate Feedback',
  description: 'Collecting structured feedback',
  isPublished: true,
  questions: [],
};

describe('editor shell chrome', () => {
  it('renders a denser sidebar shell instead of the older oversized frame', () => {
    const queryClient = new QueryClient();
    const html = renderToStaticMarkup(
      <QueryClientProvider client={queryClient}>
        <SidebarProvider defaultOpen>
          <SurveySidebar />
        </SidebarProvider>
      </QueryClientProvider>,
    );

    expect(html).toContain('Search surveys');
    expect(html).toContain('--sidebar-width:15.5rem');
    expect(html).not.toContain('w-72');
    expect(html).not.toContain('SurveyPro');
  });

  it('renders a header with a sidebar toggle and content-aligned inner shell', () => {
    const queryClient = new QueryClient();
    const html = renderToStaticMarkup(
      <QueryClientProvider client={queryClient}>
        <SidebarProvider defaultOpen>
          <SurveyNavigationHeader
            activeUsers={[
              {
                id: 'user-1',
                name: 'Jane Editor',
                avatarUrl: null,
                lastActive: new Date('2026-03-25T12:00:00.000Z'),
              },
            ]}
            survey={survey}
            lastSaved={new Date('2026-03-25T11:58:00.000Z')}
          />
        </SidebarProvider>
      </QueryClientProvider>,
    );

    expect(html).toContain('Toggle Sidebar');
    expect(html).toContain('max-w-6xl');
    expect(html).toContain('Share action');
    expect(html).not.toContain('w-[1px]');
  });
});
