
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Download, Trash2, Video } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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

interface RecordingManagementProps {
  recordings: Recording[];
  onPlay: (recording: Recording) => void;
  onDownload: (recording: Recording) => void;
  onDelete: (recordingId: string) => void;
  isLoading?: boolean;
}

export const RecordingManagement: React.FC<RecordingManagementProps> = ({
  recordings,
  onPlay,
  onDownload,
  onDelete,
  isLoading = false
}) => {
  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'Unknown duration';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Recordings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recordings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Recordings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recordings available for this survey</p>
            <p className="text-sm">Recordings will appear here when participants complete surveys with recording enabled</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Recordings ({recordings.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recordings.map((recording) => (
          <div
            key={recording.id}
            className="flex items-center justify-between p-4 border rounded-lg bg-muted/30"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {recording.recording_type}
                </Badge>
                <Badge variant="outline">
                  {recording.file_format.toUpperCase()}
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Duration: {formatDuration(recording.duration_seconds)}</p>
                <p>Size: {formatFileSize(recording.file_size_bytes)}</p>
                <p>Created: {formatDistanceToNow(new Date(recording.created_at), { addSuffix: true })}</p>
                {recording.question_id && (
                  <p>Question: {recording.question_id}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPlay(recording)}
                className="flex items-center gap-1"
              >
                <Play className="h-4 w-4" />
                Play
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(recording)}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(recording.id)}
                className="flex items-center gap-1 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
