
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { QuestionItem } from '@/components/survey/response/QuestionItem';
import { useQuerySurvey } from '@/hooks/survey/useQuerySurvey';
import { useSurveyResponseLogic } from '@/hooks/survey/useSurveyResponseLogic';
import { debugLog } from '@/lib/logger';
import { RecordingWidget } from '@/components/survey/recording/RecordingWidget';
import { RecordingPermissionDialog } from '@/components/survey/recording/RecordingPermissionDialog';
import { ThankYouPage } from '@/components/survey/ThankYouPage';
import { useRecordingUpload } from '@/hooks/survey/useRecordingUpload';
import { useRecordingPermissions } from '@/components/survey/recording/useRecordingPermissions';

type SurveyState = 'permissions' | 'survey' | 'thankYou';

const SurveyResponse = () => {
  const { id: surveyId } = useParams();
  const { survey: surveyData, isLoading, error } = useQuerySurvey(surveyId);
  const { uploadRecording, isUploading, uploadError } = useRecordingUpload();
  const { permissions, requestPermissions, hasPermissions } = useRecordingPermissions();
  
  const [surveyState, setSurveyState] = useState<SurveyState>('survey');
  const [recordingDeclined, setRecordingDeclined] = useState(false);
  
  const { 
    answers, 
    isSubmitting, 
    handleAnswerChange, 
    handleSubmit, 
    isQuestionVisible,
    responseId
  } = useSurveyResponseLogic(surveyId);

  // Check if recording is enabled and required
  const recordingEnabled = surveyData?.recordingEnabled || false;
  const recordingRequired = surveyData?.recordingRequired || false;

  // Initialize survey state based on recording settings
  useEffect(() => {
    if (!surveyData) return;

    if (recordingEnabled && !permissions) {
      setSurveyState('permissions');
    } else {
      setSurveyState('survey');
    }
  }, [surveyData, recordingEnabled, permissions]);

  const handlePermissionGranted = async (grantedPermissions: { audio: boolean; video: boolean }) => {
    debugLog('Recording permissions granted:', grantedPermissions);
    setSurveyState('survey');
  };

  const handlePermissionDeclined = () => {
    debugLog('Recording permissions declined');
    setRecordingDeclined(true);
    
    if (recordingRequired) {
      // If recording is required and user declines, skip to thank you page
      setSurveyState('thankYou');
    } else {
      // If recording is optional, continue to survey
      setSurveyState('survey');
    }
  };

  const handleRecordingComplete = async (blob: Blob, duration: number) => {
    if (!responseId) {
      console.error('No response ID available for recording upload');
      return;
    }

    debugLog('Survey recording completed, uploading...', { duration, size: blob.size });
    const recordingUrl = await uploadRecording(blob, responseId);
    
    if (recordingUrl) {
      debugLog('Survey recording uploaded successfully:', recordingUrl);
    }
  };

  const handleQuestionRecordingComplete = (questionId: string, recordingUrl: string) => {
    debugLog('Question recording completed:', { questionId, recordingUrl });
  };

  const onSurveySubmit = async () => {
    await handleSubmit(true);
    setSurveyState('thankYou');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-pebble flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-abyss"></div>
      </div>
    );
  }

  if (error || !surveyData) {
    return (
      <div className="min-h-screen bg-pebble flex items-center justify-center">
        <div className="text-center p-8 max-w-md text-magma">
          <h2 className="text-2xl font-semibold mb-4">Survey Not Found</h2>
          <p>The survey you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const isPublished = surveyData.isPublished === true;
  const questions = surveyData?.questions || [];

  // Show thank you page
  if (surveyState === 'thankYou') {
    const thankYouProps = {
      thankYouTitle: recordingDeclined && recordingRequired 
        ? "Recording Required" 
        : (surveyData.thankYouTitle || "Thank You"),
      thankYouMessage: recordingDeclined && recordingRequired 
        ? "This survey requires recording permissions to participate. Thank you for your understanding."
        : (surveyData.thankYouMessage || "Thank you for your participation."),
      thankYouButtonText: surveyData.thankYouButtonText || "Continue",
      redirectUrl: surveyData.redirectUrl || ""
    };

    return (
      <div className="min-h-screen bg-pebble py-8">
        <div className="container max-w-3xl">
          <div className="bg-white rounded-lg shadow-sm border border-ice p-6">
            <ThankYouPage {...thankYouProps} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pebble py-8">
      <div className="container max-w-3xl">
        <div className="bg-white rounded-lg shadow-sm border border-ice p-6">
          <h2 className="text-2xl font-bold mb-2 text-carbon">{surveyData?.title}</h2>
          <p className="text-gray-600 mb-6">{surveyData?.description}</p>

          {!isPublished && (
            <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
              <p className="text-sm font-medium">This survey is in preview mode</p>
              <p className="text-xs">Responses will not be saved until the survey is published</p>
            </div>
          )}

          {/* Recording Permission Dialog */}
          <RecordingPermissionDialog
            isOpen={surveyState === 'permissions'}
            onPermissionGranted={handlePermissionGranted}
            onDecline={handlePermissionDeclined}
            requiresAudio={recordingEnabled}
            requiresVideo={recordingEnabled}
            surveyTitle={surveyData?.title}
          />

          {/* Recording Status and Widget */}
          {surveyState === 'survey' && recordingEnabled && permissions && responseId && (
            <div className="mb-6">
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-800">
                <p className="text-sm font-medium">
                  Recording is active for this survey
                </p>
                <p className="text-xs">
                  Your responses are being recorded as configured
                </p>
              </div>

              <RecordingWidget
                responseId={responseId}
                onRecordingComplete={handleRecordingComplete}
                className="w-full"
              />
              
              {isUploading && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md text-blue-800 text-sm">
                  Uploading recording...
                </div>
              )}

              {uploadError && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                  Failed to upload recording: {uploadError}
                </div>
              )}
            </div>
          )}

          {/* Recording declined but optional - show info */}
          {surveyState === 'survey' && recordingEnabled && recordingDeclined && !recordingRequired && (
            <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
              <p className="text-sm font-medium">
                Recording was declined
              </p>
              <p className="text-xs">
                You can continue with the survey without recording
              </p>
            </div>
          )}

          {/* Survey Questions */}
          {surveyState === 'survey' && (
            <>
              {questions.map((question, index) => (
                isQuestionVisible(question) && (
                  <QuestionItem 
                    key={question.id}
                    question={question}
                    index={index}
                    answers={answers}
                    onAnswerChange={handleAnswerChange}
                    responseId={responseId}
                    onRecordingComplete={handleQuestionRecordingComplete}
                  />
                )
              ))}

              {questions.length > 0 && (
                <Button 
                  className="mt-4 bg-sunset hover:opacity-90"
                  onClick={onSurveySubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              )}

              {questions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>This survey has no questions.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveyResponse;
