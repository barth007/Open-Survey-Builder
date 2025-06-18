
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Survey } from '@/types/survey';
import { Video, Webcam, Monitor, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { debugLog } from '@/lib/logger';

interface SurveyRecordingSettingsProps {
  survey: Survey;
  onSurveyChange: (field: keyof Survey, value: any) => void;
}

export const SurveyRecordingSettings: React.FC<SurveyRecordingSettingsProps> = ({
  survey,
  onSurveyChange
}) => {
  // Debug logging
  React.useEffect(() => {
    debugLog("SurveyRecordingSettings mounted with survey:", {
      id: survey.id,
      title: survey.title,
      recordingEnabled: survey.recordingEnabled,
      recordingRequired: survey.recordingRequired
    });
  }, [survey.id, survey.title, survey.recordingEnabled, survey.recordingRequired]);

  const updateRecordingSetting = (field: 'recordingEnabled' | 'recordingRequired', value: boolean) => {
    debugLog(`Updating ${field} to:`, value);
    onSurveyChange(field, value);
    
    // If disabling recording, also disable required
    if (field === 'recordingEnabled' && !value) {
      onSurveyChange('recordingRequired', false);
    }
  };

  debugLog("Rendering SurveyRecordingSettings component");

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Video className="h-5 w-5" />
          Recording Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Recording captures both the participant's webcam and screen during the survey session.
          </AlertDescription>
        </Alert>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="survey-recording-enabled" className="text-sm font-medium">
              Enable recording for this survey
            </Label>
            <p className="text-xs text-muted-foreground">
              Participants will be asked to share their camera and screen
            </p>
          </div>
          <Switch
            id="survey-recording-enabled"
            checked={survey.recordingEnabled || false}
            onCheckedChange={(checked) => updateRecordingSetting('recordingEnabled', checked)}
          />
        </div>

        {survey.recordingEnabled && (
          <>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="survey-recording-required" className="text-sm font-medium">
                  Require recording to participate
                </Label>
                <p className="text-xs text-muted-foreground">
                  Participants must grant permissions to continue
                </p>
              </div>
              <Switch
                id="survey-recording-required"
                checked={survey.recordingRequired || false}
                onCheckedChange={(checked) => updateRecordingSetting('recordingRequired', checked)}
              />
            </div>

            <div className="pt-2 space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Recording includes:
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
                  <Webcam className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Webcam video</span>
                </div>
                <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
                  <Monitor className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Screen capture</span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
