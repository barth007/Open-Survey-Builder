import { describe, expect, it } from 'vitest';

import {
  EDITOR_BLOCKS,
  createQuestionFromBlock,
  getBlockDefinition,
  isBlockAvailable,
} from '@/features/survey-editor/lib/editor-blocks';
import { DEFAULT_CAPABILITIES } from '@/types/capabilities';

describe('editor block catalog', () => {
  it('exposes the broader block palette', () => {
    const ids = EDITOR_BLOCKS.map((block) => block.id);

    expect(ids).toEqual(
      expect.arrayContaining([
        'shortText',
        'longText',
        'number',
        'email',
        'phoneNumber',
        'link',
        'multipleChoice',
        'dropdown',
        'checkboxes',
        'multiSelect',
        'date',
        'time',
        'rating',
        'linearScale',
        'ranking',
        'matrix',
        'fileUpload',
        'signature',
        'payment',
        'recaptcha',
        'hiddenField',
        'calculatedField',
        'title',
        'heading1',
        'heading2',
        'heading3',
        'textBlock',
        'label',
        'divider',
        'pageBreak',
        'image',
        'video',
        'audio',
        'embed',
        'welcome',
        'thanks',
      ]),
    );
  });

  it('maps dropdown blocks to persisted choice questions', () => {
    const question = createQuestionFromBlock('dropdown');

    expect(question.type).toBe('multipleChoice');
    expect(question.blockType).toBe('dropdown');
    expect(question.options).toHaveLength(2);
    expect(question.options.map((option) => option.text)).toEqual(['Option 1', 'Option 2']);
  });

  it('maps long text blocks to text questions with textarea rendering hints', () => {
    const question = createQuestionFromBlock('longText');

    expect(question.type).toBe('text');
    expect(question.blockType).toBe('longText');
    expect(question.inputType).toBe('textarea');
    expect(question.placeholder).toBe('Type your answer here...');
  });

  it('creates a content block for headings', () => {
    const question = createQuestionFromBlock('heading');

    expect(question.type).toBe('content');
    expect(question.blockType).toBe('heading');
    expect(question.contentKind).toBe('heading');
    expect(question.isRequired).toBe(false);
  });

  it('creates rating scale blocks with generated options', () => {
    const question = createQuestionFromBlock('linearScale');

    expect(question.type).toBe('likert10');
    expect(question.blockType).toBe('linearScale');
    expect(question.options).toHaveLength(10);
    expect(question.scale).toBe(10);
  });

  it('provides searchable metadata for each block', () => {
    const block = getBlockDefinition('matrix');

    expect(block.label).toBe('Matrix');
    expect(block.group).toBe('Rating & Ranking');
    expect(block.keywords).toContain('grid');
  });

  it('marks unsupported provider-backed blocks as unavailable with a reason', () => {
    const paymentBlock = getBlockDefinition('payment');
    const recaptchaBlock = getBlockDefinition('recaptcha');

    expect(isBlockAvailable(paymentBlock)).toBe(false);
    expect(paymentBlock.unavailableReason).toBe(DEFAULT_CAPABILITIES.payment.reason);
    expect(isBlockAvailable(recaptchaBlock)).toBe(false);
    expect(recaptchaBlock.unavailableReason).toBe(DEFAULT_CAPABILITIES.recaptcha.reason);
  });
});
