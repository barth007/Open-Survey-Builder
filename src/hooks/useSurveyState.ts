import { useState, useEffect } from 'react';
import { Survey, Question } from '@/types/survey';
import { useToast } from "@/hooks/use-toast";
import { useQuerySurvey } from './survey/useQuerySurvey';
import { useMutateSurvey } from './survey/useMutateSurvey';
import { useQueryClient } from '@tanstack/react-query';
import { useSurveyTitle } from './survey/useSurveyTitle';

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

  useEffect(() => {
    if (surveyData) {
      setSurvey({
        id: surveyData.id,
        title: surveyData.title || surveyData.name || "Untitled Survey",
        description: surveyData.description || "Survey description",
        questions: surveyData.questions || [],
        isPublished: surveyData.isPublished || false
      });
    }
  }, [surveyData]);

  const handleDescriptionChange = (description: string) => {
    setSurvey((prev) => ({ ...prev, description }));
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: 'text',
      text: '',
      isRequired: false,
      options: []
    };
    
    setSurvey((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const updateQuestion = (updatedQuestion: Question) => {
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === updatedQuestion.id ? updatedQuestion : q
      )
    }));
  };

  const deleteQuestion = (questionId: string) => {
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const duplicateQuestion = (questionToDuplicate: Question) => {
    const newQuestion: Question = {
      ...questionToDuplicate,
      id: Date.now().toString(),
      options: questionToDuplicate.options.map(option => ({
        ...option,
        id: `${Date.now()}-${option.id}`
      }))
    };

    setSurvey((prev) => {
      const questionIndex = prev.questions.findIndex(q => q.id === questionToDuplicate.id);
      const updatedQuestions = [...prev.questions];
      updatedQuestions.splice(questionIndex + 1, 0, newQuestion);
      
      return {
        ...prev,
        questions: updatedQuestions
      };
    });

    toast({
      title: "Question duplicated",
      description: "The question has been duplicated successfully.",
    });
  };

  const togglePublish = () => {
    setSurvey(prev => ({
      ...prev,
      isPublished: !prev.isPublished
    }));

    toast({
      title: survey.isPublished ? "Survey unpublished" : "Survey published",
      description: survey.isPublished 
        ? "The survey is now in draft mode" 
        : "The survey is now live and can receive responses",
    });
  };

  const handleSave = async () => {
    try {
      if (surveyId) {
        await updateSurvey({
          surveyId,
          updates: { 
            name: survey.title, // Use title for the name field
            description: survey.description,
            questions: survey.questions,
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

  return {
    survey,
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
