import { useState, useEffect } from 'react';
import { Survey, Question } from '@/types/survey';
import { useToast } from "@/hooks/use-toast";
import { useQuerySurvey } from './survey/useQuerySurvey';
import { useMutateSurvey } from './survey/useMutateSurvey';
import { useQueryClient } from '@tanstack/react-query';
import { useSurveyTitle } from './survey/useSurveyTitle';
import { useQuestionManagement } from './survey/useQuestionManagement';

export const useSurveyState = (surveyId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: surveyData, isLoading, error } = useQuerySurvey(surveyId);
  const { updateSurvey } = useMutateSurvey();
  const { handleTitleChange } = useSurveyTitle(surveyId);
  const [survey, setSurvey] = useState<Survey>({
    id: surveyId || "survey-1",
    title: "Untitled Survey",
    description: "Survey description",
    questions: [],
    isPublished: false
  });

  const {
    questions,
    setQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion
  } = useQuestionManagement(survey.questions);

  useEffect(() => {
    if (surveyData) {
      setSurvey(surveyData);
      setQuestions(surveyData.questions);
    }
  }, [surveyData, setQuestions]);

  const handleDescriptionChange = (description: string) => {
    setSurvey((prev) => ({ ...prev, description }));
  };

  const togglePublish = async () => {
    const newPublishState = !survey.isPublished;

    try {
      if (surveyId) {
        // Call the updateSurvey function
        await updateSurvey({
          surveyId,
          updates: {
            isPublished: newPublishState,
          },
        });

        // ✅ Fetch the updated survey data directly
        await queryClient.invalidateQueries({ queryKey: ['survey', surveyId] });

        toast({
          title: newPublishState ? "Survey published" : "Survey unpublished",
          description: newPublishState
            ? "The survey is now live and can receive responses"
            : "The survey is now in draft mode",
        });
      }
    } catch (error) {
      console.error("Error updating survey publish status:", error);
      toast({
        title: "Error updating survey",
        description: "An error occurred while updating the survey's publish status.",
      });
    }
  };

  const handleSave = async () => {
    try {
      if (surveyId) {
        await updateSurvey({
          surveyId,
          updates: { 
            title: survey.title,
            description: survey.description,
            questions: questions,
            isPublished: survey.isPublished
          }
        });
        
        queryClient.invalidateQueries({ queryKey: ['surveys'] });
        queryClient.invalidateQueries({ queryKey: ['survey', surveyId] });
        
        toast({
          title: "Survey saved",
          description: "Your survey has been saved successfully",
        });
      }
    } catch (error) {
      console.error("Error saving survey:", error);
      toast({
        title: "Error saving survey",
        description: "There was an error saving your survey. Please try again.",
        variant: "destructive"
      });
    }
  };

  const currentSurvey: Survey = {
    ...survey,
    questions
  };

  return {
    survey: currentSurvey,
    handleTitleChange,
    handleDescriptionChange,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
    togglePublish,
    handleSave,
    isLoading,
    error
  };
};
