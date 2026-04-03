import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';
import { toast } from '@/components/ui/sonner';

export function useTeamSurveys() {
  const queryClient = useQueryClient();

  const updateSurveyTeam = useMutation({
    mutationFn: async ({
      surveyId,
      teamId,
      folderId,
    }: {
      surveyId: string;
      teamId: string | null;
      folderId?: string | null;
    }) => (
      apiFetch(`/surveys/${surveyId}`, {
        method: 'PUT',
        body: JSON.stringify({
          teamId,
          ...(folderId !== undefined ? { folderId } : {}),
        }),
      })
    ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      queryClient.invalidateQueries({ queryKey: ['survey', variables.surveyId] });
      toast(variables.teamId ? 'Survey added to team' : 'Survey removed from team');
    },
    onError: (error: Error) => {
      toast(`Failed to update survey team: ${error.message}`);
    },
  });

  const createTeamSurvey = useMutation({
    mutationFn: async ({ name, teamId }: { name: string; teamId: string }) => (
      apiFetch('/surveys', {
        method: 'POST',
        body: JSON.stringify({
          name,
          teamId,
          description: '',
          questions: [],
          isPublished: false,
        }),
      })
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast('Team survey created');
    },
    onError: (error: Error) => {
      toast(`Failed to create team survey: ${error.message}`);
    },
  });

  return {
    updateSurveyTeam: updateSurveyTeam.mutateAsync,
    createTeamSurvey: createTeamSurvey.mutateAsync,
  };
}
