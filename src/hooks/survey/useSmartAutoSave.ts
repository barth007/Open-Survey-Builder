
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
  textFieldDelay = 3000, // Reduced from 5000 but still reasonable
  structuralChangeDelay = 1000 // Quick save for structural changes
}: UseSmartAutoSaveProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  
  const changeBufferRef = useRef<ChangeBuffer>({
    hasTextChanges: false,
    hasStructuralChanges: false,
    lastTextChange: 0,
    lastStructuralChange: 0
  });
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isManualSaveRef = useRef(false);
  const maxRetries = 3;

  // Track when user is actively typing
  const markAsTyping = useCallback(() => {
    setIsTyping(true);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set typing to false after 1 second of no activity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  }, []);

  const performSaveWithRetry = useCallback(async (): Promise<boolean> => {
    try {
      console.log(`Attempting save (attempt ${retryCount + 1}/${maxRetries + 1})`);
      await onSave();
      setLastSaved(new Date());
      setRetryCount(0);
      
      // Clear the change buffer after successful save
      changeBufferRef.current = {
        hasTextChanges: false,
        hasStructuralChanges: false,
        lastTextChange: 0,
        lastStructuralChange: 0
      };
      
      console.log("Save completed successfully");
      return true;
    } catch (error) {
      console.error(`Save failed (attempt ${retryCount + 1}):`, error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isTemporaryError = errorMessage.includes('rate limit') || 
                              errorMessage.includes('network') || 
                              errorMessage.includes('timeout') ||
                              errorMessage.includes('429');
      
      if (isTemporaryError && retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        console.log(`Retrying save in ${retryDelay}ms...`);
        
        setTimeout(() => {
          if (!isManualSaveRef.current) {
            performSaveWithRetry();
          }
        }, retryDelay);
        
        return false;
      } else {
        setRetryCount(0);
        throw error;
      }
    }
  }, [onSave, retryCount, maxRetries]);

  const scheduleSave = useCallback((delay: number) => {
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    console.log(`Scheduling save in ${delay}ms`);
    
    saveTimeoutRef.current = setTimeout(async () => {
      if (isSaving || isManualSaveRef.current) {
        console.log("Skipping scheduled save - already saving or manual save in progress");
        return;
      }

      console.log("Executing scheduled save");
      setIsSaving(true);
      
      try {
        await performSaveWithRetry();
      } catch (error) {
        console.error('Scheduled save failed after all retries:', error);
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
    
    console.log("Text change detected, scheduling save");
    scheduleSave(textFieldDelay);
  }, [markAsTyping, scheduleSave, textFieldDelay]);

  // Mark structural changes (add/delete questions, reorder, etc.)
  const markStructuralChange = useCallback(() => {
    const now = Date.now();
    changeBufferRef.current.hasStructuralChanges = true;
    changeBufferRef.current.lastStructuralChange = now;
    
    console.log("Structural change detected, scheduling quick save");
    scheduleSave(structuralChangeDelay);
  }, [scheduleSave, structuralChangeDelay]);

  // Manual save function
  const manualSave = useCallback(async () => {
    console.log("Starting manual save...");
    isManualSaveRef.current = true;
    
    // Clear any pending auto-save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    setIsSaving(true);
    try {
      await performSaveWithRetry();
      console.log("Manual save completed successfully");
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        isManualSaveRef.current = false;
        console.log("Manual save flag reset");
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
    };
  }, []);

  return {
    isSaving,
    lastSaved,
    retryCount,
    isTyping,
    manualSave,
    markTextChange,
    markStructuralChange,
    hasPendingChanges
  };
}
