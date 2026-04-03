import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import QuestionInlineEditor from '@/features/survey-editor/components/QuestionInlineEditor';
import type { Question } from '@/types/survey';

describe('question inline editor', () => {
  it('renders content blocks as editable textareas in the canvas', () => {
    const question: Question = {
      id: 'content-title',
      type: 'content',
      blockType: 'title',
      contentKind: 'title',
      text: 'Quarterly NPS',
      description: '',
      isRequired: false,
      options: [],
    };

    const html = renderToStaticMarkup(
      <QuestionInlineEditor
        question={question}
        isActive
        onActivate={() => {}}
        onQuestionChange={() => {}}
      />,
    );

    expect(html).toContain('<textarea');
    expect(html).toContain('Quarterly NPS');
    expect(html).toContain('Page title');
  });

  it('preserves the card shell even when the block is active', () => {
    const question: Question = {
      id: 'question-card',
      type: 'multipleChoice',
      blockType: 'multipleChoice',
      text: 'How satisfied are you?',
      description: 'Choose one option',
      isRequired: false,
      options: [
        { id: 'a', text: 'Very satisfied' },
        { id: 'b', text: 'Neutral' },
      ],
    };

    const html = renderToStaticMarkup(
      <QuestionInlineEditor
        question={question}
        isActive
        onActivate={() => {}}
        onQuestionChange={() => {}}
      />,
    );

    expect(html).toContain('rounded-[32px]');
    expect(html).toContain('border-border/70');
    expect(html).not.toContain('bg-primary/[0.04]');
    expect(html).not.toContain('ring-primary/20');
  });

  it('keeps inline editing controls for media blocks', () => {
    const question: Question = {
      id: 'content-image',
      type: 'content',
      blockType: 'image',
      contentKind: 'image',
      text: 'Hero image',
      description: '',
      isRequired: false,
      options: [],
    };

    const html = renderToStaticMarkup(
      <QuestionInlineEditor
        question={question}
        isActive
        onActivate={() => {}}
        onQuestionChange={() => {}}
      />,
    );

    expect(html).toContain('Hero image');
    expect(html).toContain('Upload image');
    expect(html).toContain('<textarea');
  });

  it('renders dropdown blocks with a select-style preview so turn-into is visible in the editor', () => {
    const question: Question = {
      id: 'choice-dropdown',
      type: 'multipleChoice',
      blockType: 'dropdown',
      text: 'Department',
      description: '',
      isRequired: false,
      options: [
        { id: 'design', text: 'Design' },
        { id: 'engineering', text: 'Engineering' },
      ],
    };

    const html = renderToStaticMarkup(
      <QuestionInlineEditor
        question={question}
        isActive={false}
        onQuestionChange={() => {}}
      />,
    );

    expect(html).toContain('Select an option');
    expect(html).toContain('<select');
  });
});
