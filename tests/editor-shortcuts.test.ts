import { describe, expect, it } from 'vitest';

import { getActiveQuestionShortcutAction } from '@/features/survey-editor/lib/editor-shortcuts';
import type { Question } from '@/types/survey';

const multipleChoiceQuestion: Question = {
  id: 'choice-1',
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

const contentQuestion: Question = {
  id: 'content-1',
  type: 'content',
  blockType: 'title',
  contentKind: 'title',
  text: 'Page title',
  description: '',
  isRequired: false,
  options: [],
};

const shortcutEvent = (key: string, shiftKey = false) => ({
  key,
  ctrlKey: true,
  metaKey: false,
  shiftKey,
});

describe('editor shortcuts', () => {
  it('allows bulk insert only for choice-style questions', () => {
    expect(getActiveQuestionShortcutAction(shortcutEvent('o', true), multipleChoiceQuestion)).toBe('bulk-insert');
    expect(getActiveQuestionShortcutAction(shortcutEvent('o', true), contentQuestion)).toBeNull();
  });

  it('exposes a dedicated logic shortcut only for editable question blocks', () => {
    expect(getActiveQuestionShortcutAction(shortcutEvent('l', true), multipleChoiceQuestion)).toBe('toggle-logic');
    expect(getActiveQuestionShortcutAction(shortcutEvent('l', true), contentQuestion)).toBeNull();
  });
});
