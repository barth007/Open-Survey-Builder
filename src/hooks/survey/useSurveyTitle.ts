
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { useMutateSurvey } from './useMutateSurvey';

export const useSurveyTitle = (surveyId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { updateSurvey } = useMutateSurvey();

  const handleTitleChange = async (title: string) => {
    if (!surveyId) return;
    
    try {
      await updateSurvey({
        surveyId,
        updates: { name: title }
      });
      
      // Immediately update the survey data in the cache to reflect the change
      queryClient.setQueriesData({ queryKey: ['survey', surveyId] }, (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          name: title,
          title: title // Ensure both name and title fields are updated
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
