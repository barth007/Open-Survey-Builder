import { useMutation, useQueryClient } from '@tanstack/react-query';

import { debugLog } from '@/lib/logger';
import { apiFetch } from '@/lib/api';
import { toast } from '@/components/ui/sonner';
import { Survey } from '@/types/survey';
import { DbSurvey } from '@/types/database';

const mapSurveyToApiPayload = (survey: Partial<Survey> & Record<string, unknown>) => {
  const payload: Record<string, unknown> = { ...survey };

  if (Object.prototype.hasOwnProperty.call(payload, 'title')) {
    payload.name = payload.title;
    delete payload.title;
  }

  // id is passed in the URL, not the body — backend strict schema rejects it
  delete payload.id;

  return payload;
};

export function useMutateSurvey() {
  const queryClient = useQueryClient();

  const createSurvey = useMutation({
    mutationFn: async ({ name, folderId }: { name: string; folderId?: string }) => (
      apiFetch('/surveys', {
        method: 'POST',
        body: JSON.stringify({
          name,
          description: '',
          questions: [],
          isPublished: false,
          folderId: folderId || null,
        }),
      }) as Promise<DbSurvey>
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast('Survey created successfully');
    },
    onError: (error: Error) => {
      toast('Failed to create survey', { description: error.message || 'Unknown error' });
    },
  });

  const updateSurvey = useMutation({
    mutationFn: async ({ surveyId, updates }: { surveyId: string; updates: Partial<Survey> & Record<string, unknown> }) => {
      debugLog(`Updating survey with ID: ${surveyId}`, updates);

      return apiFetch(`/surveys/${surveyId}`, {
        method: 'PUT',
        body: JSON.stringify(mapSurveyToApiPayload(updates)),
      }) as Promise<DbSurvey>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      queryClient.invalidateQueries({ queryKey: ['survey', variables.surveyId] });
    },
    onError: (error: Error) => {
      console.error('Survey update failed:', error);
    },
  });

  const deleteSurvey = useMutation({
    mutationFn: async (surveyId: string) => (
      apiFetch(`/surveys/${surveyId}`, {
        method: 'DELETE',
      })
    ),
    onSuccess: (_, surveyId) => {
      queryClient.removeQueries({ queryKey: ['survey', surveyId] });
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
    },
  });

  const duplicateSurvey = useMutation({
    mutationFn: async (surveyId: string) => {
      const survey = await apiFetch(`/surveys/${surveyId}`) as DbSurvey & Record<string, unknown>;
      const duplicatedName = survey.name ? `${survey.name} Copy` : 'Untitled Survey Copy';

      const { id, createdAt, updatedAt, publicCode, ...rest } = survey;

      return apiFetch('/surveys', {
        method: 'POST',
        body: JSON.stringify({
          ...rest,
          name: duplicatedName,
          isPublished: false,
          publicCode: null,
        }),
      }) as Promise<DbSurvey>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success('Survey duplicated');
    },
    onError: (error: Error) => {
      toast.error('Failed to duplicate survey', { description: error.message || 'Unknown error' });
    },
  });

  return {
    createSurvey: createSurvey.mutateAsync,
    updateSurvey: updateSurvey.mutateAsync,
    deleteSurvey: deleteSurvey.mutateAsync,
    duplicateSurvey: duplicateSurvey.mutateAsync,
  };
}
