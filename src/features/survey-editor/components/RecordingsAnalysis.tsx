
import React from 'react';
import { useRecordingManagement } from '@/hooks/survey/useRecordingManagement';
import { RecordingManagement } from '@/components/survey/recording/RecordingManagement';
import { RecordingPlayer } from '@/components/survey/recording/RecordingPlayer';

interface RecordingsAnalysisProps {
  surveyId: string;
}

export const RecordingsAnalysis: React.FC<RecordingsAnalysisProps> = ({ surveyId }) => {
  const {
    recordings,
    isLoading,
    selectedRecording,
    handlePlay,
    handleDownload,
    handleDelete,
    closePlayer
  } = useRecordingManagement(surveyId);

  return (
    <div className="space-y-6">
      <RecordingManagement
        recordings={recordings}
        onPlay={handlePlay}
        onDownload={handleDownload}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <RecordingPlayer
        recording={selectedRecording}
        isOpen={!!selectedRecording}
        onClose={closePlayer}
      />
    </div>
  );
};
