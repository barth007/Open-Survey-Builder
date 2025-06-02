
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Video, VideoOff, Square, Play, Pause, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecordingWidgetProps {
  questionId: string;
  recordingType: 'audio' | 'video';
  onRecordingComplete: (blob: Blob, duration: number) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  maxDuration?: number; // in seconds
  className?: string;
}

export const RecordingWidget: React.FC<RecordingWidgetProps> = ({
  questionId,
  recordingType,
  onRecordingComplete,
  onRecordingStart,
  onRecordingStop,
  maxDuration = 90,
  className
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: recordingType === 'video'
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current && recordingType === 'video') {
        videoRef.current.srcObject = mediaStream;
      }

      const mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: recordingType === 'video' 
          ? 'video/webm;codecs=vp9' 
          : 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recordingType === 'video' ? 'video/webm' : 'audio/webm'
        });
        setRecordedBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      onRecordingStart?.();

      // Start timer
      intervalRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1;
          if (newDuration >= maxDuration) {
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      onRecordingStop?.();

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      intervalRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1;
          if (newDuration >= maxDuration) {
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);
    }
  };

  const handleComplete = () => {
    if (recordedBlob) {
      onRecordingComplete(recordedBlob, duration);
    }
  };

  const reset = () => {
    setRecordedBlob(null);
    setDuration(0);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <Card className={cn("p-4", className)}>
      <div className="space-y-4">
        {recordingType === 'video' && (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-48 bg-gray-100 rounded-md object-cover"
            />
            {!isRecording && !stream && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-md">
                <Video className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {recordingType === 'audio' ? (
              <Mic className={cn("h-5 w-5", isRecording && "text-red-500")} />
            ) : (
              <Video className={cn("h-5 w-5", isRecording && "text-red-500")} />
            )}
            <span className="text-sm font-medium">
              {recordingType === 'audio' ? 'Audio' : 'Video'} Recording
            </span>
          </div>

          <div className="text-sm font-mono">
            {formatTime(duration)} / {formatTime(maxDuration)}
          </div>
        </div>

        {isRecording && (
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(duration / maxDuration) * 100}%` }}
              />
            </div>
            <span className="text-xs text-red-500 animate-pulse">REC</span>
          </div>
        )}

        <div className="flex gap-2">
          {!isRecording && !recordedBlob && (
            <Button onClick={startRecording} className="flex-1">
              {recordingType === 'audio' ? <Mic className="h-4 w-4 mr-2" /> : <Video className="h-4 w-4 mr-2" />}
              Start Recording
            </Button>
          )}

          {isRecording && !isPaused && (
            <>
              <Button onClick={pauseRecording} variant="outline">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
              <Button onClick={stopRecording} variant="destructive">
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            </>
          )}

          {isRecording && isPaused && (
            <>
              <Button onClick={resumeRecording}>
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
              <Button onClick={stopRecording} variant="destructive">
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            </>
          )}

          {recordedBlob && (
            <>
              <Button onClick={reset} variant="outline">
                Re-record
              </Button>
              <Button onClick={handleComplete}>
                <Upload className="h-4 w-4 mr-2" />
                Use Recording
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};
