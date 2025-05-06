
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from '@/components/ui/sonner';

export function useTeamSurveys() {
  const { user, session, refreshSession } = useAuth();
  const queryClient = useQueryClient();

  // Helper function to ensure valid auth session
  const ensureAuthSession = async () => {
    if (!user || !session?.access_token) {
      console.log('No valid session found, attempting to refresh');
      const recovered = await refreshSession();
      if (!recovered) {
        throw new Error("You must be logged in to perform this action");
      }
    }
    return true;
  };

  const updateSurveyTeam = useMutation({
    mutationFn: async ({ surveyId, teamId }: { surveyId: string; teamId: string | null }) => {
      await ensureAuthSession();
      
      try {
        // FIXED: Clean update call without problematic parameters
        console.log('Executing survey team update for surveyId:', surveyId, 'teamId:', teamId);
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
      await ensureAuthSession();
      
      // Double-check current session to ensure token is valid
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session || !sessionData.session.access_token) {
        throw new Error('Valid authentication session required');
      }

      try {
        // Verify user ID is available
        if (!user?.id) {
          throw new Error('User ID is required to create a survey');
        }
        
        const newSurvey = {
          name,
          team_id: teamId,
          description: '',
          questions: [],
          is_published: false,
          user_id: user.id
        };

        // Log auth state before making the request
        console.log('Creating team survey with auth state:', { 
          userId: user.id,
          hasSession: !!sessionData.session,
          tokenExpiry: sessionData.session?.expires_at ? 
            new Date(sessionData.session.expires_at * 1000).toISOString() : 'unknown'
        });

        // FIXED: Clean insert call without problematic parameters
        console.log('Executing team survey insert');
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
