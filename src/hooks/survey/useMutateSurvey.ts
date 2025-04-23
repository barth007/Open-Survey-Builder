
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-client';

export function useMutateSurvey() {
  const queryClient = useQueryClient();

  const createSurvey = useMutation({
    mutationFn: async ({ name, folderId }: { name: string, folderId?: string }) => {
      try {
        const { data, error } = await supabase
          .from('surveys')
          .insert([{
            name,
            folder_id: folderId,
            description: '',
            questions: [],
            is_published: false
          }])
          .select()
          .single();

        if (error) {
          console.error("Supabase error details:", error);
          if (error.code === '23503') {
            throw new Error('The selected folder does not exist');
          } else if (error.message?.includes("relation \"public.surveys\" does not exist")) {
            throw new Error("The surveys table doesn't exist in the Supabase database. Please create the required tables first.");
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
    }
  });

  // Update the type definition to include 'title' as a valid property
  const updateSurvey = useMutation({
    mutationFn: async ({ surveyId, updates }: { 
      surveyId: string; 
      updates: Partial<{ 
        name: string; 
        title: string; // Add title property to the type
        description: string; 
        questions: any[]; 
        isPublished: boolean 
      }>
    }) => {
      try {
        const { data, error } = await supabase
          .from('surveys')
          .update(updates)
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
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
