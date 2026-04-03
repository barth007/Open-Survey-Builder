import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { apiFetch } from '@/lib/api';

interface UseRecordingUploadReturn {
  uploadRecording: (
    blob: Blob,
    responseId: string,
    sessionToken?: string,
  ) => Promise<string | null>;
  isUploading: boolean;
  uploadError: string | null;
}

export const useRecordingUpload = (): UseRecordingUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadRecording = async (
    blob: Blob,
    responseId: string,
    sessionToken?: string,
  ): Promise<string | null> => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const fileExtension = 'webm';
      const fileName = `survey-recording-${uuidv4()}.${fileExtension}`;
      const uploadFile = new File([blob], fileName, {
        type: 'video/webm',
        lastModified: Date.now(),
      });
      const formData = new FormData();

      formData.append('recording', uploadFile);
      formData.append('responseId', responseId);
      formData.append('sessionToken', sessionToken || '');
      formData.append('questionId', '');
      formData.append('recordingType', 'screen-webcam');
      formData.append('fileFormat', fileExtension);

      const data = await apiFetch('/surveys/recordings/upload', {
        method: 'POST',
        body: formData,
      }) as { recordingUrl?: string };

      return data.recordingUrl || null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadError(errorMessage);
      console.error('Recording upload error:', error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadRecording,
    isUploading,
    uploadError,
  };
};
