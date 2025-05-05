
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { useMutateSurvey } from './useMutateSurvey';
import { Survey } from '@/types/survey';
import { DbSurvey } from '@/types/database';
import { dbSurveyToSurvey } from '@/utils/type-mappers';

export const useSurveyTitle = (surveyId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { updateSurvey } = useMutateSurvey();

  const handleTitleChange = async (title: string) => {
    if (!surveyId) return;
    
    try {
      await updateSurvey({
        surveyId,
        updates: { title }
      });
      
      // Immediately update the survey data in the cache to reflect the change
      queryClient.setQueriesData({ queryKey: ['survey', surveyId] }, (oldData: any) => {
        if (!oldData) return oldData;
        
        // If oldData is a database format, convert it first
        if ('name' in oldData && !('title' in oldData)) {
          const converted = dbSurveyToSurvey(oldData as DbSurvey);
          return {
            ...converted,
            title
          };
        }
        
        // Otherwise update as frontend Survey type
        return {
          ...(oldData as Survey),
          title
        };
      });
      
      // Also invalidate the surveys list to update the sidebar
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      
      toast({
        title: "Survey Title Updated",
        description: `Survey title changed to "${title}"`,
      });
    } catch (error) {
      console.error("Error updating survey title:", error);
      toast({
        title: "Error",
        description: "Could not update survey title",
        variant: "destructive"
      });
    }
  };

  return { handleTitleChange };
};
