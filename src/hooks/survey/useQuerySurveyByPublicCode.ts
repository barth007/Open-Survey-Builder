
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

      console.log('Fetching survey with public code:', publicCode);
      
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .eq('public_code', publicCode)
        // Removed the is_published filter to allow fetching unpublished surveys for preview
        .maybeSingle();

      if (error) {
        console.error('Error fetching public survey:', error);
        throw error;
      }

      console.log('Survey fetch result:', data ? 'Found' : 'Not found');
      
      // Convert the database survey to our frontend survey format
      return data ? dbSurveyToSurvey(data as DbSurvey) : null;
    },
    enabled: !!publicCode
  });
}
