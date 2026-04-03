import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { EditorInsertGuide } from '@/features/survey-editor/components/EditorInsertGuide';

describe('EditorInsertGuide', () => {
  it('renders the prominent variant as a stronger empty-state call to action', () => {
    const html = renderToStaticMarkup(
      <EditorInsertGuide
        prominent
        label="Add your first block"
        description="Insert a question, content, or media block between the start page and the completion page."
        onInsert={vi.fn()}
      />,
    );

    expect(html).toContain('Add your first block');
    expect(html).toContain('Start here');
    expect(html).toContain('bg-[radial-gradient(circle_at_top');
    expect(html).toContain('bg-[#111111]');
    expect(html).toContain('text-white');
  });

  it('keeps the standard insert rail for non-prominent usage', () => {
    const html = renderToStaticMarkup(
      <EditorInsertGuide
        label="Insert block here"
        onInsert={vi.fn()}
      />,
    );

    expect(html).toContain('Insert block here');
    expect(html).not.toContain('Start here');
    expect(html).not.toContain('bg-[#111111]');
  });
});
