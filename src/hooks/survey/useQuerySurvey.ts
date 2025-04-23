
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-client';

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

      return data;
    },
    enabled: !!surveyId
  });
}
