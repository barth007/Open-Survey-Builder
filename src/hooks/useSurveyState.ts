
import { useState, useEffect, useCallback } from 'react';
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
  const [pendingUpdates, setPendingUpdates] = useState<Partial<Survey>>({});
  const [lastSaveTime, setLastSaveTime] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

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

  // Inizializza lo stato quando arrivano i dati dal server - FIX: Only update if surveyId matches
  useEffect(() => {
    if (surveyData && surveyData.id === surveyId) {
      console.log(`Initializing survey state for ID: ${surveyId}`, surveyData);
      setSurvey(surveyData);
      setQuestions(surveyData.questions);
    }
  }, [surveyData, surveyId, setQuestions]);

  // Gestisce il salvataggio automatico quando cambia il titolo (debounced)
  useEffect(() => {
    if (debouncedTitle !== surveyData?.title && surveyData) {
      setPendingChanges(true);
    }
  }, [debouncedTitle, surveyData?.title]);

  // Aggiorna la cache locale immediatamente per la preview - FIX: More specific cache key
  const updateLocalCache = useCallback((updates: Partial<Survey>) => {
    if (surveyId) {
      console.log(`Updating local cache for survey ${surveyId}:`, updates);
      queryClient.setQueryData(['survey', surveyId], (oldData: Survey | undefined) => {
        if (!oldData || oldData.id !== surveyId) {
          console.warn(`Cache mismatch for survey ${surveyId}`);
          return oldData;
        }
        const updatedData = { ...oldData, ...updates };
        console.log(`Cache updated for survey ${surveyId}:`, updatedData);
        return updatedData;
      });
    }
  }, [surveyId, queryClient]);

  // Batch updates to reduce API calls - FIX: Ensure surveyId is included in all updates
  const batchUpdate = useCallback((updates: Partial<Survey>) => {
    console.log(`Batching update for survey ${surveyId}:`, updates);
    
    // Ensure the update is for the correct survey
    const safeUpdates = { ...updates, id: surveyId };
    
    setPendingUpdates(prev => ({ ...prev, ...safeUpdates }));
    const mergedUpdates = { ...pendingUpdates, ...safeUpdates };
    
    setSurvey(prev => {
      if (prev.id !== surveyId) {
        console.warn(`State update mismatch: expected ${surveyId}, got ${prev.id}`);
        return prev;
      }
      return { ...prev, ...mergedUpdates };
    });
    
    updateLocalCache(mergedUpdates);
    setPendingChanges(true);
  }, [surveyId, pendingUpdates, updateLocalCache]);

  const handleTitleChange = useCallback((title: string) => {
    console.log(`Title change for survey ${surveyId}: ${title}`);
    batchUpdate({ title });
    document.title = title;
  }, [surveyId, batchUpdate]);

  const handleDescriptionChange = useCallback((description: string) => {
    console.log(`Description change for survey ${surveyId}: ${description}`);
    batchUpdate({ description });
  }, [surveyId, batchUpdate]);

  // Unified update function for all survey fields with validation
  const updateSurveyField = useCallback((field: keyof Survey, value: any) => {
    console.log(`Updating field ${field} for survey ${surveyId} with value:`, value);
    
    // Basic validation
    if (field === 'redirectUrl' && value && !value.startsWith('http')) {
      console.warn('Invalid URL format for redirectUrl:', value);
    }
    
    batchUpdate({ [field]: value });
  }, [surveyId, batchUpdate]);

  const handleQuestionChange = useCallback((updatedQuestion: Question) => {
    console.log(`Question change for survey ${surveyId}:`, updatedQuestion.id);
    updateQuestion(updatedQuestion);
    setPendingChanges(true);
  }, [surveyId, updateQuestion]);

  const handleAddQuestion = useCallback(() => {
    console.log(`Adding question to survey ${surveyId}`);
    const newQuestion = addQuestion();
    setPendingChanges(true);
    return newQuestion;
  }, [surveyId, addQuestion]);

  const handleDeleteQuestion = useCallback((questionId: string) => {
    console.log(`Deleting question ${questionId} from survey ${surveyId}`);
    deleteQuestion(questionId);
    setPendingChanges(true);
  }, [surveyId, deleteQuestion]);

  const handleDuplicateQuestion = useCallback((question: Question) => {
    console.log(`Duplicating question ${question.id} in survey ${surveyId}`);
    const newQuestion = duplicateQuestion(question);
    setPendingChanges(true);
    return newQuestion;
  }, [surveyId, duplicateQuestion]);

  const generatePublicCode = useCallback(() => {
    return `s-${Math.random().toString(36).substring(2, 10)}`;
  }, []);

  const togglePublish = useCallback(async () => {
    if (!surveyId) {
      console.error('Cannot toggle publish: no survey ID');
      return;
    }

    const newPublishState = !survey.isPublished;
    console.log(`Toggling publish state for survey ${surveyId}: ${newPublishState}`);
    
    const publicCode = newPublishState && !survey.publicCode 
      ? generatePublicCode()
      : survey.publicCode;
    
    // Optimistic update
    const updates = { 
      isPublished: newPublishState,
      publicCode: publicCode || survey.publicCode
    };
    
    batchUpdate(updates);
    
    try {
      await updateSurvey({
        surveyId,
        updates
      });
      
      // Reduce query invalidations and be more specific
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['surveys'] });
        queryClient.invalidateQueries({ queryKey: ['survey', surveyId] });
      }, 500);
      
      toast({
        title: newPublishState ? "Survey published" : "Survey unpublished",
        description: newPublishState 
          ? "The survey is now live and can receive responses" 
          : "The survey is now in draft mode",
      });
    } catch (error) {
      // Revert optimistic update on error
      batchUpdate({
        isPublished: !newPublishState,
        publicCode: survey.publicCode
      });
      
      console.error("Error updating survey publish status:", error);
      toast({
        title: "Error updating survey",
        description: error instanceof Error ? error.message : "There was an error updating your survey. Please try again.",
        variant: "destructive"
      });
    }
  }, [survey.isPublished, survey.publicCode, surveyId, batchUpdate, updateSurvey, queryClient, toast, generatePublicCode]);

  const handleSave = useCallback(async () => {
    if (!surveyId) {
      console.error('Cannot save: no survey ID');
      return;
    }

    const now = Date.now();
    
    // Evita salvataggi troppo frequenti (minimo 2000ms tra un salvataggio e l'altro)
    if (now - lastSaveTime < 2000 || isSaving) {
      console.log("Skipping save - too frequent or already saving");
      return;
    }

    console.log(`Saving survey ${surveyId}`);
    setIsSaving(true);

    try {
      const publicCode = survey.isPublished && !survey.publicCode 
        ? generatePublicCode()
        : survey.publicCode;

      // Create the complete update object including pending updates
      const completeUpdates = { 
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
        redirectUrl: survey.redirectUrl,
        ...pendingUpdates // Include any pending batched updates
      };

      console.log(`Saving survey ${surveyId} with updates:`, completeUpdates);

      await updateSurvey({
        surveyId,
        updates: completeUpdates
      });
      
      if (publicCode !== survey.publicCode) {
        setSurvey(prev => ({ ...prev, publicCode }));
        updateLocalCache({ publicCode });
      }
      
      // Clear pending updates after successful save
      setPendingUpdates({});
      
      // Reduced frequency of query invalidations and be more specific
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['surveys'] });
        queryClient.invalidateQueries({ queryKey: ['survey', surveyId] });
      }, 1000);
      
      setPendingChanges(false);
      setLastSaveTime(now);
      
      toast({
        title: "Survey saved",
        description: "Your survey has been saved successfully",
      });
    } catch (error) {
      console.error(`Error saving survey ${surveyId}:`, error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      toast({
        title: "Error saving survey",
        description: `${errorMessage}. Please try again.`,
        variant: "destructive"
      });
      
      // Don't clear pending updates on error so they can be retried
    } finally {
      setIsSaving(false);
    }
  }, [surveyId, survey, questions, pendingUpdates, lastSaveTime, isSaving, updateSurvey, queryClient, toast, generatePublicCode, updateLocalCache]);

  // FIX: Ensure current survey always has the correct ID
  const currentSurvey: Survey = {
    ...survey,
    id: surveyId || survey.id, // Always use the correct surveyId
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
    error,
    isSaving
  };
};
