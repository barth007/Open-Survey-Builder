import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { QuestionSettingsPopover } from '@/features/survey-editor/components/QuestionSettingsPopover';
import type { Question } from '@/types/survey';

describe('question settings popover', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      innerWidth: 1440,
      innerHeight: 900,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders hidden field configuration instead of the compact action-only view', () => {
    const question: Question = {
      id: 'hidden-1',
      type: 'hiddenField',
      blockType: 'hiddenField',
      text: '',
      description: '',
      isRequired: false,
      options: [],
      fieldKey: 'utm_source',
      fieldDefaultValue: 'direct',
    };

    const html = renderToStaticMarkup(
      <QuestionSettingsPopover
        question={question}
        questions={[question]}
        anchorRect={{
          left: 600,
          right: 880,
          top: 120,
          bottom: 200,
          width: 280,
          height: 80,
          x: 600,
          y: 120,
          toJSON: () => ({}),
        } as DOMRect}
        onQuestionChange={() => {}}
        onDelete={() => {}}
        onDuplicate={() => {}}
        onBulkInsert={() => {}}
        onClose={() => {}}
      />,
    );

    expect(html).toContain('Field key');
    expect(html).toContain('Default value');
    expect(html).toContain('utm_source');
  });

  it('shows only supported question settings in the canvas popover', () => {
    const question: Question = {
      id: 'choice-1',
      type: 'multipleChoice',
      blockType: 'multipleChoice',
      text: 'Pick one',
      description: '',
      isRequired: false,
      options: [
        { id: 'a', text: 'Alpha' },
        { id: 'b', text: 'Beta' },
      ],
    };

    const html = renderToStaticMarkup(
      <QuestionSettingsPopover
        question={question}
        questions={[question]}
        anchorRect={{
          left: 600,
          right: 880,
          top: 120,
          bottom: 200,
          width: 280,
          height: 80,
          x: 600,
          y: 120,
          toJSON: () => ({}),
        } as DOMRect}
        onQuestionChange={() => {}}
        onDelete={() => {}}
        onDuplicate={() => {}}
        onBulkInsert={() => {}}
        onClose={() => {}}
      />,
    );

    expect(html).toContain('Required');
    expect(html).toContain('Badge');
    expect(html).not.toContain('Default answer');
    expect(html).not.toContain('"Other" option');
    expect(html).not.toContain('Randomize options');
    expect(html).not.toContain('Multiple selection');
    expect(html).not.toContain('Color-code options');
  });
});
