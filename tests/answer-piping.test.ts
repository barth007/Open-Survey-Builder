import { describe, expect, it } from 'vitest';

import { renderPipedText } from '@/features/survey-response/lib/answer-piping';
import type { Question } from '@/types/survey';

const questions: Question[] = [
  {
    id: 'q-name',
    type: 'text',
    text: 'Name',
    isRequired: false,
    options: [],
  },
  {
    id: 'q-role',
    type: 'multipleChoice',
    text: 'Role',
    isRequired: false,
    options: [
      { id: 'eng', text: 'Engineer' },
      { id: 'des', text: 'Designer' },
    ],
  },
];

describe('answer piping', () => {
  it('pipes answer, hidden field, and computed values into text', () => {
    const result = renderPipedText(
      'Hi {{question:q-name}}, role: {{question:q-role}}, lead: {{hidden:lead_id}}, score: {{computed:score}}',
      {
        answers: {
          'q-name': 'Alice',
          'q-role': 'eng',
        },
        hiddenFields: {
          lead_id: 'lead-123',
        },
        computedFields: {
          score: 42,
        },
        questions,
      },
    );

    expect(result).toBe('Hi Alice, role: Engineer, lead: lead-123, score: 42');
  });

  it('uses the provided fallback when the reference is empty', () => {
    const result = renderPipedText(
      'Hello {{question:q-missing|friend}}',
      {
        answers: {},
        questions,
      },
    );

    expect(result).toBe('Hello friend');
  });
});
