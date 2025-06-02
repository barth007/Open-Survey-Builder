
import { useState, useCallback } from 'react';

interface RecordingPermissions {
  audio: boolean;
  video: boolean;
}

interface UseRecordingPermissionsReturn {
  permissions: RecordingPermissions | null;
  requestPermissions: (audio: boolean, video: boolean) => Promise<boolean>;
  hasPermissions: (audio: boolean, video: boolean) => boolean;
  revokePermissions: () => void;
}

export const useRecordingPermissions = (): UseRecordingPermissionsReturn => {
  const [permissions, setPermissions] = useState<RecordingPermissions | null>(null);

  const requestPermissions = useCallback(async (audio: boolean, video: boolean): Promise<boolean> => {
    try {
      const constraints: MediaStreamConstraints = {};
      
      if (audio) constraints.audio = true;
      if (video) constraints.video = true;

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Stop the stream immediately after getting permission
      stream.getTracks().forEach(track => track.stop());
      
      setPermissions({ audio, video });
      return true;
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }, []);

  const hasPermissions = useCallback((audio: boolean, video: boolean): boolean => {
    if (!permissions) return false;
    
    if (audio && !permissions.audio) return false;
    if (video && !permissions.video) return false;
    
    return true;
  }, [permissions]);

  const revokePermissions = useCallback(() => {
    setPermissions(null);
  }, []);

  return {
    permissions,
    requestPermissions,
    hasPermissions,
    revokePermissions
  };
};
