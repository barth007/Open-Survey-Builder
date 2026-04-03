import { describe, expect, it } from 'vitest';

import { evaluateAutomationRules } from '@/features/survey-response/lib/automation-rules';
import { buildInitialComputedFieldValues } from '@/features/survey-response/lib/expression-runtime';
import type { AutomationRule, ComputedFieldDefinition, Question } from '@/types/survey';

const questions: Question[] = [
  {
    id: 'q-hours',
    type: 'text',
    text: 'Hours',
    isRequired: false,
    options: [],
  },
  {
    id: 'q-rate',
    type: 'text',
    text: 'Rate',
    isRequired: false,
    options: [],
  },
  {
    id: 'q-name',
    type: 'text',
    text: 'Name',
    isRequired: false,
    options: [],
  },
  {
    id: 'q-plan',
    type: 'multipleChoice',
    text: 'Plan',
    isRequired: false,
    options: [
      { id: 'starter', text: 'Starter' },
      { id: 'enterprise', text: 'Enterprise' },
    ],
  },
  {
    id: 'q-budget',
    type: 'text',
    text: 'Budget',
    isRequired: false,
    options: [],
  },
  {
    id: 'q-contact',
    type: 'text',
    text: 'Contact',
    isRequired: false,
    options: [],
  },
];

const computedFields: ComputedFieldDefinition[] = [
  {
    id: 'computed-total',
    name: 'total',
    valueType: 'number',
    initialValue: 0,
  },
  {
    id: 'computed-greeting',
    name: 'greeting',
    valueType: 'text',
    initialValue: 'Hello ',
  },
];

describe('automation rules runtime', () => {
  it('applies calculate actions in rule order and exposes updated computed values', () => {
    const rules: AutomationRule[] = [
      {
        id: 'assign-hours',
        name: 'Assign total from hours',
        when: {
          operator: 'all',
          conditions: [
            {
              field: 'question:q-hours',
              operator: 'isAnswered',
            },
          ],
        },
        actions: [
          {
            type: 'calculate',
            targetField: 'total',
            operator: 'assign',
            operands: [
              {
                kind: 'field',
                value: 'question:q-hours',
              },
            ],
          },
        ],
      },
      {
        id: 'multiply-rate',
        name: 'Multiply total by rate',
        when: {
          operator: 'all',
          conditions: [
            {
              field: 'question:q-rate',
              operator: 'isAnswered',
            },
          ],
        },
        actions: [
          {
            type: 'calculate',
            targetField: 'total',
            operator: 'multiply',
            operands: [
              {
                kind: 'field',
                value: 'question:q-rate',
              },
            ],
          },
        ],
      },
      {
        id: 'greet-name',
        name: 'Append respondent name',
        when: {
          operator: 'all',
          conditions: [
            {
              field: 'question:q-name',
              operator: 'isAnswered',
            },
          ],
        },
        actions: [
          {
            type: 'calculate',
            targetField: 'greeting',
            operator: 'concatenate',
            operands: [
              {
                kind: 'field',
                value: 'question:q-name',
              },
            ],
          },
        ],
      },
    ];

    const runtime = evaluateAutomationRules(rules, {
      answers: {
        'q-hours': '4',
        'q-rate': '25',
        'q-name': 'Alice',
      },
      computedFields: buildInitialComputedFieldValues(computedFields),
      questions,
    });

    expect(runtime.computedFields.total).toBe(100);
    expect(runtime.computedFields.greeting).toBe('Hello Alice');
  });

  it('applies visibility, required, jump, redirect, and completion actions', () => {
    const rules: AutomationRule[] = [
      {
        id: 'enterprise-flow',
        name: 'Enterprise flow',
        when: {
          operator: 'all',
          conditions: [
            {
              field: 'question:q-plan',
              operator: 'equals',
              value: 'enterprise',
            },
          ],
        },
        actions: [
          {
            type: 'hide_question',
            targetQuestionId: 'q-budget',
          },
          {
            type: 'set_required',
            targetQuestionId: 'q-contact',
            required: true,
          },
          {
            type: 'jump_to_page',
            page: 3,
          },
          {
            type: 'set_completion_redirect',
            url: 'https://example.com/vip',
          },
          {
            type: 'disable_completion',
            disabled: true,
          },
        ],
      },
    ];

    const runtime = evaluateAutomationRules(rules, {
      answers: {
        'q-plan': 'enterprise',
      },
      computedFields: buildInitialComputedFieldValues(computedFields),
      questions,
    });

    expect(runtime.questionVisibility['q-budget']).toBe(false);
    expect(runtime.questionRequired['q-contact']).toBe(true);
    expect(runtime.jumpToPage).toBe(3);
    expect(runtime.completionRedirect).toBe('https://example.com/vip');
    expect(runtime.completionDisabled).toBe(true);
  });
});
