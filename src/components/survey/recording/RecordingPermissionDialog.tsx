
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mic, Video, Shield, ExternalLink, AlertTriangle } from 'lucide-react';

interface RecordingPermissionDialogProps {
  isOpen: boolean;
  onPermissionGranted: (permissions: { audio: boolean; video: boolean }) => void;
  onDecline: () => void;
  requiresAudio?: boolean;
  requiresVideo?: boolean;
  surveyTitle?: string;
  isRequired?: boolean;
}

export const RecordingPermissionDialog: React.FC<RecordingPermissionDialogProps> = ({
  isOpen,
  onPermissionGranted,
  onDecline,
  requiresAudio = true,
  requiresVideo = false,
  surveyTitle = "this survey",
  isRequired = false
}) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPermissions = async () => {
    setIsRequesting(true);
    setError(null);

    try {
      const constraints: MediaStreamConstraints = {};
      
      if (requiresAudio) {
        constraints.audio = true;
      }
      
      if (requiresVideo) {
        constraints.video = true;
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Stop the stream immediately after getting permission
      stream.getTracks().forEach(track => track.stop());
      
      onPermissionGranted({
        audio: requiresAudio,
        video: requiresVideo
      });
    } catch (err) {
      console.error('Permission denied:', err);
      setError('Permission was denied. Please allow access to continue with the survey.');
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Recording Permission {isRequired ? 'Required' : 'Requested'}
          </DialogTitle>
          <DialogDescription>
            {surveyTitle} includes audio/video recording to capture your responses.
            {isRequired && " Recording is required to participate in this survey."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isRequired && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This survey requires recording permissions to participate. 
                If you decline, you will not be able to complete the survey.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {requiresAudio && (
              <div className="flex items-center gap-3 p-3 border rounded-md">
                <Mic className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">Microphone Access</div>
                  <div className="text-sm text-muted-foreground">
                    Required to record your audio responses
                  </div>
                </div>
              </div>
            )}

            {requiresVideo && (
              <div className="flex items-center gap-3 p-3 border rounded-md">
                <Video className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">Camera Access</div>
                  <div className="text-sm text-muted-foreground">
                    Required to record your video responses
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-muted-foreground">
            <p>
              Your recordings will be securely stored and only accessible to the survey creator.
              <a 
                href="/privacy" 
                target="_blank" 
                className="inline-flex items-center gap-1 text-blue-600 hover:underline ml-1"
              >
                Learn more about privacy
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={requestPermissions} 
              disabled={isRequesting}
              className="flex-1"
            >
              {isRequesting ? 'Requesting Access...' : 'Allow & Continue'}
            </Button>
            <Button 
              variant="outline" 
              onClick={onDecline}
              disabled={isRequesting}
            >
              {isRequired ? 'Decline & Exit' : 'Skip Recording'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
