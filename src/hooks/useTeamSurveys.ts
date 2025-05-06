
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from '@/components/ui/sonner';

export function useTeamSurveys() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const updateSurveyTeam = useMutation({
    mutationFn: async ({ surveyId, teamId }: { surveyId: string; teamId: string | null }) => {
      if (!user) {
        throw new Error("You must be logged in to update a survey team");
      }
      
      try {
        // Clean update call without problematic parameters
        const { data, error } = await supabase
          .from('surveys')
          .update({ team_id: teamId })
          .eq('id', surveyId)
          .select(`
            id,
            name,
            description,
            team_id,
            folder_id,
            created_at,
            is_published,
            public_code,
            user_id,
            questions
          `)
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
      if (!user) {
        throw new Error("You must be logged in to create a survey");
      }
      
      // Get current session to ensure token is valid
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session || !sessionData.session.access_token) {
        throw new Error('Valid authentication session required');
      }

      try {
        const newSurvey = {
          name,
          team_id: teamId,
          description: '',
          questions: [],
          is_published: false,
          user_id: user.id
        };

        // Clean insert call without problematic parameters
        const { data, error } = await supabase
          .from('surveys')
          .insert([newSurvey])
          .select(`
            id,
            name,
            description,
            team_id,
            folder_id,
            created_at,
            is_published,
            public_code,
            user_id,
            questions
          `)
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
