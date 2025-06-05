
import React, { useState } from 'react';
import { Question } from '@/types/survey';
import { QuestionRenderer } from './QuestionRenderer';
import { QuestionMedia } from './QuestionMedia';
import { RecordingWidget } from '../recording/RecordingWidget';
import { useRecordingUpload } from '@/hooks/survey/useRecordingUpload';
import { useIsMobile } from '@/hooks/use-mobile';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mic } from 'lucide-react';

interface QuestionItemProps {
  question: Question;
  index: number;
  answers: Record<string, string | string[]>;
  onAnswerChange: (questionId: string, value: string | string[]) => void;
  responseId?: string;
  onRecordingComplete?: (questionId: string, recordingUrl: string) => void;
  surveyRecordingEnabled?: boolean;
  surveyRecordingRequired?: boolean;
}

export const QuestionItem: React.FC<QuestionItemProps> = ({
  question,
  index,
  answers,
  onAnswerChange,
  responseId,
  onRecordingComplete,
  surveyRecordingEnabled = false,
  surveyRecordingRequired = false
}) => {
  const isMobile = useIsMobile();
  const { uploadRecording, isUploading, uploadError } = useRecordingUpload();
  const [hasRecording, setHasRecording] = useState(false);
  
  const handleRecordingComplete = async (blob: Blob, duration: number) => {
    if (!responseId) {
      console.error('No response ID available for recording upload');
      return;
    }

    const recordingUrl = await uploadRecording(blob, question.id, responseId, 'audio');
    
    if (recordingUrl) {
      setHasRecording(true);
      onRecordingComplete?.(question.id, recordingUrl);
    }
  };

  // Check if recording is enabled at question or survey level
  const recordingEnabled = question.recordingEnabled || surveyRecordingEnabled;
  // Check if recording is required at question or survey level
  const recordingRequired = question.recordingRequired || surveyRecordingRequired;
  
  const showRecording = recordingEnabled && responseId;
  const blockProgress = recordingRequired && !hasRecording;
  
  return (
    <div className={`mb-6 pb-6 border-b border-ice last:border-b-0 ${isMobile ? 'px-2' : ''}`}>
      <h3 className={`font-medium mb-2 text-carbon break-words ${isMobile ? 'text-base' : ''}`}>
        {index + 1}. {question.text} 
        {question.isRequired && <span className="text-magma ml-1">*</span>}
        {recordingRequired && (
          <span className="inline-flex items-center gap-1 ml-2 text-sm text-blue-600">
            <Mic className="h-3 w-3" />
            Recording Required
          </span>
        )}
      </h3>
      
      {question.description && (
        <p className="text-sm text-gray-600 mb-3 break-words">{question.description}</p>
      )}

      {question.maxSelections && (
        <p className="text-xs text-gray-500 mb-3">
          (Max selections: {question.maxSelections})
        </p>
      )}

      <QuestionMedia media={question.media} />

      {question.figmaPrototypeUrl && (
        <p className="text-sm text-blue-600 mt-2 mb-4 break-words">
          <a href={question.figmaPrototypeUrl} target="_blank" rel="noopener noreferrer" 
             className="inline-block max-w-full overflow-hidden text-ellipsis">
            View Figma Prototype
          </a>
        </p>
      )}

      <QuestionRenderer 
        question={question} 
        answers={answers} 
        onAnswerChange={onAnswerChange} 
      />

      {showRecording && (
        <div className="mt-4">
          <RecordingWidget
            questionId={question.id}
            recordingType="audio"
            onRecordingComplete={handleRecordingComplete}
            className="w-full"
          />
          
          {isUploading && (
            <Alert className="mt-2">
              <AlertDescription>
                Uploading recording...
              </AlertDescription>
            </Alert>
          )}

          {uploadError && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>
                Failed to upload recording: {uploadError}
              </AlertDescription>
            </Alert>
          )}

          {blockProgress && (
            <Alert className="mt-2">
              <AlertDescription>
                A recording is required for this question before you can proceed.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};
