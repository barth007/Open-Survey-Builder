import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiFetch, fetchBackendBlob } from '@/lib/api';
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

type ApiRecording = {
  id: string;
  recordingUrl: string;
  recordingType: string;
  fileFormat: string;
  durationSeconds: number | null;
  fileSizeBytes: number | null;
  createdAt: string;
  responseId: string;
  questionId: string;
};

const mapRecording = (recording: ApiRecording): Recording => ({
  id: recording.id,
  recording_url: recording.recordingUrl,
  recording_type: recording.recordingType,
  file_format: recording.fileFormat,
  duration_seconds: recording.durationSeconds,
  file_size_bytes: recording.fileSizeBytes,
  created_at: recording.createdAt,
  response_id: recording.responseId,
  question_id: recording.questionId,
});

export const useRecordingManagement = (surveyId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);

  const { data: recordings = [], isLoading } = useQuery({
    queryKey: ['survey-recordings', surveyId],
    queryFn: async () => {
      const data = await apiFetch(`/surveys/${surveyId}/recordings`) as ApiRecording[];
      return (data || []).map(mapRecording);
    },
    enabled: Boolean(surveyId),
  });

  const deleteRecordingMutation = useMutation({
    mutationFn: async (recordingId: string) => {
      await apiFetch(`/surveys/recordings/${recordingId}`, {
        method: 'DELETE',
      });

      return recordingId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['survey-recordings', surveyId] });
      toast({
        title: 'Recording deleted',
        description: 'The recording has been permanently removed',
      });
    },
    onError: (error) => {
      console.error('Error deleting recording:', error);
      toast({
        title: 'Error deleting recording',
        description: 'There was an error deleting the recording. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handlePlay = useCallback((recording: Recording) => {
    setSelectedRecording(recording);
  }, []);

  const handleDownload = useCallback(async (recording: Recording) => {
    try {
      const blob = await fetchBackendBlob(recording.recording_url);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `recording-${recording.id}.${recording.file_format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Download started',
        description: 'The recording download has started',
      });
    } catch (error) {
      console.error('Error downloading recording:', error);
      toast({
        title: 'Download failed',
        description: 'There was an error downloading the recording',
        variant: 'destructive',
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
    isDeleting: deleteRecordingMutation.isPending,
  };
};
