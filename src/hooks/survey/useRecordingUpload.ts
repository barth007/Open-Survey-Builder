
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface UseRecordingUploadReturn {
  uploadRecording: (
    blob: Blob,
    responseId: string
  ) => Promise<string | null>;
  isUploading: boolean;
  uploadError: string | null;
}

export const useRecordingUpload = (): UseRecordingUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadRecording = async (
    blob: Blob,
    responseId: string
  ): Promise<string | null> => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const fileExtension = 'webm';
      const fileName = `${responseId}/survey-recording-${uuidv4()}.${fileExtension}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('survey-recordings')
        .upload(fileName, blob, {
          contentType: 'video/webm',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('survey-recordings')
        .getPublicUrl(fileName);

      const recordingUrl = urlData.publicUrl;

      // Save recording metadata to database using existing RPC call
      const { error: dbError } = await supabase.rpc('create_question_recording', {
        p_response_id: responseId,
        p_question_id: '', // Empty for survey-wide recordings
        p_recording_url: recordingUrl,
        p_recording_type: 'screen-webcam',
        p_file_format: fileExtension,
        p_file_size_bytes: blob.size
      });

      if (dbError) {
        // If database insert fails, try to clean up the uploaded file
        await supabase.storage
          .from('survey-recordings')
          .remove([fileName]);
        
        throw new Error(`Database error: ${dbError.message}`);
      }

      return recordingUrl;
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
    uploadError
  };
};
