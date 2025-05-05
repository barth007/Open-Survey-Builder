
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { dbSurveyResponseToSurveyResponse } from '@/utils/type-mappers';
import { DbSurveyResponse } from '@/types/database';
import { SurveyResponse } from '@/types/survey';

export function useQuerySurveyResponses(surveyId: string | undefined) {
  return useQuery({
    queryKey: ['surveyResponses', surveyId],
    queryFn: async () => {
      if (!surveyId) return [];

      const { data, error } = await supabase
        .from('survey_responses')
        .select('*')
        .eq('survey_id', surveyId);

      if (error) {
        if (error.message?.includes("relation \"public.survey_responses\" does not exist")) {
          throw new Error("The survey_responses table doesn't exist in the Supabase database");
        }
        throw error;
      }

      // Map the database responses to our frontend format
      return (data || []).map((item) => 
        dbSurveyResponseToSurveyResponse(item as DbSurveyResponse)
      );
    },
    enabled: !!surveyId
  });
}
