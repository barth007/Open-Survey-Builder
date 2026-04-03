import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';
import { dbSurveyResponseToSurveyResponse } from '@/utils/type-mappers';
import { DbSurveyResponse } from '@/types/database';

export function useQuerySurveyResponses(surveyId: string | undefined) {
  return useQuery({
    queryKey: ['surveyResponses', surveyId],
    queryFn: async () => {
      if (!surveyId) {
        return [];
      }

      const data = await apiFetch(`/surveys/${surveyId}/responses`) as DbSurveyResponse[];
      return (data || []).map((item) => dbSurveyResponseToSurveyResponse(item));
    },
    enabled: Boolean(surveyId),
  });
}
