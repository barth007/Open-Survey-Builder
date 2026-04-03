import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { debugLog } from '@/lib/logger';
import { apiFetch } from '@/lib/api';
import { toast } from '@/components/ui/sonner';
import { dbSurveyToSurvey } from '@/utils/type-mappers';
import { DbSurvey } from '@/types/database';

export function useQuerySurvey(surveyId: string | undefined) {
  const [isLoading, setIsLoading] = useState(true);

  const query = useQuery({
    queryKey: ['survey', surveyId],
    queryFn: async () => {
      if (!surveyId) {
        throw new Error('Survey ID is required');
      }

      debugLog(`Fetching survey with ID: ${surveyId}`);
      const data = await apiFetch(`/surveys/${surveyId}`) as DbSurvey;
      return dbSurveyToSurvey(data);
    },
    enabled: Boolean(surveyId),
    retry: 1,
    staleTime: 10000,
    gcTime: 600000,
  });

  useEffect(() => {
    setIsLoading(query.isPending);
  }, [query.isPending]);

  useEffect(() => {
    if (query.error) {
      toast.error('Failed to load survey', {
        description: query.error instanceof Error ? query.error.message : 'An unexpected error occurred',
      });
    }
  }, [query.error]);

  return {
    survey: query.data,
    isLoading: isLoading || query.isPending,
    error: query.error,
  };
}
