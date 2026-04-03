import {
  LIKERT_10_LABELS,
  LIKERT_5_LABELS,
  type Question,
  type QuestionBlockType,
  type QuestionInputType,
  type QuestionOption,
  type QuestionType,
} from '@/types/survey';
import {
  getCapabilityReason,
  isCapabilityEnabled,
} from '@/hooks/useCapabilities';
import type { CapabilityKey } from '@/types/capabilities';

export type EditorInsertType = QuestionBlockType | 'welcome' | 'thanks';

export interface EditorBlockDefinition {
  id: EditorInsertType;
  label: string;
  description: string;
  group: 'Input' | 'Choice' | 'Rating & Ranking' | 'Advanced' | 'Structure' | 'Media';
  keywords: string[];
  unavailableReason?: string;
}

const PROVIDER_CAPABILITY_BY_BLOCK: Partial<Record<QuestionBlockType, CapabilityKey>> = {
  payment: 'payment',
  recaptcha: 'recaptcha',
};

const buildOptions = (labels: string[]): QuestionOption[] =>
  labels.map((label, index) => ({
    id: `option-${index + 1}`,
    text: label,
  }));

const buildQuestion = (
  type: QuestionType,
  overrides: Partial<Question> = {},
): Question => ({
  id: crypto.randomUUID(),
  type,
  text: '',
  description: '',
  isRequired: false,
  options: [],
  ...overrides,
});

export const EDITOR_BLOCKS: EditorBlockDefinition[] = [
  {
    id: 'shortText',
    label: 'Short answer',
    description: 'Single-line input',
    group: 'Input',
    keywords: ['text', 'input', 'short'],
  },
  {
    id: 'longText',
    label: 'Long answer',
    description: 'Paragraph input',
    group: 'Input',
    keywords: ['text', 'paragraph', 'textarea', 'long'],
  },
  {
    id: 'number',
    label: 'Number',
    description: 'Numeric input',
    group: 'Input',
    keywords: ['number', 'numeric', 'integer'],
  },
  {
    id: 'email',
    label: 'Email',
    description: 'Email input',
    group: 'Input',
    keywords: ['email', 'mail'],
  },
  {
    id: 'phoneNumber',
    label: 'Phone number',
    description: 'Phone input',
    group: 'Input',
    keywords: ['phone', 'tel', 'mobile'],
  },
  {
    id: 'link',
    label: 'Link',
    description: 'URL input',
    group: 'Input',
    keywords: ['link', 'url', 'website'],
  },
  {
    id: 'multipleChoice',
    label: 'Multiple choice',
    description: 'Choose one option',
    group: 'Choice',
    keywords: ['radio', 'single choice', 'option'],
  },
  {
    id: 'dropdown',
    label: 'Dropdown',
    description: 'Select one option from a menu',
    group: 'Choice',
    keywords: ['select', 'menu', 'dropdown'],
  },
  {
    id: 'checkboxes',
    label: 'Checkboxes',
    description: 'Choose multiple options',
    group: 'Choice',
    keywords: ['multi choice', 'checkbox'],
  },
  {
    id: 'multiSelect',
    label: 'Multi-select',
    description: 'Select multiple options from a menu',
    group: 'Choice',
    keywords: ['select', 'multi', 'menu'],
  },
  {
    id: 'date',
    label: 'Date',
    description: 'Calendar date input',
    group: 'Input',
    keywords: ['date', 'calendar'],
  },
  {
    id: 'time',
    label: 'Time',
    description: 'Time input',
    group: 'Input',
    keywords: ['time', 'clock'],
  },
  {
    id: 'rating',
    label: 'Rating',
    description: 'Five-point rating',
    group: 'Rating & Ranking',
    keywords: ['rating', 'stars', 'score'],
  },
  {
    id: 'linearScale',
    label: 'Linear scale',
    description: 'Ten-point scale',
    group: 'Rating & Ranking',
    keywords: ['scale', 'likert', 'nps'],
  },
  {
    id: 'ranking',
    label: 'Ranking',
    description: 'Rank options in order',
    group: 'Rating & Ranking',
    keywords: ['ranking', 'sort', 'order'],
  },
  {
    id: 'matrix',
    label: 'Matrix',
    description: 'Grid of statements and values',
    group: 'Rating & Ranking',
    keywords: ['matrix', 'grid', 'table'],
  },
  {
    id: 'fileUpload',
    label: 'File upload',
    description: 'Collect files',
    group: 'Advanced',
    keywords: ['file', 'upload', 'attachment'],
  },
  {
    id: 'signature',
    label: 'Signature',
    description: 'Collect a signature',
    group: 'Advanced',
    keywords: ['sign', 'signature'],
  },
  {
    id: 'hiddenField',
    label: 'Hidden field',
    description: 'Capture a URL parameter invisibly',
    group: 'Advanced',
    keywords: ['hidden', 'url', 'parameter', 'utm', 'tracking', 'prefill'],
  },
  {
    id: 'calculatedField',
    label: 'Calculated field',
    description: 'Store a value computed from answers',
    group: 'Advanced',
    keywords: ['calculate', 'computed', 'score', 'sum', 'variable', 'formula'],
  },
  {
    id: 'payment',
    label: 'Payment',
    description: 'Collect a payment',
    group: 'Advanced',
    keywords: ['payment', 'price', 'checkout'],
    unavailableReason: 'Requires a real payment processor integration. This app only supports external checkout confirmation right now.',
  },
  {
    id: 'recaptcha',
    label: 'reCAPTCHA',
    description: 'Bot protection block',
    group: 'Advanced',
    keywords: ['captcha', 'bot', 'spam'],
    unavailableReason: 'Requires a provider-backed reCAPTCHA integration and site keys. This app only supports local human verification right now.',
  },
  {
    id: 'title',
    label: 'Title',
    description: 'Page or section title',
    group: 'Structure',
    keywords: ['title', 'h1', 'page title'],
  },
  {
    id: 'heading1',
    label: 'Heading 1',
    description: 'Large section heading',
    group: 'Structure',
    keywords: ['heading', 'h1', 'section'],
  },
  {
    id: 'heading2',
    label: 'Heading 2',
    description: 'Medium heading',
    group: 'Structure',
    keywords: ['heading', 'h2', 'subtitle'],
  },
  {
    id: 'heading3',
    label: 'Heading 3',
    description: 'Small heading',
    group: 'Structure',
    keywords: ['heading', 'h3'],
  },
  {
    id: 'textBlock',
    label: 'Text',
    description: 'Rich paragraph copy',
    group: 'Structure',
    keywords: ['text', 'paragraph', 'copy'],
  },
  {
    id: 'label',
    label: 'Label',
    description: 'Small uppercase label',
    group: 'Structure',
    keywords: ['label', 'eyebrow'],
  },
  {
    id: 'divider',
    label: 'Divider',
    description: 'Horizontal divider',
    group: 'Structure',
    keywords: ['divider', 'separator', 'line'],
  },
  {
    id: 'pageBreak',
    label: 'Page',
    description: 'New page break',
    group: 'Structure',
    keywords: ['page', 'break', 'next page'],
  },
  {
    id: 'image',
    label: 'Image',
    description: 'Image block',
    group: 'Media',
    keywords: ['image', 'photo', 'media'],
  },
  {
    id: 'video',
    label: 'Video',
    description: 'Video block',
    group: 'Media',
    keywords: ['video', 'media'],
  },
  {
    id: 'audio',
    label: 'Audio',
    description: 'Audio block',
    group: 'Media',
    keywords: ['audio', 'sound', 'media'],
  },
  {
    id: 'embed',
    label: 'Embed',
    description: 'Embedded media or app',
    group: 'Media',
    keywords: ['embed', 'iframe', 'app'],
  },
  {
    id: 'welcome',
    label: 'Welcome page',
    description: 'Intro screen',
    group: 'Structure',
    keywords: ['welcome', 'intro', 'start'],
  },
  {
    id: 'thanks',
    label: 'Thank you page',
    description: 'Completion screen',
    group: 'Structure',
    keywords: ['thanks', 'completion', 'end'],
  },
];

const resolveBlockUnavailableReason = (block: EditorBlockDefinition): string | undefined => {
  const capabilityKey = PROVIDER_CAPABILITY_BY_BLOCK[block.id as QuestionBlockType];

  if (!capabilityKey) {
    return block.unavailableReason;
  }

  if (isCapabilityEnabled(capabilityKey)) {
    return undefined;
  }

  return getCapabilityReason(capabilityKey) ?? block.unavailableReason;
};

export const getBlockDefinition = (id: EditorInsertType): EditorBlockDefinition => {
  const block = EDITOR_BLOCKS.find((item) => item.id === id);

  if (!block) {
    throw new Error(`Unknown editor block: ${id}`);
  }

  return {
    ...block,
    unavailableReason: resolveBlockUnavailableReason(block),
  };
};

export const isBlockAvailable = (block: EditorBlockDefinition): boolean => {
  const capabilityKey = PROVIDER_CAPABILITY_BY_BLOCK[block.id as QuestionBlockType];

  if (capabilityKey) {
    return isCapabilityEnabled(capabilityKey);
  }

  return !resolveBlockUnavailableReason(block);
};

const buildTextQuestion = (
  blockType: QuestionBlockType,
  inputType: QuestionInputType,
  placeholder: string,
): Question =>
  buildQuestion('text', {
    blockType,
    inputType,
    placeholder,
  });

const buildChoiceQuestion = (
  type: 'multipleChoice' | 'checkboxes',
  blockType: QuestionBlockType,
): Question =>
  buildQuestion(type, {
    blockType,
    options: buildOptions(['Option 1', 'Option 2']),
  });

export const createQuestionFromBlock = (blockType: QuestionBlockType): Question => {
  switch (blockType) {
    case 'shortText':
      return buildTextQuestion(blockType, 'text', 'Type your answer here...');
    case 'longText':
      return buildTextQuestion(blockType, 'textarea', 'Type your answer here...');
    case 'number':
      return buildTextQuestion(blockType, 'number', '42');
    case 'email':
      return buildTextQuestion(blockType, 'email', 'name@example.com');
    case 'phoneNumber':
      return buildTextQuestion(blockType, 'tel', '+1 (555) 000-0000');
    case 'link':
      return buildTextQuestion(blockType, 'url', 'https://example.com');
    case 'date':
      return buildTextQuestion(blockType, 'date', '');
    case 'time':
      return buildTextQuestion(blockType, 'time', '');
    case 'multipleChoice':
      return buildChoiceQuestion('multipleChoice', blockType);
    case 'dropdown':
      return buildChoiceQuestion('multipleChoice', blockType);
    case 'checkboxes':
      return buildChoiceQuestion('checkboxes', blockType);
    case 'multiSelect':
      return buildChoiceQuestion('checkboxes', blockType);
    case 'rating':
      return buildQuestion('likert5', {
        blockType,
        scale: 5,
        options: buildOptions(LIKERT_5_LABELS),
      });
    case 'linearScale':
      return buildQuestion('likert10', {
        blockType,
        scale: 10,
        options: buildOptions(LIKERT_10_LABELS),
      });
    case 'ranking':
      return buildQuestion('ranking', {
        blockType,
        text: 'Rank the following options',
        options: buildOptions(['Item 1', 'Item 2', 'Item 3']),
      });
    case 'matrix':
      return buildQuestion('matrix', {
        blockType,
        text: 'Rate each statement',
        options: buildOptions(['Statement 1', 'Statement 2']),
        matrixColumns: buildOptions(['Poor', 'Average', 'Great']),
      });
    case 'fileUpload':
      return buildQuestion('fileUpload', {
        blockType,
        text: 'Upload your files',
        placeholder: 'Respondents can upload files here',
      });
    case 'signature':
      return buildQuestion('signature', {
        blockType,
        text: 'Add your signature',
        placeholder: 'Respondents can sign here',
      });
    case 'hiddenField':
      return buildQuestion('hiddenField', {
        blockType,
        text: '',
        fieldKey: 'my_field',
        fieldDefaultValue: '',
      });
    case 'calculatedField':
      return buildQuestion('calculatedField', {
        blockType,
        text: '',
        fieldName: 'score',
        fieldValueType: 'number',
        fieldInitialValue: 0,
      });
    case 'payment':
      return buildQuestion('payment', {
        blockType,
        text: 'Complete the payment step',
        placeholder: 'Respondents can confirm external payment here',
      });
    case 'recaptcha':
      return buildQuestion('recaptcha', {
        blockType,
        text: 'Verify that you are human',
        placeholder: 'Bot protection appears here',
      });
    case 'title':
      return buildQuestion('content', {
        blockType,
        contentKind: 'title',
        text: 'Page title',
      });
    case 'heading1':
      return buildQuestion('content', {
        blockType,
        contentKind: 'heading1',
        text: 'Section heading',
      });
    case 'heading2':
      return buildQuestion('content', {
        blockType,
        contentKind: 'heading2',
        text: 'Subsection heading',
      });
    case 'heading3':
      return buildQuestion('content', {
        blockType,
        contentKind: 'heading3',
        text: 'Minor heading',
      });
    case 'heading':
      return buildQuestion('content', {
        blockType,
        contentKind: 'heading',
        text: 'Section heading',
      });
    case 'textBlock':
      return buildQuestion('content', {
        blockType,
        contentKind: 'text',
        text: 'Add supporting context for this part of the form.',
      });
    case 'label':
      return buildQuestion('content', {
        blockType,
        contentKind: 'label',
        text: 'SECTION LABEL',
      });
    case 'divider':
      return buildQuestion('content', {
        blockType,
        contentKind: 'divider',
        text: '',
      });
    case 'pageBreak':
      return buildQuestion('content', {
        blockType,
        contentKind: 'pageBreak',
        text: 'Next page',
      });
    case 'image':
      return buildQuestion('content', {
        blockType,
        contentKind: 'image',
        text: 'Image caption',
      });
    case 'video':
      return buildQuestion('content', {
        blockType,
        contentKind: 'video',
        text: 'Video caption',
      });
    case 'audio':
      return buildQuestion('content', {
        blockType,
        contentKind: 'audio',
        text: 'Audio caption',
      });
    case 'embed':
      return buildQuestion('content', {
        blockType,
        contentKind: 'embed',
        text: 'Embedded content',
        embedUrl: '',
      });
    default:
      return buildTextQuestion('shortText', 'text', 'Type your answer here...');
  }
};

const choicePreservingBlocks: QuestionBlockType[] = [
  'multipleChoice',
  'dropdown',
  'checkboxes',
  'multiSelect',
  'ranking',
];

export const convertQuestionToBlock = (
  question: Question,
  blockType: QuestionBlockType,
): Question => {
  const template = createQuestionFromBlock(blockType);
  const shouldPreserveOptions =
    choicePreservingBlocks.includes(blockType) && question.options.length > 0;

  return {
    ...template,
    id: question.id,
    text: question.text || template.text,
    description: question.description ?? template.description,
    isRequired: template.type === 'content' ? false : question.isRequired,
    conditionalLogic: question.conditionalLogic,
    logic: question.logic,
    options: shouldPreserveOptions ? question.options : template.options,
  };
};

export const isQuestionInsertType = (type: EditorInsertType): type is QuestionBlockType =>
  type !== 'welcome' && type !== 'thanks';

export const getQuestionBlockLabel = (question: Question): string => {
  if (question.blockType) {
    return getBlockDefinition(question.blockType).label;
  }

  switch (question.type) {
    case 'text':
      return 'Short answer';
    case 'multipleChoice':
      return 'Multiple choice';
    case 'checkboxes':
      return 'Checkboxes';
    case 'likert5':
      return 'Rating';
    case 'likert7':
    case 'likert10':
      return 'Linear scale';
    case 'content':
      return 'Content';
    case 'matrix':
      return 'Matrix';
    case 'ranking':
      return 'Ranking';
    case 'fileUpload':
      return 'File upload';
    case 'signature':
      return 'Signature';
    case 'payment':
      return 'Payment';
    case 'recaptcha':
      return 'reCAPTCHA';
    case 'hiddenField':
      return 'Hidden field';
    case 'calculatedField':
      return 'Calculated field';
    default:
      return 'Block';
  }
};

export const getQuestionBlockGroup = (question: Question): EditorBlockDefinition['group'] => {
  if (question.blockType) {
    return getBlockDefinition(question.blockType).group;
  }

  return 'Input';
};

export const getNormalizedBlockType = (question: Question): QuestionBlockType => {
  if (question.blockType) {
    return question.blockType;
  }

  switch (question.type) {
    case 'multipleChoice':
      return 'multipleChoice';
    case 'checkboxes':
      return 'checkboxes';
    case 'likert5':
      return 'rating';
    case 'likert7':
    case 'likert10':
      return 'linearScale';
    case 'matrix':
      return 'matrix';
    case 'ranking':
      return 'ranking';
    case 'fileUpload':
      return 'fileUpload';
    case 'signature':
      return 'signature';
    case 'payment':
      return 'payment';
    case 'recaptcha':
      return 'recaptcha';
    case 'content':
      return 'textBlock';
    case 'hiddenField':
      return 'hiddenField';
    case 'calculatedField':
      return 'calculatedField';
    case 'text':
    default:
      return 'shortText';
  }
};

export const isContentBlock = (question: Question): boolean => question.type === 'content';

export const isChoiceBlock = (question: Question): boolean =>
  question.type === 'multipleChoice' ||
  question.type === 'checkboxes' ||
  question.type === 'ranking' ||
  question.type === 'matrix';

export const isTextInputBlock = (question: Question): boolean => question.type === 'text';

export const isScaleBlock = (question: Question): boolean =>
  question.type === 'likert5' || question.type === 'likert7' || question.type === 'likert10';

// ── "Turn into" group support ────────────────────────────────────────────────

export type TurnIntoGroup = 'choice' | 'content-text' | 'scale' | 'input' | 'none';

export const getTurnIntoGroup = (blockType: QuestionBlockType): TurnIntoGroup => {
  switch (blockType) {
    case 'multipleChoice':
    case 'dropdown':
    case 'checkboxes':
    case 'multiSelect':
      return 'choice';
    case 'textBlock':
    case 'label':
    case 'heading':
    case 'title':
    case 'heading1':
    case 'heading2':
    case 'heading3':
      return 'content-text';
    case 'rating':
    case 'linearScale':
      return 'scale';
    case 'shortText':
    case 'longText':
    case 'number':
    case 'email':
    case 'phoneNumber':
    case 'link':
    case 'date':
    case 'time':
      return 'input';
    default:
      return 'none';
  }
};

export const getTurnIntoTargets = (group: TurnIntoGroup): QuestionBlockType[] => {
  switch (group) {
    case 'choice':
      return ['multipleChoice', 'multiSelect', 'checkboxes', 'dropdown'];
    case 'content-text':
      return ['textBlock', 'label', 'title', 'heading1', 'heading2', 'heading3'];
    case 'scale':
      return ['rating', 'linearScale'];
    case 'input':
      return ['shortText', 'longText', 'number', 'email', 'phoneNumber', 'link', 'date', 'time'];
    case 'none':
      return [];
  }
};
