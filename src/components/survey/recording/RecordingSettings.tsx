
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Question } from '@/types/survey';
import { Mic, Video } from 'lucide-react';

interface RecordingSettingsProps {
  question: Question;
  onQuestionChange: (updatedQuestion: Question) => void;
}

export const RecordingSettings: React.FC<RecordingSettingsProps> = ({
  question,
  onQuestionChange
}) => {
  const updateRecordingSetting = (field: 'recordingEnabled' | 'recordingRequired', value: boolean) => {
    onQuestionChange({
      ...question,
      [field]: value,
      // If disabling recording, also disable required
      ...(field === 'recordingEnabled' && !value ? { recordingRequired: false } : {})
    });
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Mic className="h-4 w-4" />
          Recording Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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

        {question.recordingEnabled && (
          <div className="flex items-center justify-between">
            <Label htmlFor="recording-required" className="text-sm">
              Require recording to proceed
            </Label>
            <Switch
              id="recording-required"
              checked={question.recordingRequired || false}
              onCheckedChange={(checked) => updateRecordingSetting('recordingRequired', checked)}
            />
          </div>
        )}

        {question.recordingEnabled && (
          <div className="pt-2">
            <Label className="text-sm text-muted-foreground">
              Recording Type: Audio only (Video recording can be enabled survey-wide)
            </Label>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
