import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { QuestionRenderer } from '@/features/survey-response/components/QuestionRenderer';
import { LikertScaleRenderer } from '@/features/survey-response/components/LikertScaleRenderer';
import type { Question } from '@/types/survey';

describe('question renderer settings', () => {
  it('renders numbered badges for multiple choice when configured', () => {
    const question: Question = {
      id: 'choice-1',
      type: 'multipleChoice',
      blockType: 'multipleChoice',
      text: 'Pick one',
      description: '',
      isRequired: false,
      badgeType: 'numbers',
      options: [
        { id: 'a', text: 'Alpha' },
        { id: 'b', text: 'Beta' },
      ],
    };

    const html = renderToStaticMarkup(
      <QuestionRenderer
        question={question}
        answers={{}}
        onAnswerChange={() => {}}
      />,
    );

    expect(html).toContain('>1<');
    expect(html).toContain('>2<');
    expect(html).not.toContain('>A<');
  });

  it('renders linear scale labels when configured', () => {
    const question: Question = {
      id: 'scale-1',
      type: 'likert10',
      blockType: 'linearScale',
      text: 'Rate the experience',
      description: '',
      isRequired: false,
      scaleLeftLabel: 'Poor',
      scaleCenterLabel: 'Average',
      scaleRightLabel: 'Excellent',
      options: [
        { id: '1', text: '1' },
        { id: '2', text: '2' },
        { id: '3', text: '3' },
      ],
    };

    const html = renderToStaticMarkup(
      <LikertScaleRenderer
        question={question}
        value=""
        onChange={() => {}}
      />,
    );

    expect(html).toContain('Poor');
    expect(html).toContain('Average');
    expect(html).toContain('Excellent');
  });
});
