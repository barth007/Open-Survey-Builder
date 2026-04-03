import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { SortableQuestionCard } from '@/features/survey-editor/components/SortableQuestionCard';
import type { Question } from '@/types/survey';

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: () => undefined,
    },
  },
}));

describe('sortable question card menu', () => {
  it('renders a left rail options affordance instead of relying on clicking the card body', () => {
    const question: Question = {
      id: 'q-1',
      type: 'multipleChoice',
      blockType: 'multipleChoice',
      text: 'Pick one',
      description: '',
      isRequired: false,
      options: [
        { id: 'a', text: 'A' },
        { id: 'b', text: 'B' },
      ],
    };

    const html = renderToStaticMarkup(
      <SortableQuestionCard
        question={question}
        questions={[question]}
        isActive={false}
        onActivateQuestion={() => {}}
        onQuestionChange={() => {}}
        onDeleteQuestion={() => {}}
      />,
    );

    expect(html).toContain('Block options');
    expect(html).toContain('Add block below');
    expect(html).toContain('Drag to reorder');
  });
});
