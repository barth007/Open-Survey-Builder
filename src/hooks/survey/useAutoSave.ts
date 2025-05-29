
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
  delay = 3000, 
  pendingChanges, 
  setPendingChanges 
}: UseAutoSaveProps) {
  const [isSaving, setIsSaving] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isManualSaveRef = useRef(false);

  // Debounce pending changes to avoid excessive auto-saves
  const debouncedPendingChanges = useDebounce(pendingChanges, delay);

  const performSave = useCallback(async () => {
    if (isSaving || isManualSaveRef.current) {
      console.log("Skipping auto-save - already saving or manual save in progress");
      return;
    }

    console.log("Starting auto-save...");
    setIsSaving(true);
    try {
      await onSave();
      setLastSaved(new Date());
      setPendingChanges(false);
      console.log("Auto-save completed successfully");
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [onSave, isSaving, setPendingChanges]);

  // Auto-save when there are debounced pending changes
  useEffect(() => {
    if (debouncedPendingChanges && !isManualSaveRef.current) {
      console.log("Triggering auto-save due to pending changes");
      performSave();
    }
  }, [debouncedPendingChanges, performSave]);

  // Manual save function that prevents auto-save conflicts
  const manualSave = useCallback(async () => {
    console.log("Starting manual save...");
    isManualSaveRef.current = true;
    
    // Clear any pending auto-save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    try {
      await performSave();
      console.log("Manual save completed successfully");
    } finally {
      // Reset manual save flag after a short delay
      setTimeout(() => {
        isManualSaveRef.current = false;
        console.log("Manual save flag reset");
      }, 1000);
    }
  }, [performSave]);

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
    manualSave
  };
}
