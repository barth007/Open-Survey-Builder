
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { SurveyOrganization, Survey } from '@/types/survey-organization';
import { dbSurveyToOrganizationSurvey } from '@/utils/type-mappers';

export function useQuerySurveys() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['surveys'],
    queryFn: async (): Promise<SurveyOrganization> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      try {
        // Fetch folders
        const { data: folders, error: foldersError } = await supabase
          .from('folders')
          .select('*')
          .order('name');

        if (foldersError) {
          throw new Error(`Error fetching folders: ${foldersError.message}`);
        }

        // Fetch surveys
        const { data: surveys, error: surveysError } = await supabase
          .from('surveys')
          .select('*')
          .order('created_at', { ascending: false });

        if (surveysError) {
          throw new Error(`Error fetching surveys: ${surveysError.message}`);
        }

        // Convert surveys to the organization format
        const formattedSurveys: Survey[] = surveys.map(dbSurveyToOrganizationSurvey);

        // Organize surveys into folders
        const folderSurveys: { [key: string]: Survey[] } = {};
        const unorganizedSurveys: Survey[] = [];

        // Initialize empty arrays for each folder
        folders.forEach(folder => {
          folderSurveys[folder.id] = [];
        });

        // Distribute surveys to their folders
        formattedSurveys.forEach(survey => {
          if (survey.folderId && folderSurveys[survey.folderId]) {
            folderSurveys[survey.folderId].push(survey);
          } else {
            unorganizedSurveys.push(survey);
          }
        });

        // Create final result
        const result: SurveyOrganization = {
          folders: folders.map(folder => ({
            id: folder.id,
            name: folder.name,
            order: folder.order,
            surveys: folderSurveys[folder.id] || []
          })),
          unorganizedSurveys
        };

        return result;
      } catch (error: any) {
        console.error("Error querying surveys:", error);
        throw error;
      }
    },
    enabled: !!user
  });
}
