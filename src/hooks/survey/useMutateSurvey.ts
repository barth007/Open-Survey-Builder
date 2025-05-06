import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { surveyToDbSurvey } from '@/utils/type-mappers';
import { Survey } from '@/types/survey';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from '@/components/ui/sonner';

export function useMutateSurvey() {
  const queryClient = useQueryClient();
  const { refreshSession } = useAuth();

  const createSurvey = useMutation({
    mutationFn: async ({ name, folderId }: { name: string, folderId?: string }) => {
      try {
        // Ensure session is fresh before creating survey
        await refreshSession();
        
        const newSurvey: Partial<Survey> = {
          title: name,
          folderId: folderId,
          description: '',
          questions: [],
          isPublished: false
        };

        // Convert to DB format
        const dbSurvey = surveyToDbSurvey(newSurvey as Survey);

        const { data, error } = await supabase
          .from('surveys')
          .insert([{
            name: dbSurvey.name,
            folder_id: dbSurvey.folder_id,
            description: dbSurvey.description || '',
            questions: dbSurvey.questions || [],
            is_published: dbSurvey.is_published || false
          }])
          .select()
          .single();

        if (error) {
          console.error("Supabase error details:", error);
          if (error.code === '23503') {
            throw new Error('The selected folder does not exist');
          } else if (error.message?.includes("relation \"public.surveys\" does not exist")) {
            throw new Error("The surveys table doesn't exist in the Supabase database. Please create the required tables first.");
          } else if (error.message?.includes("violates row-level security policy")) {
            throw new Error("Authentication error: Please sign out and sign in again to refresh your session.");
          }
          throw new Error(`Database error: ${error.message}`);
        }

        if (!data) {
          throw new Error('No data returned from survey creation');
        }

        return data;
      } catch (err) {
        console.error("Error in createSurveyMutation:", err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast("Survey created successfully");
    },
    onError: (error: Error) => {
      toast("Failed to create survey", { description: error.message || "Unknown error" });
    }
  });

  const updateSurvey = useMutation({
    mutationFn: async ({ surveyId, updates }: { 
      surveyId: string; 
      updates: Partial<Survey>
    }) => {
      try {
        // Convert the updates to database format
        const dbUpdates = surveyToDbSurvey(updates as Survey);
        
        // Remove undefined values
        const cleanedUpdates = Object.fromEntries(
          Object.entries(dbUpdates).filter(([_, v]) => v !== undefined)
        );

        const { data, error } = await supabase
          .from('surveys')
          .update(cleanedUpdates)
          .eq('id', surveyId)
          .select()
          .single();

        if (error) {
          throw new Error(`Database error: ${error.message}`);
        }
        
        return data;
      } catch (err) {
        console.error("Error in updateSurveyMutation:", err);
        throw err;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      queryClient.invalidateQueries({ queryKey: ['survey', variables.surveyId] });
    }
  });

  const deleteSurvey = useMutation({
    mutationFn: async (surveyId: string) => {
      try {
        const { error } = await supabase
          .from('surveys')
          .delete()
          .eq('id', surveyId);

        if (error) {
          if (error.message?.includes("relation \"public.surveys\" does not exist")) {
            throw new Error("The surveys table doesn't exist in the Supabase database");
          }
          throw new Error(`Database error: ${error.message}`);
        }
      } catch (err) {
        console.error("Error in deleteSurveyMutation:", err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
    }
  });

  return {
    createSurvey: createSurvey.mutateAsync,
    updateSurvey: updateSurvey.mutateAsync,
    deleteSurvey: deleteSurvey.mutate
  };
}
