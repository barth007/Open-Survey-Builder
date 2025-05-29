
import { useEffect, useRef, useCallback } from 'react';
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
      return;
    }

    setIsSaving(true);
    try {
      await onSave();
      setLastSaved(new Date());
      setPendingChanges(false);
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [onSave, isSaving, setPendingChanges]);

  // Auto-save when there are debounced pending changes
  useEffect(() => {
    if (debouncedPendingChanges && !isManualSaveRef.current) {
      performSave();
    }
  }, [debouncedPendingChanges, performSave]);

  // Manual save function that prevents auto-save conflicts
  const manualSave = useCallback(async () => {
    isManualSaveRef.current = true;
    
    // Clear any pending auto-save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    try {
      await performSave();
    } finally {
      // Reset manual save flag after a short delay
      setTimeout(() => {
        isManualSaveRef.current = false;
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
