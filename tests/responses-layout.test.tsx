import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import AnswersTab from '@/features/survey-editor/components/AnswersTab';
import { SubmissionsTableView } from '@/features/survey-editor/components/SubmissionsTableView';
import { SummaryCard } from '@/features/survey-editor/components/SummaryCard';
import type { Survey, SurveyResponse } from '@/types/survey';

vi.mock('@/hooks/survey/useDeleteResponses', () => ({
  useDeleteResponses: () => ({
    deleteResponsesByParticipant: vi.fn(),
    isDeleting: false,
  }),
}));

vi.mock('@/features/survey-editor/components/DeleteResponsesDialog', () => ({
  DeleteResponsesDialog: () => null,
}));

vi.mock('@/features/survey-editor/components/ResponseDebugView', () => ({
  ResponseDebugView: () => null,
}));

vi.mock('@/features/survey-analysis/components/ResponseChartRenderer', () => ({
  ResponseChartRenderer: () => <div>Mock chart</div>,
}));

const survey: Survey = {
  id: 'survey-1',
  title: 'Candidate Feedback',
  description: 'Collecting interview responses',
  isPublished: true,
  questions: [
    {
      id: 'q-1',
      type: 'multipleChoice',
      blockType: 'multipleChoice',
      text: 'How did the interview go?',
      isRequired: true,
      options: [
        { id: 'opt-1', text: 'Great' },
        { id: 'opt-2', text: 'Okay' },
      ],
    },
  ],
};

const responses: SurveyResponse[] = [
  {
    id: 'resp-1',
    surveyId: survey.id,
    participantId: 'participant-1',
    submittedAt: '2026-03-25T09:15:00.000Z',
    metadata: { email: 'person@example.com' },
    answers: [
      {
        questionId: 'q-1',
        value: 'opt-1',
      },
    ],
  },
];

const renderWithQueryClient = (node: React.ReactElement) => {
  const queryClient = new QueryClient();

  return renderToStaticMarkup(
    <QueryClientProvider client={queryClient}>
      {node}
    </QueryClientProvider>,
  );
};

describe('responses layout shell', () => {
  it('does not render the old responses hero or insights-rail controls in summary mode', () => {
    const html = renderWithQueryClient(
      <AnswersTab
        survey={survey}
        responses={responses}
        submissionResponses={responses}
        filteredResponses={[
          {
            questionId: 'q-1',
            question: 'How did the interview go?',
            responses: [{ answer: 'Great', count: 1, percentage: 100 }],
            likert: false,
            questionType: 'multipleChoice',
            isOrphaned: false,
          },
        ]}
        totalResponses={1}
        filterText=""
        setFilterText={() => { }}
        sortBy="default"
        setSortBy={() => { }}
        chartType={{}}
        handleChartTypeChange={() => { }}
        exportToCSV={() => { }}
      />,
    );

    expect(html).not.toContain('Review responses in cleaner, separated modes');
    expect(html).not.toContain('Show insights');
    expect(html).not.toContain('Hide insights');
    expect(html).not.toContain('Question analysis');
    expect(html).not.toContain('bg-[#fafaf8]');
    expect(html).toContain('max-w-6xl');
    expect(html).toContain('Summary');
    expect(html).toContain('Submissions');
  });

  it('does not use branded copy in the summary shell', () => {
    const html = renderWithQueryClient(
      <SummaryCard
        responses={responses}
        stats={{
          totalResponses: 1,
          matchedQuestions: 1,
          orphanedResponses: 0,
          questionsWithResponses: 1,
          questionsWithoutResponses: 0,
        }}
      />,
    );

    expect(html).not.toContain('Tstyle');
    expect(html).not.toContain('A Tstyle summary of how the form is performing');
  });

  it('does not narrate the submissions view with the old explainer headline', () => {
    const html = renderWithQueryClient(
      <SubmissionsTableView
        survey={survey}
        responses={responses}
      />,
    );

    expect(html).not.toContain('stacked analytics feed');
    expect(html).not.toContain('Review each submission as a clean table instead of a stacked analytics feed');
  });
});
