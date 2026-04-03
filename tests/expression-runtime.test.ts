import { describe, expect, it } from 'vitest';

import { evaluateConditionGroup, evaluateLegacyConditionalLogic, getFieldReferenceValue } from '@/features/survey-response/lib/expression-runtime';
import type { Question } from '@/types/survey';

const questions: Question[] = [
  {
    id: 'q-name',
    type: 'text',
    text: 'What is your name?',
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

describe('expression runtime', () => {
  it('resolves field references from answers, hidden fields, computed fields, and metadata', () => {
    const context = {
      answers: {
        'q-name': 'Alice',
      },
      hiddenFields: {
        lead_id: 'lead-123',
      },
      computedFields: {
        score: 42,
      },
      meta: {
        respondentId: 'resp-1',
      },
      questions,
    };

    expect(getFieldReferenceValue('question:q-name', context)).toBe('Alice');
    expect(getFieldReferenceValue('hidden:lead_id', context)).toBe('lead-123');
    expect(getFieldReferenceValue('computed:score', context)).toBe(42);
    expect(getFieldReferenceValue('meta:respondentId', context)).toBe('resp-1');
  });

  it('evaluates nested all/any condition groups', () => {
    const context = {
      answers: {
        'q-name': 'Alice',
        'q-role': 'eng',
      },
      hiddenFields: {
        campaign: 'spring-launch',
      },
      computedFields: {
        score: 42,
      },
      questions,
    };

    expect(evaluateConditionGroup({
      operator: 'all',
      conditions: [
        {
          field: 'question:q-name',
          operator: 'equals',
          value: 'Alice',
        },
        {
          operator: 'any',
          conditions: [
            {
              field: 'hidden:campaign',
              operator: 'equals',
              value: 'spring-launch',
            },
            {
              field: 'computed:score',
              operator: 'greaterThan',
              value: 50,
            },
          ],
        },
      ],
    }, context)).toBe(true);
  });

  it('keeps legacy conditional logic working while supporting explicit field references', () => {
    const context = {
      answers: {
        'q-role': ['eng', 'des'],
      },
      hiddenFields: {
        lead_id: 'lead-123',
      },
      questions,
    };

    expect(evaluateLegacyConditionalLogic({
      dependsOn: 'q-role',
      operator: 'equals',
      value: 'eng',
    }, context)).toBe(true);

    expect(evaluateLegacyConditionalLogic({
      dependsOn: 'hidden:lead_id',
      operator: 'equals',
      value: 'lead-123',
    }, context)).toBe(true);
  });
});
