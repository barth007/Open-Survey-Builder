
import { debugLog, debugWarn } from '@/lib/logger';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useDebounce } from '../useDebounce';

interface UseSmartAutoSaveProps {
  onSave: () => Promise<void>;
  textFieldDelay?: number; // For text inputs like title, description
  structuralChangeDelay?: number; // For structural changes like add/delete questions
}

interface ChangeBuffer {
  hasTextChanges: boolean;
  hasStructuralChanges: boolean;
  lastTextChange: number;
  lastStructuralChange: number;
}

export function useSmartAutoSave({ 
  onSave, 
  textFieldDelay = 2000, // Increased for more stability during option generation
  structuralChangeDelay = 1000 // Increased to prevent interference with Likert generation
}: UseSmartAutoSaveProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  const changeBufferRef = useRef<ChangeBuffer>({
    hasTextChanges: false,
    hasStructuralChanges: false,
    lastTextChange: 0,
    lastStructuralChange: 0
  });
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isManualSaveRef = useRef(false);
  const pendingSaveRef = useRef(false);
  const maxRetries = 3;

  // Track when user is actively typing
  const markAsTyping = useCallback(() => {
    setIsTyping(true);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set typing to false after 1000ms of no activity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  }, []);

  const performSaveWithRetry = useCallback(async (): Promise<boolean> => {
    if (pendingSaveRef.current) {
      debugLog("Save already pending, skipping duplicate save");
      return false;
    }

    pendingSaveRef.current = true;
    
    try {
      debugLog(`Attempting save (attempt ${retryCount + 1}/${maxRetries + 1})`);
      await onSave();
      setLastSaved(new Date());
      setRetryCount(0);
      setSaveError(null);
      
      // Clear the change buffer after successful save
      changeBufferRef.current = {
        hasTextChanges: false,
        hasStructuralChanges: false,
        lastTextChange: 0,
        lastStructuralChange: 0
      };
      
      debugLog("Save completed successfully");
      return true;
    } catch (error) {
      console.error(`Save failed (attempt ${retryCount + 1}):`, error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      setSaveError(errorMessage);
      
      const isTemporaryError = errorMessage.includes('rate limit') || 
                              errorMessage.includes('network') || 
                              errorMessage.includes('timeout') ||
                              errorMessage.includes('429') ||
                              errorMessage.includes('conflict');
      
      if (isTemporaryError && retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 8000);
        debugLog(`Retrying save in ${retryDelay}ms...`);
        
        setTimeout(() => {
          if (!isManualSaveRef.current) {
            pendingSaveRef.current = false;
            performSaveWithRetry();
          }
        }, retryDelay);
        
        return false;
      } else {
        setRetryCount(0);
        throw error;
      }
    } finally {
      pendingSaveRef.current = false;
    }
  }, [onSave, retryCount, maxRetries]);

  const scheduleSave = useCallback((delay: number) => {
    // If already saving or manual save in progress, don't schedule new save
    if (isSaving || isManualSaveRef.current || pendingSaveRef.current) {
      debugLog("Skipping scheduled save - already saving");
      return;
    }

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    debugLog(`Scheduling save in ${delay}ms`);
    
    saveTimeoutRef.current = setTimeout(async () => {
      if (isSaving || isManualSaveRef.current || pendingSaveRef.current) {
        debugLog("Skipping scheduled save - already saving or manual save in progress");
        return;
      }

      debugLog("Executing scheduled save");
      setIsSaving(true);
      
      try {
        await performSaveWithRetry();
      } catch (error) {
        console.error('Scheduled save failed after all retries:', error);
        setSaveError(error instanceof Error ? error.message : 'Save failed');
      } finally {
        setIsSaving(false);
      }
    }, delay);
  }, [isSaving, performSaveWithRetry]);

  // Mark text changes (like typing in title, description, etc.)
  const markTextChange = useCallback(() => {
    markAsTyping();
    
    const now = Date.now();
    changeBufferRef.current.hasTextChanges = true;
    changeBufferRef.current.lastTextChange = now;
    
    debugLog("Text change detected, scheduling save");
    scheduleSave(textFieldDelay);
  }, [markAsTyping, scheduleSave, textFieldDelay]);

  // Mark structural changes (add/delete questions, reorder, etc.)
  const markStructuralChange = useCallback(() => {
    const now = Date.now();
    changeBufferRef.current.hasStructuralChanges = true;
    changeBufferRef.current.lastStructuralChange = now;
    
    debugLog("Structural change detected, scheduling save with longer delay");
    scheduleSave(structuralChangeDelay);
  }, [scheduleSave, structuralChangeDelay]);

  // Manual save function
  const manualSave = useCallback(async () => {
    debugLog("Starting manual save...");
    isManualSaveRef.current = true;
    
    // Clear any pending auto-save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    setIsSaving(true);
    try {
      await performSaveWithRetry();
      debugLog("Manual save completed successfully");
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        isManualSaveRef.current = false;
        debugLog("Manual save flag reset");
      }, 1000);
    }
  }, [performSaveWithRetry]);

  // Check if there are pending changes
  const hasPendingChanges = useCallback(() => {
    return changeBufferRef.current.hasTextChanges || changeBufferRef.current.hasStructuralChanges;
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      pendingSaveRef.current = false;
    };
  }, []);

  return {
    isSaving,
    lastSaved,
    retryCount,
    isTyping,
    saveError,
    manualSave,
    markTextChange,
    markStructuralChange,
    hasPendingChanges
  };
}
