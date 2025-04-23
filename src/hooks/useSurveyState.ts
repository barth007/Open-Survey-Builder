import { useState, useEffect } from 'react';
import { Survey, Question } from '@/types/survey';
import { useToast } from "@/components/ui/use-toast";
import { useQuerySurvey } from './survey/useQuerySurvey';

export const useSurveyState = (surveyId: string | undefined) => {
  const { toast } = useToast();
  const { data: surveyData } = useQuerySurvey(surveyId);
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
        title: surveyData.title || "Untitled Survey",
        description: surveyData.description || "Survey description",
        questions: surveyData.questions || [],
        isPublished: surveyData.is_published || false
      });
    }
  }, [surveyData]);

  const handleTitleChange = (title: string) => {
    setSurvey((prev) => ({ ...prev, title }));
  };

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

  const handleSave = () => {
    console.log("Survey data:", survey);
    toast({
      title: "Survey saved",
      description: "Your survey has been saved successfully",
    });
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
    handleSave
  };
};
