import { useQuery } from '@tanstack/react-query';

import { debugLog } from '@/lib/logger';
import { apiFetch } from '@/lib/api';
import { Survey } from '@/types/survey';
import { dbSurveyToSurvey } from '@/utils/type-mappers';
import { DbSurvey } from '@/types/database';
import {
  buildPublicFormAccessHeaders,
  getStoredPublicFormAccessToken,
} from '@/features/survey-response/lib/public-form-access';

/**
 * Custom hook to fetch a survey by its public code.
 */
export function useQuerySurveyByPublicCode(publicCode: string, isPreviewMode = false) {
  debugLog(`Fetching survey with public code: ${publicCode}, preview mode: ${isPreviewMode}`);

  return useQuery({
    queryKey: ['survey', 'public', publicCode, isPreviewMode],
    queryFn: async () => {
      if (!publicCode) {
        throw new Error('Public code is required');
      }

      const data = await apiFetch(`/surveys/public/${publicCode}`, {
        headers: buildPublicFormAccessHeaders(getStoredPublicFormAccessToken(publicCode)),
      }) as DbSurvey;

      const convertedSurvey = dbSurveyToSurvey(data) as Survey & Record<string, unknown>;
      return {
        ...convertedSurvey,
        ...(typeof data.settings === 'object' && data.settings !== null ? { settings: data.settings } : {}),
        ...(typeof data.publicAccessState === 'object' && data.publicAccessState !== null
          ? { publicAccessState: data.publicAccessState }
          : {}),
      };
    },
    enabled: Boolean(publicCode) && !isPreviewMode,
  });
}
