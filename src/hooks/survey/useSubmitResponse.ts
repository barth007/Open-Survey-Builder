
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Answer } from '@/types/survey';
import { useToast } from '@/hooks/use-toast';
import { surveyResponseToDbSurveyResponse } from '@/utils/type-mappers';

export function useSubmitResponse() {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async ({ 
      surveyId, 
      answers, 
      saveToDatabase 
    }: { 
      surveyId: string; 
      answers: Answer[]; 
      saveToDatabase: boolean;
    }) => {
      // If the survey isn't published, don't save to database
      if (!saveToDatabase) {
        console.log('Survey is not published, responses will not be saved');
        return { success: true, preview: true };
      }

      try {
        const surveyResponse = {
          id: crypto.randomUUID(),
          surveyId,
          answers,
          submittedAt: new Date().toISOString()
        };

        // Convert to database format
        const dbResponse = surveyResponseToDbSurveyResponse(surveyResponse);

        const { data, error } = await supabase
          .from('survey_responses')
          .insert({
            survey_id: dbResponse.survey_id,
            answers: dbResponse.answers,
            submitted_at: dbResponse.submitted_at
          });

        if (error) {
          console.error("Error saving response:", error);
          throw new Error(`Database error: ${error.message}`);
        }

        return { success: true, data };
      } catch (err) {
        console.error("Error in submitResponse:", err);
        throw err;
      }
    }
  });

  const submitResponse = async (surveyId: string, answers: Answer[], isPublished: boolean) => {
    try {
      return await mutation.mutateAsync({ 
        surveyId, 
        answers, 
        saveToDatabase: isPublished 
      });
    } catch (error) {
      console.error("Failed to submit response:", error);
      toast({
        title: "Error",
        description: "There was a problem submitting your response",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    submitResponse,
    isSubmitting: mutation.isPending
  };
}
