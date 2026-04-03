import { getAnswerAnalyticsValues } from '@/lib/answer-values';
import type { AnswerValue, Question, Survey, SurveyResponse } from '@/types/survey';

export interface SubmissionPreviewItem {
  questionId: string;
  questionLabel: string;
  valueLabel: string;
}

export interface SubmissionRow {
  id: string;
  participantLabel: string;
  submittedAt: string;
  status: 'draft' | 'partial' | 'submitted';
  answerCount: number;
  hasRecording: boolean;
  answers: SubmissionPreviewItem[];
  preview: SubmissionPreviewItem[];
  response: SurveyResponse;
  searchText: string;
}

const formatChoiceValue = (question: Question, value: string | string[]): string => {
  const optionLabelMap = new Map(question.options.map((option) => [option.id, option.text]));
  const values = Array.isArray(value) ? value : [value];

  return values
    .map((item) => optionLabelMap.get(item) || item)
    .join(', ');
};

const formatAnswerValue = (question: Question, value: AnswerValue): string => {
  if (typeof value === 'string' || Array.isArray(value)) {
    const isChoiceLikeQuestion =
      question.type === 'multipleChoice' ||
      question.type === 'checkboxes' ||
      question.type.startsWith('likert');

    if (isChoiceLikeQuestion) {
      return formatChoiceValue(question, value);
    }

    return Array.isArray(value) ? value.join(', ') : value;
  }

  const analyticsValues = getAnswerAnalyticsValues(question, value);
  return analyticsValues.join(', ');
};

export const buildSubmissionRows = (
  survey: Survey,
  responses: SurveyResponse[] | undefined,
): SubmissionRow[] => {
  if (!responses || responses.length === 0) {
    return [];
  }

  const questionOrder = new Map(survey.questions.map((question, index) => [question.id, index]));
  const questionMap = new Map(survey.questions.map((question) => [question.id, question]));

  return [...responses]
    .sort((left, right) => new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime())
    .map((response) => {
      const orderedAnswers = [...response.answers].sort((left, right) => {
        const leftOrder = questionOrder.get(left.questionId) ?? Number.MAX_SAFE_INTEGER;
        const rightOrder = questionOrder.get(right.questionId) ?? Number.MAX_SAFE_INTEGER;
        return leftOrder - rightOrder;
      });

      const answers = orderedAnswers
        .map((answer) => {
          const question = questionMap.get(answer.questionId);
          if (!question) return null;

          return {
            questionId: question.id,
            questionLabel: question.text,
            valueLabel: formatAnswerValue(question, answer.value),
          };
        })
        .filter((item): item is SubmissionPreviewItem => item !== null);

      const preview = answers.slice(0, 3);

      const participantLabel =
        response.participantEmail ||
        (typeof response.metadata?.email === 'string' && response.metadata.email) ||
        response.participantId ||
        'Anonymous';

      return {
        id: response.id,
        participantLabel,
        submittedAt: response.submittedAt,
        status: response.status === 'draft' || response.status === 'partial' || response.status === 'submitted'
          ? response.status
          : 'submitted',
        answerCount: response.answers.length,
        hasRecording: response.answers.some((answer) => Boolean(answer.recordingUrl)),
        answers,
        preview,
        response,
        searchText: [
          participantLabel,
          ...answers.flatMap((item) => [item.questionLabel, item.valueLabel]),
        ]
          .join(' ')
          .toLowerCase(),
      };
    });
};
