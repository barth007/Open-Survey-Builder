
import { useQuerySurveys } from './survey/useQuerySurveys';
import { useMutateSurvey } from './survey/useMutateSurvey';
import { useMutateFolder } from './survey/useMutateFolder';
import { useQueryClient } from '@tanstack/react-query';

export function useSurveyData() {
  const queryClient = useQueryClient();
  const { data: surveyData, isLoading, error: queryError } = useQuerySurveys();
  const { createSurvey, deleteSurvey } = useMutateSurvey();
  const { createFolder, deleteFolder } = useMutateFolder();

  const updateSurveyOrder = async (activeId: string, overId: string) => {
    console.log(`Moving survey ${activeId} to position of ${overId}`);
    queryClient.invalidateQueries({ queryKey: ['surveys'] });
  };

  return {
    surveyData,
    isLoading,
    error: queryError,
    createFolder,
    createSurvey,
    deleteSurvey,
    deleteFolder,
    updateSurveyOrder
  };
}
