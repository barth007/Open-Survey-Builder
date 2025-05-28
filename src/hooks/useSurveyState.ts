
import { useState, useEffect } from 'react';
import { Survey, Question } from '@/types/survey';
import { useToast } from "@/hooks/use-toast";
import { useQuerySurvey } from './survey/useQuerySurvey';
import { useMutateSurvey } from './survey/useMutateSurvey';
import { useQueryClient } from '@tanstack/react-query';
import { useQuestionManagement } from './survey/useQuestionManagement';
import { useDebounce } from './useDebounce';

export const useSurveyState = (surveyId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { survey: surveyData, isLoading, error } = useQuerySurvey(surveyId);
  const { updateSurvey } = useMutateSurvey();
  
  const [survey, setSurvey] = useState<Survey>({
    id: surveyId || "survey-1",
    title: "Untitled Survey",
    description: "Survey description",
    questions: [],
    isPublished: false,
    publicCode: '',
    teamId: undefined,
    welcomeTitle: '',
    welcomeMessage: '',
    welcomeInstructions: '',
    welcomeButtonText: '',
    thankYouTitle: '',
    thankYouMessage: '',
    thankYouButtonText: '',
    redirectUrl: ''
  });

  const [pendingChanges, setPendingChanges] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<number>(0);

  // Debounce del titolo per evitare salvataggi eccessivi
  const debouncedTitle = useDebounce(survey.title, 1000);

  const {
    questions,
    setQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion
  } = useQuestionManagement(survey.questions);

  // Inizializza lo stato quando arrivano i dati dal server
  useEffect(() => {
    if (surveyData) {
      setSurvey(surveyData);
      setQuestions(surveyData.questions);
    }
  }, [surveyData, setQuestions]);

  // Gestisce il salvataggio automatico quando cambia il titolo (debounced)
  useEffect(() => {
    if (debouncedTitle !== surveyData?.title && surveyData) {
      setPendingChanges(true);
    }
  }, [debouncedTitle, surveyData?.title]);

  // Aggiorna la cache locale immediatamente per la preview
  const updateLocalCache = (updates: Partial<Survey>) => {
    if (surveyId) {
      queryClient.setQueriesData({ queryKey: ['survey', surveyId] }, (oldData: any) => {
        if (!oldData) return oldData;
        return { ...oldData, ...updates };
      });
    }
  };

  const handleTitleChange = (title: string) => {
    const updatedSurvey = { ...survey, title };
    setSurvey(updatedSurvey);
    updateLocalCache({ title });
    document.title = title;
    setPendingChanges(true);
  };

  const handleDescriptionChange = (description: string) => {
    const updatedSurvey = { ...survey, description };
    setSurvey(updatedSurvey);
    updateLocalCache({ description });
    setPendingChanges(true);
  };

  // Unified update function for all survey fields
  const updateSurveyField = (field: keyof Survey, value: any) => {
    const updatedSurvey = { ...survey, [field]: value };
    setSurvey(updatedSurvey);
    updateLocalCache({ [field]: value });
    setPendingChanges(true);
  };

  const handleQuestionChange = (updatedQuestion: Question) => {
    updateQuestion(updatedQuestion);
    setPendingChanges(true);
  };

  const handleAddQuestion = () => {
    const newQuestion = addQuestion();
    setPendingChanges(true);
    return newQuestion;
  };

  const handleDeleteQuestion = (questionId: string) => {
    deleteQuestion(questionId);
    setPendingChanges(true);
  };

  const handleDuplicateQuestion = (question: Question) => {
    const newQuestion = duplicateQuestion(question);
    setPendingChanges(true);
    return newQuestion;
  };

  const generatePublicCode = () => {
    return `s-${Math.random().toString(36).substring(2, 10)}`;
  };

  const togglePublish = async () => {
    const newPublishState = !survey.isPublished;
    
    const publicCode = newPublishState && !survey.publicCode 
      ? generatePublicCode()
      : survey.publicCode;
    
    // Optimistic update
    const updates = { 
      isPublished: newPublishState,
      publicCode: publicCode || survey.publicCode
    };
    
    setSurvey(prev => ({ ...prev, ...updates }));
    updateLocalCache(updates);
    
    try {
      if (surveyId) {
        await updateSurvey({
          surveyId,
          updates
        });
        
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
      // Revert optimistic update on error
      setSurvey(prev => ({
        ...prev,
        isPublished: !newPublishState,
        publicCode: prev.publicCode
      }));
      updateLocalCache({ 
        isPublished: !newPublishState,
        publicCode: survey.publicCode
      });
      
      console.error("Error updating survey publish status:", error);
      toast({
        title: "Error updating survey",
        description: "There was an error updating your survey. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    const now = Date.now();
    
    // Evita salvataggi troppo frequenti (minimo 500ms tra un salvataggio e l'altro)
    if (now - lastSaveTime < 500) {
      return;
    }

    try {
      if (surveyId) {
        const publicCode = survey.isPublished && !survey.publicCode 
          ? generatePublicCode()
          : survey.publicCode;
          
        const updates = { 
          title: survey.title,
          description: survey.description,
          questions: questions,
          isPublished: survey.isPublished,
          publicCode,
          teamId: survey.teamId,
          welcomeTitle: survey.welcomeTitle,
          welcomeMessage: survey.welcomeMessage,
          welcomeInstructions: survey.welcomeInstructions,
          welcomeButtonText: survey.welcomeButtonText,
          thankYouTitle: survey.thankYouTitle,
          thankYouMessage: survey.thankYouMessage,
          thankYouButtonText: survey.thankYouButtonText,
          redirectUrl: survey.redirectUrl
        };

        await updateSurvey({
          surveyId,
          updates
        });
        
        if (publicCode !== survey.publicCode) {
          setSurvey(prev => ({ ...prev, publicCode }));
          updateLocalCache({ publicCode });
        }
        
        queryClient.invalidateQueries({ queryKey: ['surveys'] });
        queryClient.invalidateQueries({ queryKey: ['survey', surveyId] });
        
        setPendingChanges(false);
        setLastSaveTime(now);
        
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
    publicCode: survey.publicCode || '',
    teamId: survey.teamId
  };

  return {
    survey: currentSurvey,
    handleTitleChange,
    handleDescriptionChange,
    updateSurveyField,
    addQuestion: handleAddQuestion,
    updateQuestion: handleQuestionChange,
    deleteQuestion: handleDeleteQuestion,
    duplicateQuestion: handleDuplicateQuestion,
    togglePublish,
    handleSave,
    pendingChanges,
    setPendingChanges,
    isLoading,
    error
  };
};
