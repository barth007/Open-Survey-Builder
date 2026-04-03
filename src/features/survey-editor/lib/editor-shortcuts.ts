import type { Question } from '@/types/survey';

import { getNormalizedBlockType, isContentBlock } from '@/features/survey-editor/lib/editor-blocks';

export type ActiveQuestionShortcutAction =
  | 'close'
  | 'delete'
  | 'duplicate'
  | 'toggle-visibility'
  | 'bulk-insert'
  | 'toggle-logic';

interface ShortcutKeyState {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
}

const choiceShortcutBlockTypes = new Set([
  'multipleChoice',
  'dropdown',
  'checkboxes',
  'multiSelect',
]);

const isSystemBlock = (question: Question): boolean =>
  question.type === 'hiddenField' || question.type === 'calculatedField';

export const supportsBulkInsertShortcut = (question: Question | null | undefined): boolean => {
  if (!question) {
    return false;
  }

  return choiceShortcutBlockTypes.has(getNormalizedBlockType(question));
};

export const supportsLogicShortcut = (question: Question | null | undefined): boolean => {
  if (!question) {
    return false;
  }

  return !isContentBlock(question) && !isSystemBlock(question);
};

export const getActiveQuestionShortcutAction = (
  event: ShortcutKeyState,
  question: Question | null | undefined,
): ActiveQuestionShortcutAction | null => {
  const key = event.key.toLowerCase();
  const hasModifier = event.ctrlKey || event.metaKey;

  if (event.key === 'Escape') {
    return 'close';
  }

  if (event.key === 'Delete') {
    return 'delete';
  }

  if (hasModifier && !event.shiftKey && key === 'd') {
    return 'duplicate';
  }

  if (hasModifier && event.shiftKey && key === 'h') {
    return 'toggle-visibility';
  }

  if (hasModifier && event.shiftKey && key === 'o' && supportsBulkInsertShortcut(question)) {
    return 'bulk-insert';
  }

  if (hasModifier && event.shiftKey && key === 'l' && supportsLogicShortcut(question)) {
    return 'toggle-logic';
  }

  return null;
};
