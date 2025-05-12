
import { useState, useEffect } from 'react';

interface UseAutoSaveProps {
  onSave: () => void;
  delay?: number;
}

export const useAutoSave = ({ onSave, delay = 2000 }: UseAutoSaveProps) => {
  const [pendingChanges, setPendingChanges] = useState(false);

  useEffect(() => {
    let saveTimer: ReturnType<typeof setTimeout>;
    
    if (pendingChanges) {
      saveTimer = setTimeout(() => {
        onSave();
        setPendingChanges(false);
      }, delay); // Save after delay of inactivity
    }
    
    return () => {
      if (saveTimer) clearTimeout(saveTimer);
    };
  }, [pendingChanges, onSave, delay]);

  return {
    pendingChanges,
    setPendingChanges
  };
};
