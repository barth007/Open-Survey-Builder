type JsonRecord = Record<string, unknown>;

interface SurveyQuestion {
  id?: string;
  text?: string;
  type?: string;
  blockType?: string;
  options?: Array<{
    id?: string;
    text?: string;
  }>;
}

interface SurveyLike {
  name?: string;
  title?: string;
  questions?: unknown;
}

interface SurveyResponseLike {
  id?: string;
  participantId?: string | null;
  participantEmail?: string | null;
  answers?: unknown;
  metadata?: unknown;
}

export interface NotificationTemplateContext {
  survey: SurveyLike;
  response: SurveyResponseLike;
}

const isJsonRecord = (value: unknown): value is JsonRecord => (
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value)
);

const getQuestions = (survey: SurveyLike) => (
  Array.isArray(survey.questions)
    ? survey.questions.filter((question): question is SurveyQuestion => isJsonRecord(question))
    : []
);

const getAnswers = (response: SurveyResponseLike) => (
  Array.isArray(response.answers)
    ? response.answers.filter((answer): answer is JsonRecord => isJsonRecord(answer))
    : []
);

const getMetadata = (response: SurveyResponseLike) => (
  isJsonRecord(response.metadata) ? response.metadata : undefined
);

const normalizeValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(normalizeValue).filter(Boolean).join(', ');
  }

  if (isJsonRecord(value)) {
    if (typeof value.kind === 'string') {
      if (value.kind === 'ranking' && Array.isArray(value.orderedOptionIds)) {
        return value.orderedOptionIds.map(normalizeValue).filter(Boolean).join(', ');
      }

      if (value.kind === 'matrix' && isJsonRecord(value.selections)) {
        return Object.entries(value.selections)
          .map(([row, selection]) => `${row}: ${normalizeValue(selection)}`)
          .join(', ');
      }

      if (value.kind === 'fileUpload' && Array.isArray(value.files)) {
        return value.files
          .map((file) => isJsonRecord(file) && typeof file.name === 'string' ? file.name : '')
          .filter(Boolean)
          .join(', ');
      }

      if (value.kind === 'signature') {
        return 'Signature captured';
      }

      if (value.kind === 'payment') {
        return value.confirmed ? 'Payment confirmed' : 'Payment pending';
      }
    }

    return JSON.stringify(value);
  }

  return '';
};

const formatAnswerValue = (question: SurveyQuestion | undefined, value: unknown) => {
  if (!question) {
    return normalizeValue(value);
  }

  if (
    (question.type === 'multipleChoice' || question.type === 'checkboxes' || question.type?.startsWith('likert')) &&
    Array.isArray(question.options)
  ) {
    const optionMap = new Map(
      question.options.map((option) => [option.id, option.text || option.id || '']),
    );

    if (Array.isArray(value)) {
      return value.map((entry) => optionMap.get(normalizeValue(entry)) || normalizeValue(entry)).join(', ');
    }

    return optionMap.get(normalizeValue(value)) || normalizeValue(value);
  }

  return normalizeValue(value);
};

export const resolveNotificationField = (
  fieldRef: string,
  context: NotificationTemplateContext,
): string => {
  const trimmedFieldRef = fieldRef.trim();
  const questions = getQuestions(context.survey);
  const answers = getAnswers(context.response);
  const metadata = getMetadata(context.response);

  if (trimmedFieldRef === '@All answers') {
    return buildAllAnswersSummary(context);
  }

  if (trimmedFieldRef === 'meta:respondentId') {
    return normalizeValue(context.response.participantId);
  }

  if (trimmedFieldRef === 'meta:participantEmail') {
    return normalizeValue(context.response.participantEmail);
  }

  if (trimmedFieldRef === 'meta:submissionId') {
    return normalizeValue(context.response.id);
  }

  if (trimmedFieldRef === 'meta:surveyTitle') {
    return normalizeValue(context.survey.title || context.survey.name);
  }

  if (trimmedFieldRef.startsWith('question:')) {
    const questionId = trimmedFieldRef.slice('question:'.length);
    const answer = answers.find((entry) => entry.questionId === questionId);
    const question = questions.find((entry) => entry.id === questionId);

    return formatAnswerValue(question, answer?.value);
  }

  if (trimmedFieldRef.startsWith('hidden:')) {
    const hiddenFields = metadata?.hiddenFields;
    return isJsonRecord(hiddenFields)
      ? normalizeValue(hiddenFields[trimmedFieldRef.slice('hidden:'.length)])
      : '';
  }

  if (trimmedFieldRef.startsWith('computed:')) {
    const computedFields = metadata?.computedFields;
    return isJsonRecord(computedFields)
      ? normalizeValue(computedFields[trimmedFieldRef.slice('computed:'.length)])
      : '';
  }

  return '';
};

export const renderNotificationTemplate = (
  template: string | undefined,
  context: NotificationTemplateContext,
) => {
  const baseTemplate = template || '';
  const withAnswerSummary = baseTemplate.replace(/@All answers/g, buildAllAnswersSummary(context));

  return withAnswerSummary.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_match, expression) => (
    resolveNotificationField(String(expression), context)
  ));
};

export const resolveNotificationRecipients = (
  rawRecipients: string | undefined,
  context: NotificationTemplateContext,
) => {
  const trimmedRecipients = (rawRecipients || '').trim();
  const renderedRecipients = (
    trimmedRecipients.startsWith('question:') ||
    trimmedRecipients.startsWith('hidden:') ||
    trimmedRecipients.startsWith('computed:') ||
    trimmedRecipients.startsWith('meta:')
  )
    ? resolveNotificationField(trimmedRecipients, context)
    : renderNotificationTemplate(rawRecipients, context);

  return renderedRecipients
    .split(/[,\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
};

export const buildAllAnswersSummary = (context: NotificationTemplateContext) => {
  const questions = getQuestions(context.survey);
  const questionMap = new Map(questions.map((question) => [question.id, question]));
  const answers = getAnswers(context.response);

  return answers
    .map((answer) => {
      const questionId = typeof answer.questionId === 'string' ? answer.questionId : '';
      const question = questionMap.get(questionId);
      const label = question?.text || questionId || 'Answer';
      const value = formatAnswerValue(question, answer.value);

      return value ? `${label}: ${value}` : '';
    })
    .filter(Boolean)
    .join('\n');
};

export const renderNotificationHtml = (text: string) => (
  text
    .split('\n')
    .map((line) => line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;'))
    .join('<br />')
);
