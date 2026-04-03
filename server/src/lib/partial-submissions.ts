interface SurveyQuestionRecord {
  id?: string;
  type?: string;
  blockType?: string;
}

interface AnswerRecord {
  questionId?: string;
  value?: unknown;
  recordingUrl?: string;
}

type JsonRecord = Record<string, unknown>;

const SENSITIVE_QUESTION_TYPES = new Set([
  'signature',
  'fileUpload',
  'payment',
]);

const isJsonRecord = (value: unknown): value is JsonRecord => (
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value)
);

const getSettingsRecord = (survey: { settings?: unknown }) => (
  isJsonRecord(survey.settings) ? survey.settings : undefined
);

const getBehaviorRecord = (survey: { settings?: unknown }) => {
  const behavior = getSettingsRecord(survey)?.behavior;
  return isJsonRecord(behavior) ? behavior : undefined;
};

const getQuestions = (survey: { questions?: unknown }) => (
  Array.isArray(survey.questions)
    ? survey.questions.filter((question): question is SurveyQuestionRecord => isJsonRecord(question))
    : []
);

export const isPartialSubmissionCaptureEnabled = (survey: { settings?: unknown }) => (
  Boolean(getBehaviorRecord(survey)?.capturePartialSubmissions)
);

export const sanitizePartialSubmissionAnswers = (
  survey: { questions?: unknown },
  answers: unknown,
) => {
  if (!Array.isArray(answers)) {
    return [];
  }

  const questionMap = new Map(
    getQuestions(survey).map((question) => [question.id, question]),
  );

  return answers.filter((answer): answer is AnswerRecord => {
    if (!isJsonRecord(answer) || typeof answer.questionId !== 'string') {
      return false;
    }

    const question = questionMap.get(answer.questionId);
    const questionType = question?.type ?? question?.blockType;

    return !questionType || !SENSITIVE_QUESTION_TYPES.has(questionType);
  });
};
