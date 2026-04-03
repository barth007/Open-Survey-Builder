import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { QuestionRenderer } from '@/features/survey-response/components/QuestionRenderer';
import type { Question } from '@/types/survey';

describe('question renderer turn-into variants', () => {
  it('renders title blocks with title styling instead of the generic content fallback', () => {
    const question: Question = {
      id: 'title-1',
      type: 'content',
      blockType: 'title',
      contentKind: 'title',
      text: 'Candidate Satisfaction',
      description: '',
      isRequired: false,
      options: [],
    };

    const html = renderToStaticMarkup(
      <QuestionRenderer
        question={question}
        answers={{}}
        onAnswerChange={() => {}}
      />,
    );

    expect(html).toContain('text-5xl');
    expect(html).toContain('Candidate Satisfaction');
    expect(html).not.toContain('text-muted-foreground');
  });

  it('renders multi-select blocks as a multiple select control', () => {
    const question: Question = {
      id: 'multi-1',
      type: 'checkboxes',
      blockType: 'multiSelect',
      text: 'Teams',
      description: '',
      isRequired: false,
      options: [
        { id: 'sales', text: 'Sales' },
        { id: 'support', text: 'Support' },
      ],
    };

    const html = renderToStaticMarkup(
      <QuestionRenderer
        question={question}
        answers={{}}
        onAnswerChange={() => {}}
      />,
    );

    expect(html).toContain('<select');
    expect(html).toContain('multiple=""');
    expect(html).toContain('Sales');
    expect(html).toContain('Support');
  });
});
