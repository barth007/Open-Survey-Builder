import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Custom hook to fetch a survey by its public code
 * @param publicCode The public code of the survey
 * @param isPreviewMode Whether to bypass the is_published check
 */
export function useQuerySurveyByPublicCode(publicCode: string, isPreviewMode = false) {
  console.log(`Fetching survey with public code: ${publicCode}, preview mode: ${isPreviewMode}`);
  
  return useQuery({
    queryKey: ['survey', 'public', publicCode, isPreviewMode],
    queryFn: async () => {
      try {
        if (!publicCode) {
          throw new Error('Public code is required');
        }

        let query = supabase
          .from('surveys')
          .select('*')
          .eq('public_code', publicCode);
        
        // Only apply the is_published filter if not in preview mode
        if (!isPreviewMode) {
          query = query.eq('is_published', true);
        }
        
        const { data, error } = await query.single();
        
        if (error) {
          // Better error message for 'not found' scenarios
          if (error.code === 'PGRST116') {
            if (isPreviewMode) {
              throw new Error('Survey not found with this preview code');
            } else {
              throw new Error('Survey not found or not published');
            }
          }
          throw error;
        }

        if (!data) {
          throw new Error('Survey not found');
        }

        return mapToSurvey(data);
      } catch (error) {
        console.error("Error fetching survey by public code:", error);
        throw error;
      }
    },
    enabled: !!publicCode
  });
}
