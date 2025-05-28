
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

  // Trigger auto-save when pendingChanges becomes true
  useEffect(() => {
    if (pendingChanges && !isSaving) {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      
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

  // Save before unload
  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      if (pendingChanges && !isSaving) {
        e.preventDefault();
        e.returnValue = '';
        
        // Try to save immediately
        try {
          await onSave();
        } catch (error) {
          console.error('Failed to save before unload:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pendingChanges, isSaving, onSave]);

  return {
    pendingChanges,
    setPendingChanges,
    isSaving,
    lastSaved
  };
};
