
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { dbSurveyToSurvey } from '@/utils/type-mappers';
import { DbSurvey } from '@/types/database';
import { Survey } from '@/types/survey';

export function useQuerySurvey(surveyId: string | undefined) {
  return useQuery({
    queryKey: ['survey', surveyId],
    queryFn: async () => {
      if (!surveyId) return null;

      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', surveyId)
        .single();

      if (error) {
        if (error.message?.includes("relation \"public.surveys\" does not exist")) {
          throw new Error("The surveys table doesn't exist in the Supabase database");
        }
        throw error;
      }

      // Convert the database survey to our frontend survey format
      // We need to safely cast the data to DbSurvey with default values for missing properties
      if (data) {
        // Create a DbSurvey object with default values for required properties
        const dbSurvey = {
          ...data,
          // Add the properties that might be missing from the database response
          welcome_instructions: "",
          welcome_button_text: "Start",
          thank_you_button_text: "Finish"
        } as unknown as DbSurvey;
        
        return dbSurveyToSurvey(dbSurvey);
      }
      
      return null;
    },
    enabled: !!surveyId
  });
}
