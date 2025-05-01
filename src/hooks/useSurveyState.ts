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
    isPublished: false // We keep this for compatibility with the Survey type
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
    setSurvey(surveyData || survey); // always sync when surveyData updates
    if (surveyData) {
      setQuestions(surveyData.questions);
    }
  }, [surveyData, setQuestions]);  

  const handleDescriptionChange = (description: string) => {
    setSurvey((prev) => ({ ...prev, description }));
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
            // We keep isPublished in the data structure but don't expose functionality to change it
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
    handleSave,
    isLoading,
    error
  };
};
