
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { SurveyFolder } from '@/types/survey-organization';
import { useAuth } from '@/providers/AuthProvider';

export function useQuerySurveys() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['surveys', user?.id],
    queryFn: async () => {
      try {
        if (!user) {
          return { folders: [], unorganizedSurveys: [] };
        }

        // Log that we're fetching data to help with debugging
        console.log('Fetching folders and surveys for user:', user.id);

        const [foldersResult, surveysResult] = await Promise.all([
          supabase
            .from('folders')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true }),
          
          supabase
            .from('surveys')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true })
        ]);
        
        // Better error handling with specific logging
        if (foldersResult.error) {
          console.error("Error fetching folders:", foldersResult.error);
          if (foldersResult.error.message?.includes("relation \"public.folders\" does not exist")) {
            throw new Error("The folders table doesn't exist in the Supabase database. Please create the required tables first.");
          }
          throw foldersResult.error;
        }
        
        if (surveysResult.error) {
          console.error("Error fetching surveys:", surveysResult.error);
          if (surveysResult.error.message?.includes("relation \"public.surveys\" does not exist")) {
            throw new Error("The surveys table doesn't exist in the Supabase database. Please create the required tables first.");
          }
          throw surveysResult.error;
        }
        
        console.log('Folders data:', foldersResult.data);
        console.log('Surveys data:', surveysResult.data);
        
        const folders: SurveyFolder[] = foldersResult.data.map(folder => ({
          id: folder.id,
          name: folder.name,
          createdAt: new Date(folder.created_at),
          surveys: []
        }));

        const surveys = surveysResult.data.map(survey => ({
          id: survey.id,
          name: survey.name,
          createdAt: new Date(survey.created_at),
          folderId: survey.folder_id
        }));

        const organizedFolders = folders.map(folder => ({
          ...folder,
          surveys: surveys.filter(survey => survey.folderId === folder.id)
        }));

        const unorganizedSurveys = surveys.filter(survey => !survey.folderId);

        return {
          folders: organizedFolders,
          unorganizedSurveys
        };
      } catch (err) {
        console.error("Error fetching survey data:", err);
        throw err;
      }
    },
    enabled: !!user
  });
}
