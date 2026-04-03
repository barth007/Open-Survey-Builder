import { useMutation } from '@tanstack/react-query';

import { Answer } from '@/types/survey';
import { useToast } from '@/hooks/use-toast';
import { apiFetch } from '@/lib/api';
import {
  buildPublicFormAccessHeaders,
  getStoredPublicFormAccessToken,
} from '@/features/survey-response/lib/public-form-access';

type SubmitResponseInput = {
  surveyId: string;
  answers: Answer[];
  metadata?: Record<string, any>;
  participantEmail?: string;
  responseId?: string;
  sessionToken?: string;
  publicCode?: string;
  submissionMode?: 'partial' | 'final';
};

export function useSubmitResponse() {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async ({
      surveyId,
      answers,
      metadata,
      participantEmail,
      responseId,
      sessionToken,
      publicCode,
      submissionMode,
    }: SubmitResponseInput) => {
      try {
        return await apiFetch('/surveys/respond', {
          method: 'POST',
          headers: {
            ...(buildPublicFormAccessHeaders(
              publicCode ? getStoredPublicFormAccessToken(publicCode) : undefined,
            ) || {}),
            ...(sessionToken ? { 'x-response-session-token': sessionToken } : {}),
          },
          body: JSON.stringify({
            surveyId,
            responseId,
            sessionToken,
            answers,
            metadata: metadata || {},
            participantEmail,
            submissionMode,
          }),
        });
      } catch (err) {
        console.error('Error in submitResponse:', err);
        throw err;
      }
    },
  });

  return {
    submitResponse: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
    toast,
  };
}
