export interface RecordingAsset {
  id: string;
  recordingUrl: string;
  recordingType: string;
  fileFormat: string;
  durationSeconds: number | null;
  fileSizeBytes: number | null;
  createdAt: string;
  responseId: string;
  questionId: string;
}

interface RawRecording {
  id: string;
  recordingUrl?: string;
  recording_url?: string;
  recordingType?: string;
  recording_type?: string;
  fileFormat?: string;
  file_format?: string;
  durationSeconds?: number | null;
  duration_seconds?: number | null;
  fileSizeBytes?: number | null;
  file_size_bytes?: number | null;
  createdAt?: string;
  created_at?: string;
  responseId?: string;
  response_id?: string;
  questionId?: string;
  question_id?: string;
}

export const normalizeRecording = (recording: RawRecording): RecordingAsset => ({
  id: recording.id,
  recordingUrl: recording.recordingUrl ?? recording.recording_url ?? '',
  recordingType: recording.recordingType ?? recording.recording_type ?? 'screen-webcam',
  fileFormat: recording.fileFormat ?? recording.file_format ?? 'mp4',
  durationSeconds: recording.durationSeconds ?? recording.duration_seconds ?? null,
  fileSizeBytes: recording.fileSizeBytes ?? recording.file_size_bytes ?? null,
  createdAt: recording.createdAt ?? recording.created_at ?? new Date(0).toISOString(),
  responseId: recording.responseId ?? recording.response_id ?? '',
  questionId: recording.questionId ?? recording.question_id ?? '',
});

export const formatRecordingFileSize = (bytes: number | null) => {
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

export const formatRecordingDuration = (seconds: number | null) => {
  if (!seconds && seconds !== 0) return 'Unknown duration';

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const summarizeRecordings = (recordings: RecordingAsset[]) => {
  const totalDurationSeconds = recordings.reduce((sum, recording) => sum + (recording.durationSeconds ?? 0), 0);
  const totalSizeBytes = recordings.reduce((sum, recording) => sum + (recording.fileSizeBytes ?? 0), 0);

  const latestRecording = recordings.reduce<RecordingAsset | null>((latest, recording) => {
    if (!latest) return recording;
    return new Date(recording.createdAt) > new Date(latest.createdAt) ? recording : latest;
  }, null);

  return {
    count: recordings.length,
    totalDurationSeconds,
    totalSizeBytes,
    latestCreatedAt: latestRecording?.createdAt ?? null,
  };
};
