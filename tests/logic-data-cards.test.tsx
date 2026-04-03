import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AutomationRulesCard } from '@/features/survey-editor/components/AutomationRulesCard';
import { ComputedFieldsCard } from '@/features/survey-editor/components/ComputedFieldsCard';

describe('logic and data editor cards', () => {
  it('renders the computed fields editor with existing fields', () => {
    const html = renderToStaticMarkup(
      <ComputedFieldsCard
        computedFields={[
          {
            id: 'computed-total',
            name: 'total',
            valueType: 'number',
            initialValue: 0,
          },
        ]}
        onComputedFieldsChange={() => {}}
      />,
    );

    expect(html).toContain('Computed Fields');
    expect(html).toContain('total');
  });

  it('renders the automation rules editor with existing rules', () => {
    const html = renderToStaticMarkup(
      <AutomationRulesCard
        automationRules={[
          {
            id: 'rule-1',
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
                type: 'jump_to_page',
                page: 3,
              },
            ],
          },
        ]}
        onAutomationRulesChange={() => {}}
      />,
    );

    expect(html).toContain('Automation Rules');
    expect(html).toContain('Enterprise flow');
  });
});
