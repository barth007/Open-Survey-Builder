import { useCallback, useEffect, useMemo, useState } from 'react';

import { apiFetch } from '@/lib/api';
import { Question, Answer } from '@/types/survey';
import { useSubmitResponse } from './useSubmitResponse';
import {
  buildPublicFormAccessHeaders,
  getStoredPublicFormAccessToken,
} from '@/features/survey-response/lib/public-form-access';
import {
  clearStoredResponseDraft,
  getStoredResponseDraft,
  setStoredResponseDraft,
} from '@/features/survey-response/lib/response-draft-storage';

type ResponseSessionPayload = {
  responseId: string;
  responseToken?: string;
  sessionToken?: string;
  status?: 'draft' | 'partial' | 'submitted';
};

export const useSurveyResponseLogic = (surveyId?: string, draftKey?: string, publicCode?: string) => {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [responseId, setResponseId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<Error | null>(null);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const { submitResponse, isSubmitting } = useSubmitResponse();

  const effectiveDraftKey = useMemo(() => draftKey || surveyId, [draftKey, surveyId]);

  useEffect(() => {
    const existingDraft = getStoredResponseDraft(effectiveDraftKey);
    if (existingDraft) {
      setResponseId(existingDraft.responseId);
      setSessionToken(existingDraft.sessionToken);
      setAnswers(existingDraft.answers || {});
    }
  }, [effectiveDraftKey]);

  useEffect(() => {
    if (!surveyId || responseId || isStartingSession) {
      return;
    }

    let active = true;

    const startResponseSession = async () => {
      try {
        setIsStartingSession(true);
        setSessionError(null);

        const session = await apiFetch(`/surveys/${surveyId}/response-session`, {
          method: 'POST',
          headers: buildPublicFormAccessHeaders(
            publicCode ? getStoredPublicFormAccessToken(publicCode) : undefined,
          ),
          body: JSON.stringify({}),
        }) as ResponseSessionPayload;

        if (!active) {
          return;
        }

        const nextResponseId = session.responseId;
        const nextSessionToken = session.sessionToken || session.responseToken || '';

        setResponseId(nextResponseId);
        setSessionToken(nextSessionToken);

        setStoredResponseDraft(effectiveDraftKey, {
          responseId: nextResponseId,
          sessionToken: nextSessionToken,
          status: session.status,
        });
      } catch (error) {
        if (active) {
          setSessionError(error as Error);
        }
      } finally {
        if (active) {
          setIsStartingSession(false);
        }
      }
    };

    startResponseSession();

    return () => {
      active = false;
    };
  }, [effectiveDraftKey, isStartingSession, publicCode, responseId, surveyId]);

  const handleAnswerChange = useCallback((questionId: string, value: string | string[]) => {
    setAnswers((prev) => {
      const nextAnswers = {
        ...prev,
        [questionId]: value,
      };

      if (responseId && sessionToken) {
        setStoredResponseDraft(effectiveDraftKey, {
          responseId,
          sessionToken,
          answers: nextAnswers,
          status: 'draft',
          updatedAt: new Date().toISOString(),
        });
      }

      return nextAnswers;
    });
  }, [effectiveDraftKey, responseId, sessionToken]);

  const handleSubmit = useCallback(async (isPublished: boolean) => {
    if (!surveyId) {
      return;
    }

    const formattedAnswers: Answer[] = Object.entries(answers).map(([questionId, value]) => ({
      questionId,
      value,
    }));

    await submitResponse({
      surveyId,
      answers: formattedAnswers,
      metadata: { isPublished },
      responseId: responseId || undefined,
      sessionToken: sessionToken || undefined,
      publicCode,
    });

    clearStoredResponseDraft(effectiveDraftKey);
  }, [answers, effectiveDraftKey, publicCode, responseId, sessionToken, submitResponse, surveyId]);

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
    isQuestionVisible,
    handleAnswerChange,
    handleSubmit,
    responseId,
    sessionToken,
    isStartingSession,
    sessionError,
  };
};
