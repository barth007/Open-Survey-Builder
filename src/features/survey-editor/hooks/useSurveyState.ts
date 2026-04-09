
import { debugLog, debugWarn } from '@/lib/logger';

import { useState, useEffect, useCallback } from 'react';
import { Survey, Question } from '@/types/survey';
import { useToast } from "@/hooks/use-toast";
import { useQuerySurvey } from '@/hooks/survey/useQuerySurvey';
import { useMutateSurvey } from '@/hooks/survey/useMutateSurvey';
import { useQueryClient } from '@tanstack/react-query';
import { useQuestionManagement } from './useQuestionManagement';
import { useSmartAutoSave } from './useSmartAutoSave';


export const useSurveyState = (surveyId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { survey: surveyData, isLoading, error } = useQuerySurvey(surveyId || undefined);
  const { updateSurvey } = useMutateSurvey();
  
  const [survey, setSurvey] = useState<Survey>({
    id: surveyId || "",
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
    redirectUrl: '',
    recordingEnabled: false,
    recordingRequired: false
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
    if (surveyId && surveyData && surveyData.id === surveyId) {
      debugLog(`Initializing survey state for ID: ${surveyId}`, surveyData);
      setSurvey(surveyData);
      setQuestions(surveyData.questions);
    }
  }, [surveyData, surveyId, setQuestions]);

  // Update local cache immediately for preview with conflict prevention
  const updateLocalCache = useCallback((updates: Partial<Survey>) => {
    if (surveyId) {
      debugLog(`Updating local cache for survey ${surveyId}:`, updates);
      queryClient.setQueryData(['survey', surveyId], (oldData: Survey | undefined) => {
        if (!oldData || oldData.id !== surveyId) {
          debugWarn(`Cache mismatch for survey ${surveyId}`);
          return oldData;
        }
        
        // Prevent overwriting newer changes
        const updatedData = { 
          ...oldData, 
          ...updates,
          // Preserve questions if not explicitly updating them
          questions: updates.questions || oldData.questions
        };
        debugLog(`Cache updated for survey ${surveyId}:`, updatedData);
        return updatedData;
      });
    }
  }, [surveyId, queryClient]);

  // Enhanced save operation with better error handling
  const handleSave = useCallback(async () => {
    if (!surveyId) {
      console.error('Cannot save: no survey ID');
      throw new Error('No survey ID provided');
    }

    debugLog(`Saving survey ${surveyId}`);

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
        recordingEnabled: survey.recordingEnabled,
        recordingRequired: survey.recordingRequired,
        ...pendingUpdates
      };

      debugLog(`Saving survey ${surveyId} with updates:`, completeUpdates);

      const result = await updateSurvey({
        surveyId,
        updates: completeUpdates
      });
      
      if (result.publicCode && result.publicCode !== survey.publicCode) {
        debugLog(`Received updated public code from database: ${result.publicCode}`);
        setSurvey(prev => ({ ...prev, publicCode: result.publicCode }));
        updateLocalCache({ publicCode: result.publicCode });
      }
      
      setPendingUpdates({});
      
      // Invalidate queries after a short delay to prevent conflicts
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

  // Smart auto-save hook with improved settings
  const initialLastSaved = surveyData?.updatedAt
    ? new Date(surveyData.updatedAt as string)
    : null;

  const smartAutoSave = useSmartAutoSave({
    onSave: handleSave,
    initialLastSaved,
    textFieldDelay: 1500,
    structuralChangeDelay: 800,
  });

  // Enhanced batch update function with better state management
  const batchUpdate = useCallback((updates: Partial<Survey>) => {
    debugLog(`Batching update for survey ${surveyId}:`, updates);

    const safeUpdates = { ...updates, id: surveyId };

    setPendingUpdates(prev => {
      const mergedUpdates = { ...prev, ...safeUpdates };

      setSurvey(prevSurvey => {
        if (prevSurvey.id !== surveyId) {
          debugWarn(
            `State update mismatch: expected ${surveyId}, got ${prevSurvey.id}`
          );
          return prevSurvey;
        }
        
        const newSurvey = { ...prevSurvey, ...mergedUpdates };
        debugLog(`Survey state updated:`, newSurvey);
        return newSurvey;
      });

      if (!surveyId) {
        return mergedUpdates;
      }

      updateLocalCache(mergedUpdates);
      return mergedUpdates;
    });
  }, [surveyId, updateLocalCache]);

  // Immediate save for critical settings like recording
  const immediateUpdate = useCallback(async (updates: Partial<Survey>) => {
    if (!surveyId) {
      console.error('Cannot immediately update: no survey ID');
      return;
    }

    debugLog(`Immediate update for survey ${surveyId}:`, updates);

    // Update local state first
    setSurvey(prev => ({ ...prev, ...updates }));
    updateLocalCache(updates);

    try {
      await updateSurvey({
        surveyId,
        updates
      });
      
      debugLog(`Immediate update completed for survey ${surveyId}`);
    } catch (error) {
      console.error(`Error in immediate update for survey ${surveyId}:`, error);
      // Revert local state on error
      setSurvey(prev => {
        const reverted = { ...prev };
        Object.keys(updates).forEach(key => {
          delete reverted[key as keyof Survey];
        });
        return reverted;
      });
      
      toast({
        title: "Error updating survey",
        description: "There was an error saving your changes. Please try again.",
        variant: "destructive"
      });
    }
  }, [surveyId, updateSurvey, updateLocalCache, toast]);

  const handleTitleChange = useCallback((title: string) => {
    debugLog(`Title change for survey ${surveyId}: ${title}`);
    batchUpdate({ title });
    document.title = title;
    smartAutoSave.markTextChange();
  }, [surveyId, batchUpdate, smartAutoSave]);

  const handleDescriptionChange = useCallback((description: string) => {
    debugLog(`Description change for survey ${surveyId}: ${description}`);
    batchUpdate({ description });
    smartAutoSave.markTextChange();
  }, [surveyId, batchUpdate, smartAutoSave]);

  const updateSurveyField = useCallback((field: keyof Survey, value: any) => {
    debugLog(`Updating field ${field} for survey ${surveyId} with value:`, value);
    
    if (field === 'redirectUrl' && value && !value.startsWith('http')) {
      debugWarn('Invalid URL format for redirectUrl:', value);
    }
    
    // Recording settings need immediate save to prevent toggle resets
    if (field === 'recordingEnabled' || field === 'recordingRequired') {
      debugLog(`Immediate save for recording field: ${field}`);
      immediateUpdate({ [field]: value });
      return;
    }
    
    batchUpdate({ [field]: value });
    
    const textFields = ['welcomeTitle', 'welcomeMessage', 'welcomeInstructions', 'welcomeButtonText', 
                       'thankYouTitle', 'thankYouMessage', 'thankYouButtonText', 'redirectUrl'];
    
    if (textFields.includes(field)) {
      smartAutoSave.markTextChange();
    } else {
      smartAutoSave.markStructuralChange();
    }
  }, [surveyId, batchUpdate, immediateUpdate, smartAutoSave]);

  const handleQuestionChange = useCallback((updatedQuestion: Question) => {
    debugLog(`Question change for survey ${surveyId}:`, updatedQuestion.id);
    updateQuestion(updatedQuestion);
    smartAutoSave.markTextChange();
  }, [surveyId, updateQuestion, smartAutoSave]);

  const handleAddQuestion = useCallback(() => {
    debugLog(`Adding question to survey ${surveyId}`);
    const newQuestion = addQuestion();
    smartAutoSave.markStructuralChange();
    return newQuestion;
  }, [surveyId, addQuestion, smartAutoSave]);

  const handleDeleteQuestion = useCallback((questionId: string) => {
    debugLog(`Deleting question ${questionId} from survey ${surveyId}`);
    deleteQuestion(questionId);
    smartAutoSave.markStructuralChange();
  }, [surveyId, deleteQuestion, smartAutoSave]);

  const handleDuplicateQuestion = useCallback((question: Question) => {
    debugLog(`Duplicating question ${question.id} in survey ${surveyId}`);
    const newQuestion = duplicateQuestion(question);
    smartAutoSave.markStructuralChange();
    return newQuestion;
  }, [surveyId, duplicateQuestion, smartAutoSave]);

  const togglePublish = useCallback(async () => {
    if (!surveyId) {
      console.error('Cannot toggle publish: no survey ID');
      return;
    }

    const newPublishState = !survey.isPublished;
    debugLog(`Toggling publish state for survey ${surveyId}: ${newPublishState}`);
    
    const updates = { 
      isPublished: newPublishState
    };
    
    batchUpdate(updates);
    
    try {
      const result = await updateSurvey({
        surveyId,
        updates
      });
      
      if (result.publicCode && result.publicCode !== survey.publicCode) {
        debugLog(`Received new public code from database: ${result.publicCode}`);
        setSurvey(prev => ({ ...prev, publicCode: result.publicCode }));
        updateLocalCache({ publicCode: result.publicCode });
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
    handleSave: smartAutoSave.manualSave,
    pendingChanges: smartAutoSave.hasPendingChanges(),
    setPendingChanges: () => {},
    isLoading,
    error,
    isSaving: smartAutoSave.isSaving,
    isTyping: smartAutoSave.isTyping,
    lastSaved: smartAutoSave.lastSaved,
    retryCount: smartAutoSave.retryCount,
    saveError: smartAutoSave.saveError
  };
};
