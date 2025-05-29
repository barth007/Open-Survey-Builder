
import React, { useEffect, useRef, useCallback } from 'react';
import { useDebounce } from '../useDebounce';

interface UseAutoSaveProps {
  onSave: () => Promise<void>;
  delay?: number;
  pendingChanges: boolean;
  setPendingChanges: (value: boolean) => void;
}

export function useAutoSave({ 
  onSave, 
  delay = 5000, // Increased from 2000 to 5000 to reduce API calls
  pendingChanges, 
  setPendingChanges 
}: UseAutoSaveProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isManualSaveRef = useRef(false);
  const maxRetries = 3;

  // Debounce pending changes to avoid excessive auto-saves
  const debouncedPendingChanges = useDebounce(pendingChanges, delay);

  const performSaveWithRetry = useCallback(async (): Promise<boolean> => {
    try {
      console.log(`Attempting save (attempt ${retryCount + 1}/${maxRetries + 1})`);
      await onSave();
      setLastSaved(new Date());
      setPendingChanges(false);
      setRetryCount(0);
      console.log("Save completed successfully");
      return true;
    } catch (error) {
      console.error(`Save failed (attempt ${retryCount + 1}):`, error);
      
      // Check if it's a temporary error that we should retry
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isTemporaryError = errorMessage.includes('rate limit') || 
                              errorMessage.includes('network') || 
                              errorMessage.includes('timeout') ||
                              errorMessage.includes('429');
      
      if (isTemporaryError && retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff
        console.log(`Retrying save in ${retryDelay}ms...`);
        
        setTimeout(() => {
          if (!isManualSaveRef.current) {
            performSaveWithRetry();
          }
        }, retryDelay);
        
        return false;
      } else {
        // Permanent error or max retries reached
        setRetryCount(0);
        throw error;
      }
    }
  }, [onSave, retryCount, setPendingChanges, maxRetries]);

  const performSave = useCallback(async () => {
    if (isSaving || isManualSaveRef.current) {
      console.log("Skipping auto-save - already saving or manual save in progress");
      return;
    }

    console.log("Starting auto-save...");
    setIsSaving(true);
    
    try {
      await performSaveWithRetry();
      console.log("Auto-save completed successfully");
    } catch (error) {
      console.error('Auto-save failed after all retries:', error);
    } finally {
      setIsSaving(false);
    }
  }, [performSaveWithRetry, isSaving]);

  // Auto-save when there are debounced pending changes
  useEffect(() => {
    if (debouncedPendingChanges && !isManualSaveRef.current && !isSaving) {
      console.log("Triggering auto-save due to pending changes");
      performSave();
    }
  }, [debouncedPendingChanges, performSave, isSaving]);

  // Manual save function that prevents auto-save conflicts
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
      // Reset manual save flag after a short delay
      setTimeout(() => {
        isManualSaveRef.current = false;
        console.log("Manual save flag reset");
      }, 1500); // Increased from 1000 to 1500
    }
  }, [performSaveWithRetry]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    isSaving,
    lastSaved,
    manualSave,
    retryCount
  };
}
