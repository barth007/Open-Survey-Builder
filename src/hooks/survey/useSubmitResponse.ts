
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
      metadata 
    }: { 
      surveyId: string; 
      answers: Answer[]; 
      metadata?: Record<string, any>;
    }) => {
      try {
        const surveyResponse = {
          id: crypto.randomUUID(),
          surveyId,
          answers,
          submittedAt: new Date().toISOString(),
          metadata
        };

        // Convert to database format
        const dbResponse = surveyResponseToDbSurveyResponse(surveyResponse);

        const { data, error } = await supabase
          .from('survey_responses')
          .insert({
            survey_id: dbResponse.survey_id,
            answers: dbResponse.answers,
            submitted_at: dbResponse.submitted_at,
            metadata: metadata || {}
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

  return {
    submitResponse: mutation.mutateAsync,
    isSubmitting: mutation.isPending
  };
}
