
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
      return data ? dbSurveyToSurvey(data as DbSurvey) : null;
    },
    enabled: !!surveyId
  });
}
