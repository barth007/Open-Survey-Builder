
import { useState, useCallback, useMemo } from 'react';
import { Question, Answer } from '@/types/survey';
import { useSubmitResponse } from './useSubmitResponse';
import { v4 as uuidv4 } from 'uuid';

export const useSurveyResponseLogic = (surveyId?: string) => {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const { submitResponse, isSubmitting } = useSubmitResponse();
  
  // Generate a consistent responseId for this session
  const responseId = useMemo(() => uuidv4(), []);

  const handleAnswerChange = useCallback((questionId: string, value: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  }, []);

  const handleSubmit = useCallback(async (isPublished: boolean) => {
    if (!surveyId) return;

    const formattedAnswers: Answer[] = Object.entries(answers).map(([questionId, value]) => ({
      questionId,
      value
    }));

    await submitResponse(surveyId, formattedAnswers, isPublished);
  }, [surveyId, answers, submitResponse]);

  const isQuestionVisible = useCallback((question: Question): boolean => {
    if (!question.conditionalLogic) return true;

    const { dependsOn, operator, value } = question.conditionalLogic;
    const dependentAnswer = answers[dependsOn];

    switch (operator) {
      case 'equals':
        return dependentAnswer === value;
      case 'notEquals':
        return dependentAnswer !== value;
      case 'isAnswered':
        return dependentAnswer !== undefined && dependentAnswer !== '';
      case 'isNotAnswered':
        return dependentAnswer === undefined || dependentAnswer === '';
      default:
        return true;
    }
  }, [answers]);

  return {
    answers,
    isSubmitting,
    handleAnswerChange,
    handleSubmit,
    isQuestionVisible,
    responseId
  };
};
