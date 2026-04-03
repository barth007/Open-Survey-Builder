import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import { SurveyOrganization, Survey } from '@/types/survey-organization';
import { dbSurveyToOrganizationSurvey } from '@/utils/type-mappers';
import { DbSurvey } from '@/types/database';

type ApiFolder = {
  id: string;
  name: string;
  order?: number | null;
};

export function useQuerySurveys() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['surveys'],
    queryFn: async (): Promise<SurveyOrganization> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const [folders, surveys] = await Promise.all([
        apiFetch('/surveys/folders') as Promise<ApiFolder[]>,
        apiFetch('/surveys') as Promise<DbSurvey[]>,
      ]);

      const formattedSurveys: Survey[] = (surveys || []).map(dbSurveyToOrganizationSurvey);
      const folderSurveys: Record<string, Survey[]> = {};
      const unorganizedSurveys: Survey[] = [];

      (folders || []).forEach((folder) => {
        folderSurveys[folder.id] = [];
      });

      formattedSurveys.forEach((survey) => {
        if (survey.folderId && folderSurveys[survey.folderId]) {
          folderSurveys[survey.folderId].push(survey);
        } else {
          unorganizedSurveys.push(survey);
        }
      });

      return {
        folders: (folders || []).map((folder) => ({
          id: folder.id,
          name: folder.name,
          order: folder.order ?? 0,
          surveys: folderSurveys[folder.id] || [],
        })),
        unorganizedSurveys,
      };
    },
    enabled: Boolean(user),
  });
}
