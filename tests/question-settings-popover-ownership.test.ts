import { describe, expect, it, vi } from 'vitest';

import {
  QUESTION_SETTINGS_PORTAL_SELECTOR,
  isQuestionSettingsOwnedTarget,
} from '@/features/survey-editor/lib/question-settings-popover';

describe('question settings popover ownership', () => {
  it('treats tagged portal content as inside the popover interaction tree', () => {
    const root = {
      contains: vi.fn(() => false),
    };
    const target = {
      closest: vi.fn((selector: string) =>
        selector === QUESTION_SETTINGS_PORTAL_SELECTOR ? { id: 'owned-portal' } : null,
      ),
    };

    expect(isQuestionSettingsOwnedTarget(root, target)).toBe(true);
  });

  it('treats unrelated targets as outside the popover', () => {
    const root = {
      contains: vi.fn(() => false),
    };
    const target = {
      closest: vi.fn(() => null),
    };

    expect(isQuestionSettingsOwnedTarget(root, target)).toBe(false);
  });
});
