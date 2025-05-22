
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { DbSurvey } from '@/types/database';
import { toast } from '@/components/ui/sonner';
import { dbSurveyToSurvey } from '@/utils/type-mappers';
import { Survey } from '@/types/survey';

export function useQuerySurvey(surveyId: string | undefined) {
  const [isLoading, setIsLoading] = useState(true);

  const query = useQuery({
    queryKey: ['survey', surveyId],
    queryFn: async () => {
      if (!surveyId) {
        throw new Error('Survey ID is required');
      }
      
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', surveyId)
        .single();

      if (error) {
        throw new Error(`Error fetching survey: ${error.message}`);
      }

      if (!data) {
        throw new Error('Survey not found');
      }
      
      // Convert the database survey to the Survey type using our utility function
      const survey: Survey = dbSurveyToSurvey(data as DbSurvey);
      
      return survey;
    },
    enabled: !!surveyId,
    retry: 1,
    staleTime: 10000,
    gcTime: 600000,
  });

  useEffect(() => {
    if (query.isPending) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [query.isPending]);

  useEffect(() => {
    if (query.error) {
      toast.error('Failed to load survey', { 
        description: query.error instanceof Error ? query.error.message : 'An unexpected error occurred'
      });
    }
  }, [query.error]);

  return { 
    survey: query.data,
    isLoading: isLoading || query.isPending,
    error: query.error
  };
}
