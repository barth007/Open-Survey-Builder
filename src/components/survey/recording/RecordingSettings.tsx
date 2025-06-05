
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Question } from '@/types/survey';
import { Mic, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RecordingSettingsProps {
  question: Question;
  onQuestionChange: (updatedQuestion: Question) => void;
  surveyRecordingEnabled?: boolean;
  surveyRecordingRequired?: boolean;
}

export const RecordingSettings: React.FC<RecordingSettingsProps> = ({
  question,
  onQuestionChange,
  surveyRecordingEnabled = false,
  surveyRecordingRequired = false
}) => {
  const updateRecordingSetting = (field: 'recordingEnabled' | 'recordingRequired', value: boolean) => {
    onQuestionChange({
      ...question,
      [field]: value,
      // If disabling recording, also disable required
      ...(field === 'recordingEnabled' && !value ? { recordingRequired: false } : {})
    });
  };

  const effectiveRecordingEnabled = question.recordingEnabled || surveyRecordingEnabled;
  const effectiveRecordingRequired = question.recordingRequired || surveyRecordingRequired;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Mic className="h-4 w-4" />
          Recording Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {surveyRecordingEnabled && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Recording is enabled at the survey level. Individual question settings will override survey defaults.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <Label htmlFor="recording-enabled" className="text-sm">
            Enable recording for this question
          </Label>
          <Switch
            id="recording-enabled"
            checked={question.recordingEnabled || false}
            onCheckedChange={(checked) => updateRecordingSetting('recordingEnabled', checked)}
          />
        </div>

        {effectiveRecordingEnabled && (
          <div className="flex items-center justify-between">
            <Label htmlFor="recording-required" className="text-sm">
              Require recording to proceed
            </Label>
            <Switch
              id="recording-required"
              checked={question.recordingRequired || false}
              onCheckedChange={(checked) => updateRecordingSetting('recordingRequired', checked)}
              disabled={surveyRecordingRequired}
            />
          </div>
        )}

        {effectiveRecordingEnabled && (
          <div className="pt-2">
            <Label className="text-sm text-muted-foreground">
              Recording Type: Audio only
              {surveyRecordingEnabled && " (Survey-wide setting active)"}
            </Label>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
