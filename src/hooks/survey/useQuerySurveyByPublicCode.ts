
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { dbSurveyToSurvey } from '@/utils/type-mappers';
import { DbSurvey } from '@/types/database';
import { Survey } from '@/types/survey';

export function useQuerySurveyByPublicCode(publicCode: string | undefined) {
  return useQuery({
    queryKey: ['survey', 'public', publicCode],
    queryFn: async () => {
      if (!publicCode) return null;

      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .eq('public_code', publicCode)
        .eq('is_published', true) // Only fetch published surveys
        .single();

      if (error) {
        if (error.message?.includes("No rows found")) {
          return null; // Survey not found or not published
        }
        throw error;
      }

      // Convert the database survey to our frontend survey format
      return data ? dbSurveyToSurvey(data as DbSurvey) : null;
    },
    enabled: !!publicCode
  });
}
