
import { useState, useEffect, useCallback } from 'react';
import { Survey, Question } from '@/types/survey';
import { useToast } from "@/hooks/use-toast";
import { useQuerySurvey } from './survey/useQuerySurvey';
import { useMutateSurvey } from './survey/useMutateSurvey';
import { useQueryClient } from '@tanstack/react-query';
import { useQuestionManagement } from './survey/useQuestionManagement';
import { useSmartAutoSave } from './survey/useSmartAutoSave';

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

  const [pendingUpdates, setPendingUpdates] = useState<Partial<Survey>>({});

  const {
    questions,
    setQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion
  } = useQuestionManagement(survey.questions);

  // Initialize survey state when data arrives from server
  useEffect(() => {
    if (surveyData && surveyData.id === surveyId) {
      console.log(`Initializing survey state for ID: ${surveyId}`, surveyData);
      setSurvey(surveyData);
      setQuestions(surveyData.questions);
    }
  }, [surveyData, surveyId, setQuestions]);

  // Update local cache immediately for preview
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

  // Handle save operation
  const handleSave = useCallback(async () => {
    if (!surveyId) {
      console.error('Cannot save: no survey ID');
      return;
    }

    console.log(`Saving survey ${surveyId}`);

    try {
      const completeUpdates = { 
        title: survey.title,
        description: survey.description,
        questions: questions,
        isPublished: survey.isPublished,
        teamId: survey.teamId,
        welcomeTitle: survey.welcomeTitle,
        welcomeMessage: survey.welcomeMessage,
        welcomeInstructions: survey.welcomeInstructions,
        welcomeButtonText: survey.welcomeButtonText,
        thankYouTitle: survey.thankYouTitle,
        thankYouMessage: survey.thankYouMessage,
        thankYouButtonText: survey.thankYouButtonText,
        redirectUrl: survey.redirectUrl,
        ...pendingUpdates
      };

      console.log(`Saving survey ${surveyId} with updates:`, completeUpdates);

      const result = await updateSurvey({
        surveyId,
        updates: completeUpdates
      });
      
      if (result.public_code && result.public_code !== survey.publicCode) {
        console.log(`Received updated public code from database: ${result.public_code}`);
        setSurvey(prev => ({ ...prev, publicCode: result.public_code }));
        updateLocalCache({ publicCode: result.public_code });
      }
      
      setPendingUpdates({});
      
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['surveys'] });
        queryClient.invalidateQueries({ queryKey: ['survey', surveyId] });
      }, 1000);
      
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
      
      throw error; // Re-throw for retry logic
    }
  }, [surveyId, survey, questions, pendingUpdates, updateSurvey, queryClient, toast, updateLocalCache]);

  // Smart auto-save hook
  const smartAutoSave = useSmartAutoSave({
    onSave: handleSave,
    textFieldDelay: 3000, // 3 seconds for text fields
    structuralChangeDelay: 1000 // 1 second for structural changes
  });

  // Batch update function
  const batchUpdate = useCallback((updates: Partial<Survey>) => {
    console.log(`Batching update for survey ${surveyId}:`, updates);
    
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
  }, [surveyId, pendingUpdates, updateLocalCache]);

  const handleTitleChange = useCallback((title: string) => {
    console.log(`Title change for survey ${surveyId}: ${title}`);
    batchUpdate({ title });
    document.title = title;
    smartAutoSave.markTextChange(); // Mark as text change for smart debouncing
  }, [surveyId, batchUpdate, smartAutoSave]);

  const handleDescriptionChange = useCallback((description: string) => {
    console.log(`Description change for survey ${surveyId}: ${description}`);
    batchUpdate({ description });
    smartAutoSave.markTextChange(); // Mark as text change for smart debouncing
  }, [surveyId, batchUpdate, smartAutoSave]);

  const updateSurveyField = useCallback((field: keyof Survey, value: any) => {
    console.log(`Updating field ${field} for survey ${surveyId} with value:`, value);
    
    if (field === 'redirectUrl' && value && !value.startsWith('http')) {
      console.warn('Invalid URL format for redirectUrl:', value);
    }
    
    batchUpdate({ [field]: value });
    
    // Determine if this is a text change or structural change
    const textFields = ['welcomeTitle', 'welcomeMessage', 'welcomeInstructions', 'welcomeButtonText', 
                       'thankYouTitle', 'thankYouMessage', 'thankYouButtonText', 'redirectUrl'];
    
    if (textFields.includes(field)) {
      smartAutoSave.markTextChange();
    } else {
      smartAutoSave.markStructuralChange();
    }
  }, [surveyId, batchUpdate, smartAutoSave]);

  const handleQuestionChange = useCallback((updatedQuestion: Question) => {
    console.log(`Question change for survey ${surveyId}:`, updatedQuestion.id);
    updateQuestion(updatedQuestion);
    smartAutoSave.markTextChange(); // Question text changes are typically text
  }, [surveyId, updateQuestion, smartAutoSave]);

  const handleAddQuestion = useCallback(() => {
    console.log(`Adding question to survey ${surveyId}`);
    const newQuestion = addQuestion();
    smartAutoSave.markStructuralChange(); // Adding questions is structural
    return newQuestion;
  }, [surveyId, addQuestion, smartAutoSave]);

  const handleDeleteQuestion = useCallback((questionId: string) => {
    console.log(`Deleting question ${questionId} from survey ${surveyId}`);
    deleteQuestion(questionId);
    smartAutoSave.markStructuralChange(); // Deleting questions is structural
  }, [surveyId, deleteQuestion, smartAutoSave]);

  const handleDuplicateQuestion = useCallback((question: Question) => {
    console.log(`Duplicating question ${question.id} in survey ${surveyId}`);
    const newQuestion = duplicateQuestion(question);
    smartAutoSave.markStructuralChange(); // Duplicating questions is structural
    return newQuestion;
  }, [surveyId, duplicateQuestion, smartAutoSave]);

  const togglePublish = useCallback(async () => {
    if (!surveyId) {
      console.error('Cannot toggle publish: no survey ID');
      return;
    }

    const newPublishState = !survey.isPublished;
    console.log(`Toggling publish state for survey ${surveyId}: ${newPublishState}`);
    
    const updates = { 
      isPublished: newPublishState
    };
    
    batchUpdate(updates);
    
    try {
      const result = await updateSurvey({
        surveyId,
        updates
      });
      
      if (result.public_code && result.public_code !== survey.publicCode) {
        console.log(`Received new public code from database: ${result.public_code}`);
        setSurvey(prev => ({ ...prev, publicCode: result.public_code }));
        updateLocalCache({ publicCode: result.public_code });
      }
      
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
      batchUpdate({
        isPublished: !newPublishState
      });
      
      console.error("Error updating survey publish status:", error);
      toast({
        title: "Error updating survey",
        description: error instanceof Error ? error.message : "There was an error updating your survey. Please try again.",
        variant: "destructive"
      });
    }
  }, [survey.isPublished, survey.publicCode, surveyId, batchUpdate, updateSurvey, queryClient, toast, updateLocalCache]);

  // Ensure current survey always has the correct ID
  const currentSurvey: Survey = {
    ...survey,
    id: surveyId || survey.id,
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
    handleSave: smartAutoSave.manualSave, // Expose manual save
    pendingChanges: smartAutoSave.hasPendingChanges(),
    setPendingChanges: () => {}, // No longer needed with smart auto-save
    isLoading,
    error,
    isSaving: smartAutoSave.isSaving,
    isTyping: smartAutoSave.isTyping, // New: expose typing state
    lastSaved: smartAutoSave.lastSaved,
    retryCount: smartAutoSave.retryCount
  };
};
