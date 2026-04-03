import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import Dashboard from '@/features/dashboard/pages/Dashboard';

vi.mock('@/hooks/useSurveyData', () => ({
  useSurveyData: () => ({
    surveyData: {
      folders: [
        {
          id: 'folder-1',
          name: 'Research Ops',
          surveys: [
            {
              id: 'survey-1',
              name: 'Hidden while collapsed',
              createdAt: '2026-04-01T10:00:00.000Z',
            },
          ],
        },
      ],
      unorganizedSurveys: [],
    },
    isLoading: false,
    error: null,
    createSurvey: vi.fn(),
  }),
}));

vi.mock('@/hooks/useActiveUsers', () => ({
  useActiveUsers: () => ({
    activeUsers: [],
  }),
}));

vi.mock('@/features/survey-editor/components/SurveySidebar', () => ({
  SurveySidebar: () => <div>Sidebar</div>,
}));

vi.mock('@/features/survey-editor/components/SurveyNavigationHeader', () => ({
  SurveyNavigationHeader: () => <div>Header</div>,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');

  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('dashboard folder shell', () => {
  it('renders dashboard folders as dedicated toggle buttons with collapsed content by default', () => {
    const queryClient = new QueryClient();
    const html = renderToStaticMarkup(
      <QueryClientProvider client={queryClient}>
        <Dashboard />
      </QueryClientProvider>,
    );

    expect(html).toContain('Toggle folder Research Ops');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('Folder');
    expect(html).toContain('1 Survey');
    expect(html).not.toContain('Hidden while collapsed');
  });
});
