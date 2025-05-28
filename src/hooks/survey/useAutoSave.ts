
import { useState, useEffect, useRef } from 'react';

interface UseAutoSaveProps {
  onSave: () => Promise<void>;
  delay?: number;
}

export const useAutoSave = ({ onSave, delay = 2000 }: UseAutoSaveProps) => {
  const [pendingChanges, setPendingChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    
    if (pendingChanges && !isSaving) {
      saveTimerRef.current = setTimeout(async () => {
        setIsSaving(true);
        try {
          await onSave();
          setPendingChanges(false);
          setLastSaved(new Date());
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setIsSaving(false);
        }
      }, delay);
    }
    
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [pendingChanges, isSaving, onSave, delay]);

  return {
    pendingChanges,
    setPendingChanges,
    isSaving,
    lastSaved
  };
};
