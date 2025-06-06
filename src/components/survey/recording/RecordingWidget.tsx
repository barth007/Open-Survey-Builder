
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Video, Square, Play, Pause, Upload, Monitor, Webcam } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecordingWidgetProps {
  responseId: string;
  onRecordingComplete: (blob: Blob, duration: number) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  maxDuration?: number; // in seconds
  className?: string;
}

export const RecordingWidget: React.FC<RecordingWidgetProps> = ({
  responseId,
  onRecordingComplete,
  onRecordingStart,
  onRecordingStop,
  maxDuration = 300, // 5 minutes default for survey recordings
  className
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [combinedStream, setCombinedStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const webcamVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const combineStreams = (webcam: MediaStream, screen: MediaStream): MediaStream => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 1920; // Full HD width
    canvas.height = 1080; // Full HD height

    const webcamVideo = document.createElement('video');
    const screenVideo = document.createElement('video');
    
    webcamVideo.srcObject = webcam;
    screenVideo.srcObject = screen;
    webcamVideo.play();
    screenVideo.play();

    const drawFrame = () => {
      if (!isRecording) return;
      
      // Clear canvas
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw screen capture (main content)
      if (screenVideo.readyState >= 2) {
        ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);
      }
      
      // Draw webcam in corner (picture-in-picture style)
      if (webcamVideo.readyState >= 2) {
        const webcamWidth = 320;
        const webcamHeight = 240;
        const margin = 20;
        ctx.drawImage(
          webcamVideo, 
          canvas.width - webcamWidth - margin, 
          margin, 
          webcamWidth, 
          webcamHeight
        );
      }
      
      requestAnimationFrame(drawFrame);
    };

    webcamVideo.onloadeddata = drawFrame;
    screenVideo.onloadeddata = drawFrame;

    const canvasStream = canvas.captureStream(30); // 30 FPS
    
    // Add audio from both streams
    const audioTracks = [
      ...webcam.getAudioTracks(),
      ...screen.getAudioTracks()
    ];
    
    audioTracks.forEach(track => canvasStream.addTrack(track));
    
    return canvasStream;
  };

  const startRecording = async () => {
    try {
      setError(null);
      
      // Request webcam access
      console.log('Requesting webcam access...');
      const webcam = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });
      setWebcamStream(webcam);

      // Request screen sharing
      console.log('Requesting screen sharing access...');
      const screen = await navigator.mediaDevices.getDisplayMedia({
        video: { width: 1920, height: 1080 },
        audio: true
      });
      setScreenStream(screen);

      // Set up video previews
      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = webcam;
      }
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = screen;
      }

      // Combine streams
      console.log('Combining video streams...');
      const combined = combineStreams(webcam, screen);
      setCombinedStream(combined);

      // Set up media recorder
      const mediaRecorder = new MediaRecorder(combined, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
      };

      // Handle screen share ending
      screen.getVideoTracks()[0].onended = () => {
        if (isRecording) {
          stopRecording();
        }
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

      console.log('Recording started successfully');

    } catch (error) {
      console.error('Error starting recording:', error);
      setError(`Failed to start recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
      cleanup();
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

      cleanup();
    }
  };

  const cleanup = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      setWebcamStream(null);
    }
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }
    if (combinedStream) {
      combinedStream.getTracks().forEach(track => track.stop());
      setCombinedStream(null);
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
    setError(null);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      cleanup();
    };
  }, []);

  return (
    <Card className={cn("p-4", className)}>
      <div className="space-y-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Video className="h-5 w-5" />
            <span className="font-medium">Screen + Webcam Recording</span>
          </div>
          <p className="text-sm text-muted-foreground">
            This will record your screen and webcam during the survey
          </p>
        </div>

        {(webcamStream || screenStream) && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Webcam className="h-4 w-4" />
                Webcam Preview
              </div>
              <video
                ref={webcamVideoRef}
                autoPlay
                muted
                className="w-full h-32 bg-gray-100 rounded-md object-cover"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Monitor className="h-4 w-4" />
                Screen Preview
              </div>
              <video
                ref={screenVideoRef}
                autoPlay
                muted
                className="w-full h-32 bg-gray-100 rounded-md object-cover"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm font-mono">
            {formatTime(duration)} / {formatTime(maxDuration)}
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
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          {!isRecording && !recordedBlob && (
            <Button onClick={startRecording} className="flex-1">
              <Video className="h-4 w-4 mr-2" />
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
