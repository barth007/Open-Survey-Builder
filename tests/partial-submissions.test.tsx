import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { SubmissionsTableView } from '@/features/survey-editor/components/SubmissionsTableView';
import type { Survey, SurveyResponse } from '@/types/survey';

const survey: Survey = {
  id: 'survey-1',
  title: 'Candidate Feedback',
  description: 'Collecting interview responses',
  isPublished: true,
  questions: [
    {
      id: 'q-1',
      type: 'text',
      blockType: 'shortText',
      text: 'How did it go?',
      isRequired: false,
      options: [],
    },
  ],
};

const responses: SurveyResponse[] = [
  {
    id: 'resp-1',
    surveyId: survey.id,
    status: 'submitted',
    participantId: 'participant-1',
    submittedAt: '2026-04-01T10:00:00.000Z',
    metadata: { email: 'submitted@example.com' },
    answers: [
      {
        questionId: 'q-1',
        value: 'Great',
      },
    ],
  },
  {
    id: 'resp-2',
    surveyId: survey.id,
    status: 'partial',
    participantId: 'participant-2',
    submittedAt: '2026-04-01T11:00:00.000Z',
    metadata: { email: 'partial@example.com' },
    answers: [
      {
        questionId: 'q-1',
        value: 'Still typing',
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

describe('partial submissions visibility', () => {
  it('shows status labels for submitted and partial responses in the submissions table', () => {
    const html = renderWithQueryClient(
      <SubmissionsTableView
        survey={survey}
        responses={responses}
      />,
    );

    expect(html).toContain('Submitted');
    expect(html).toContain('Partial');
    expect(html).toContain('partial@example.com');
  });
});
