
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

      console.log('Fetching survey responses for survey:', surveyId);

      const { data, error } = await supabase
        .from('survey_responses')
        .select('*')
        .eq('survey_id', surveyId)
        .is('deleted_at', null); // Exclude soft-deleted responses

      if (error) {
        console.error('Error fetching survey responses:', error);
        if (error.message?.includes("relation \"public.survey_responses\" does not exist")) {
          throw new Error("The survey_responses table doesn't exist in the Supabase database");
        }
        throw error;
      }

      console.log('Raw survey responses from database:', data?.length || 0, data);

      // Map the database responses to our frontend format
      const mappedResponses = (data || []).map((item) => {
        const mapped = dbSurveyResponseToSurveyResponse(item as DbSurveyResponse);
        console.log('Mapped response:', mapped);
        return mapped;
      });

      console.log('Final mapped responses:', mappedResponses.length);
      return mappedResponses;
    },
    enabled: !!surveyId
  });
}
