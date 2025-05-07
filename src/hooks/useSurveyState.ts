
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
    isPublished: false,
    publicCode: '', // Ensure we initialize with an empty string rather than undefined
    teamId: undefined // Initialize teamId as undefined
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

  const generatePublicCode = () => {
    return `s-${Math.random().toString(36).substring(2, 10)}`;
  };

  const togglePublish = async () => {
    const newPublishState = !survey.isPublished;
    
    // Generate a public code if it doesn't exist and we're publishing
    const publicCode = newPublishState && !survey.publicCode 
      ? generatePublicCode()
      : survey.publicCode;
    
    // Update local state immediately for better UX
    setSurvey(prev => ({
      ...prev,
      isPublished: newPublishState,
      publicCode: publicCode || prev.publicCode
    }));
    
    try {
      if (surveyId) {
        await updateSurvey({
          surveyId,
          updates: { 
            isPublished: newPublishState,
            public_code: publicCode
          }
        });
        
        // Update local cache after successful update
        queryClient.invalidateQueries({ queryKey: ['surveys'] });
        queryClient.invalidateQueries({ queryKey: ['survey', surveyId] });
        
        toast({
          title: newPublishState ? "Survey published" : "Survey unpublished",
          description: newPublishState 
            ? "The survey is now live and can receive responses" 
            : "The survey is now in draft mode",
        });
      }
    } catch (error) {
      // Revert local state on error
      setSurvey(prev => ({
        ...prev,
        isPublished: !newPublishState,
        publicCode: prev.publicCode // Restore previous public code
      }));
      
      console.error("Error updating survey publish status:", error);
      toast({
        title: "Error updating survey",
        description: "There was an error updating your survey. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    try {
      if (surveyId) {
        // Make sure we have a public code if the survey is published
        const publicCode = survey.isPublished && !survey.publicCode 
          ? generatePublicCode()
          : survey.publicCode;
          
        await updateSurvey({
          surveyId,
          updates: { 
            title: survey.title,
            description: survey.description,
            questions: questions,
            is_published: survey.isPublished,
            public_code: publicCode,
            team_id: survey.teamId
          }
        });
        
        // If we added a public code, update the local state
        if (publicCode !== survey.publicCode) {
          setSurvey(prev => ({
            ...prev,
            publicCode
          }));
        }
        
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
    questions,
    publicCode: survey.publicCode || '', // Ensure publicCode is always at least an empty string
    teamId: survey.teamId // Include teamId in the returned survey
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
