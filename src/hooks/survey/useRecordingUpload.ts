
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface UseRecordingUploadReturn {
  uploadRecording: (
    blob: Blob,
    questionId: string,
    responseId: string,
    recordingType: 'audio' | 'video'
  ) => Promise<string | null>;
  isUploading: boolean;
  uploadError: string | null;
}

export const useRecordingUpload = (): UseRecordingUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadRecording = async (
    blob: Blob,
    questionId: string,
    responseId: string,
    recordingType: 'audio' | 'video'
  ): Promise<string | null> => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const fileExtension = recordingType === 'video' ? 'webm' : 'webm';
      const fileName = `${responseId}/${questionId}/${uuidv4()}.${fileExtension}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('survey-recordings')
        .upload(fileName, blob, {
          contentType: recordingType === 'video' ? 'video/webm' : 'audio/webm',
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

      // Save recording metadata to database
      const { error: dbError } = await supabase
        .from('question_recordings')
        .insert({
          response_id: responseId,
          question_id: questionId,
          recording_url: recordingUrl,
          recording_type: recordingType,
          file_format: fileExtension,
          duration_seconds: 0, // Will be updated with actual duration
          file_size_bytes: blob.size
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
