
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

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

interface RecordingPlayerProps {
  recording: Recording | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RecordingPlayer: React.FC<RecordingPlayerProps> = ({
  recording,
  isOpen,
  onClose
}) => {
  if (!recording) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Recording Playback
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-black rounded-lg overflow-hidden">
            <video
              src={recording.recording_url}
              controls
              className="w-full h-auto"
              style={{ maxHeight: '70vh' }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Type:</strong> {recording.recording_type}</p>
            <p><strong>Format:</strong> {recording.file_format.toUpperCase()}</p>
            {recording.duration_seconds && (
              <p><strong>Duration:</strong> {Math.floor(recording.duration_seconds / 60)}:{(recording.duration_seconds % 60).toString().padStart(2, '0')}</p>
            )}
            <p><strong>Created:</strong> {new Date(recording.created_at).toLocaleString()}</p>
            <p><strong>Response ID:</strong> {recording.response_id}</p>
            {recording.question_id && (
              <p><strong>Question ID:</strong> {recording.question_id}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
