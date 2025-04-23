
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
      
      // Trigger a refetch of all surveys to update sidebar
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      // Specifically refetch this survey
      queryClient.invalidateQueries({ queryKey: ['survey', surveyId] });
      
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
