
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from '@/components/ui/sonner';

export function useTeamSurveys() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const updateSurveyTeam = useMutation({
    mutationFn: async ({ surveyId, teamId }: { surveyId: string; teamId: string | null }) => {
      try {
        const { data, error } = await supabase
          .from('surveys')
          .update({ team_id: teamId })
          .eq('id', surveyId)
          .select()
          .single();

        if (error) {
          console.error("Error updating survey team:", error);
          throw error;
        }

        return data;
      } catch (err) {
        console.error("Error in updateSurveyTeam mutation:", err);
        throw err;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      queryClient.invalidateQueries({ queryKey: ['survey', variables.surveyId] });
      
      toast(variables.teamId 
        ? "Survey added to team" 
        : "Survey removed from team");
    },
    onError: (error) => {
      toast(`Failed to update survey team: ${error.message}`);
    }
  });

  const createTeamSurvey = useMutation({
    mutationFn: async ({ name, teamId }: { name: string; teamId: string }) => {
      try {
        if (!user) {
          throw new Error("You must be logged in to create a survey");
        }

        const newSurvey = {
          name,
          team_id: teamId,
          description: '',
          questions: [],
          is_published: false,
          user_id: user.id
        };

        const { data, error } = await supabase
          .from('surveys')
          .insert([newSurvey])
          .select()
          .single();

        if (error) {
          console.error("Error creating team survey:", error);
          throw error;
        }

        return data;
      } catch (err) {
        console.error("Error in createTeamSurvey mutation:", err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast("Team survey created");
    },
    onError: (error) => {
      toast(`Failed to create team survey: ${error.message}`);
    }
  });

  return {
    updateSurveyTeam: updateSurveyTeam.mutateAsync,
    createTeamSurvey: createTeamSurvey.mutateAsync
  };
}
