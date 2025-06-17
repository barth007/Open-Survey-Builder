
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Recording {
  id: string;
  recording_url: string;
  recording_type: string;
  file_format: string;
  duration_seconds: number | null;
  file_size_bytes: number | null;
  created_at: string;
  response_id: string;
  question_id: string;
}

export const useRecordingManagement = (surveyId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);

  // Fetch recordings for a survey
  const { data: recordings = [], isLoading } = useQuery({
    queryKey: ['survey-recordings', surveyId],
    queryFn: async () => {
      // First get response IDs for this survey
      const { data: responses, error: responsesError } = await supabase
        .from('survey_responses')
        .select('id')
        .eq('survey_id', surveyId);

      if (responsesError) {
        console.error('Error fetching survey responses:', responsesError);
        throw responsesError;
      }

      if (!responses || responses.length === 0) {
        return [];
      }

      const responseIds = responses.map(r => r.id);

      // Then fetch recordings for those responses
      const { data, error } = await supabase
        .from('question_recordings')
        .select(`
          id,
          recording_url,
          recording_type,
          file_format,
          duration_seconds,
          file_size_bytes,
          created_at,
          response_id,
          question_id
        `)
        .in('response_id', responseIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching recordings:', error);
        throw error;
      }

      return data as Recording[];
    },
    enabled: !!surveyId
  });

  // Delete recording mutation
  const deleteRecordingMutation = useMutation({
    mutationFn: async (recordingId: string) => {
      const recording = recordings.find(r => r.id === recordingId);
      if (!recording) throw new Error('Recording not found');

      // Extract filename from URL for storage deletion
      const url = new URL(recording.recording_url);
      const filename = url.pathname.split('/').pop();

      // Delete from storage
      if (filename) {
        const { error: storageError } = await supabase.storage
          .from('survey-recordings')
          .remove([filename]);

        if (storageError) {
          console.error('Error deleting from storage:', storageError);
          // Continue with database deletion even if storage deletion fails
        }
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('question_recordings')
        .delete()
        .eq('id', recordingId);

      if (dbError) {
        throw dbError;
      }

      return recordingId;
    },
    onSuccess: (recordingId) => {
      queryClient.invalidateQueries({ queryKey: ['survey-recordings', surveyId] });
      toast({
        title: "Recording deleted",
        description: "The recording has been permanently removed",
      });
    },
    onError: (error) => {
      console.error('Error deleting recording:', error);
      toast({
        title: "Error deleting recording",
        description: "There was an error deleting the recording. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handlePlay = useCallback((recording: Recording) => {
    setSelectedRecording(recording);
  }, []);

  const handleDownload = useCallback(async (recording: Recording) => {
    try {
      const response = await fetch(recording.recording_url);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `recording-${recording.id}.${recording.file_format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download started",
        description: "The recording download has started",
      });
    } catch (error) {
      console.error('Error downloading recording:', error);
      toast({
        title: "Download failed",
        description: "There was an error downloading the recording",
        variant: "destructive"
      });
    }
  }, [toast]);

  const handleDelete = useCallback((recordingId: string) => {
    deleteRecordingMutation.mutate(recordingId);
  }, [deleteRecordingMutation]);

  const closePlayer = useCallback(() => {
    setSelectedRecording(null);
  }, []);

  return {
    recordings,
    isLoading,
    selectedRecording,
    handlePlay,
    handleDownload,
    handleDelete,
    closePlayer,
    isDeleting: deleteRecordingMutation.isPending
  };
};
