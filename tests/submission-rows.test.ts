import { describe, expect, it } from 'vitest';

import { buildSubmissionRows } from '@/features/survey-editor/lib/submission-rows';
import type { Survey, SurveyResponse } from '@/types/survey';

const survey: Survey = {
  id: 'survey-1',
  title: 'Customer survey',
  description: '',
  questions: [
    {
      id: 'q-1',
      type: 'text',
      blockType: 'shortText',
      text: 'How was it?',
      isRequired: false,
      options: [],
    },
    {
      id: 'q-2',
      type: 'multipleChoice',
      blockType: 'multipleChoice',
      text: 'Choose one',
      isRequired: false,
      options: [
        { id: 'opt-a', text: 'Alpha' },
        { id: 'opt-b', text: 'Beta' },
      ],
    },
  ],
  isPublished: true,
};

const responses: SurveyResponse[] = [
  {
    id: 'resp-older',
    surveyId: 'survey-1',
    submittedAt: '2026-03-24T10:00:00.000Z',
    answers: [
      {
        questionId: 'q-2',
        value: 'opt-a',
      },
    ],
  },
  {
    id: 'resp-newer',
    surveyId: 'survey-1',
    submittedAt: '2026-03-25T10:00:00.000Z',
    participantId: 'participant-1',
    metadata: {
      email: 'alex@example.com',
    },
    answers: [
      {
        questionId: 'q-2',
        value: 'opt-b',
      },
      {
        questionId: 'q-1',
        value: 'Loved it',
      },
    ],
  },
];

describe('submission row helpers', () => {
  it('builds sorted submission rows with readable previews and participant labels', () => {
    const rows = buildSubmissionRows(survey, responses);

    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.id)).toEqual(['resp-newer', 'resp-older']);
    expect(rows[0]).toEqual(
      expect.objectContaining({
        participantLabel: 'alex@example.com',
        answerCount: 2,
        hasRecording: false,
      }),
    );
    expect(rows[0].preview).toEqual([
      {
        questionId: 'q-1',
        questionLabel: 'How was it?',
        valueLabel: 'Loved it',
      },
      {
        questionId: 'q-2',
        questionLabel: 'Choose one',
        valueLabel: 'Beta',
      },
    ]);
    expect(rows[0].searchText).toContain('alex@example.com');
    expect(rows[0].searchText).toContain('beta');
    expect(rows[1].participantLabel).toBe('Anonymous');
  });
});
