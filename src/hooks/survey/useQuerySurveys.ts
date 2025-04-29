
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { SurveyFolder } from '@/types/survey-organization';

export function useQuerySurveys() {
  return useQuery({
    queryKey: ['surveys'],
    queryFn: async () => {
      try {
        const [foldersResult, surveysResult] = await Promise.all([
          supabase.from('folders').select('*').order('created_at', { ascending: true }),
          supabase.from('surveys').select('*').order('created_at', { ascending: true })
        ]);
        
        if (foldersResult.error && foldersResult.error.message?.includes("relation \"public.folders\" does not exist")) {
          throw new Error("The folders table doesn't exist in the Supabase database. Please create the required tables first.");
        }
        
        if (surveysResult.error && surveysResult.error.message?.includes("relation \"public.surveys\" does not exist")) {
          throw new Error("The surveys table doesn't exist in the Supabase database. Please create the required tables first.");
        }
        
        if (foldersResult.error) throw foldersResult.error;
        if (surveysResult.error) throw surveysResult.error;
        
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
    }
  });
}
