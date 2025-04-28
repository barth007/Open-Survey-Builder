
import { useQuerySurveys } from './survey/useQuerySurveys';
import { useMutateSurvey } from './survey/useMutateSurvey';
import { useMutateFolder } from './survey/useMutateFolder';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/providers/AuthProvider';

export function useSurveyData() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: surveyData, isLoading, error: queryError } = useQuerySurveys();
  const { createSurvey, deleteSurvey, updateSurvey } = useMutateSurvey();
  const { createFolder, deleteFolder } = useMutateFolder();

  const updateSurveyOrder = async (activeId: string, overId: string) => {
    console.log(`Moving survey ${activeId} to position of ${overId}`);
    
    // Find both surveys to determine if we're moving between folders
    const activeSurvey = findSurveyById(activeId);
    const overSurvey = findSurveyById(overId);
    
    if (!activeSurvey) return;
    
    // If the over element is a survey and they have different folder assignments
    // (or one has no folder), this is a folder change
    if (overSurvey && activeSurvey.folderId !== overSurvey.folderId) {
      try {
        // Update the survey's folder assignment
        await updateSurvey({
          surveyId: activeId,
          updates: { 
            folderId: overSurvey.folderId 
          }
        });
        
        // Refresh data
        queryClient.invalidateQueries({ queryKey: ['surveys'] });
      } catch (error) {
        console.error("Error moving survey between folders:", error);
      }
    } else {
      // For now, just refresh the data without changing order within folder
      // We could implement more sophisticated ordering in the future
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
    }
  };

  // Helper function to find a survey by ID across all folders and unorganized surveys
  const findSurveyById = (id: string) => {
    if (!surveyData) return null;
    
    // Check unorganized surveys first
    const unorganizedMatch = surveyData.unorganizedSurveys.find(s => s.id === id);
    if (unorganizedMatch) return unorganizedMatch;
    
    // Then check in folders
    for (const folder of surveyData.folders) {
      const folderMatch = folder.surveys.find(s => s.id === id);
      if (folderMatch) return folderMatch;
    }
    
    return null;
  };

  return {
    surveyData,
    isLoading,
    error: queryError,
    createFolder,
    createSurvey,
    deleteSurvey,
    deleteFolder,
    updateSurveyOrder,
    userId: user?.id
  };
}
