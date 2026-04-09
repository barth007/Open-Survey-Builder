import React from 'react';
import { Download, Play, Trash2, Video } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { Button } from '@/components/ui/button';

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

const formatFileSize = (bytes: number | null): string => {
  if (!bytes) return 'Unknown size';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let i = 0;
  while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
  return `${size.toFixed(1)} ${units[i]}`;
};

const formatDuration = (seconds: number | null): string => {
  if (!seconds) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const RecordingManagement: React.FC<RecordingManagementProps> = ({
  recordings,
  onPlay,
  onDownload,
  onDelete,
  isLoading = false,
}) => {
  return (
    <section className="overflow-hidden rounded-[34px] border border-border/70 bg-background shadow-[0_14px_50px_rgba(15,15,15,0.05)]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/60 bg-muted/[0.18] px-6 py-4 sm:px-8">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-background">
          <Video className="h-4 w-4 text-foreground/70" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Recordings
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoading ? 'Loading…' : recordings.length === 0 ? 'No recordings yet' : `${recordings.length} recording${recordings.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-foreground/40" />
        </div>
      ) : recordings.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/70 bg-muted/[0.08]">
            <Video className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">No recordings yet</p>
          <p className="max-w-xs text-xs text-muted-foreground/70">
            Recordings appear here once participants complete surveys with recording enabled.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/40">
          {recordings.map((recording) => (
            <div
              key={recording.id}
              className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-muted/[0.04] sm:px-8"
            >
              {/* Meta */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-muted/[0.08]">
                  <Video className="h-4 w-4 text-muted-foreground/70" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-border/70 bg-muted/25 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {recording.recording_type}
                    </span>
                    <span className="rounded-full border border-border/70 bg-muted/25 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {recording.file_format.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDuration(recording.duration_seconds)} &middot; {formatFileSize(recording.file_size_bytes)} &middot; {formatDistanceToNow(new Date(recording.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPlay(recording)}
                  className="gap-1.5 rounded-full border-border/70 shadow-none"
                >
                  <Play className="h-3.5 w-3.5" />
                  Play
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownload(recording)}
                  className="gap-1.5 rounded-full border-border/70 shadow-none"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(recording.id)}
                  className="gap-1.5 rounded-full border-border/70 text-destructive shadow-none hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
