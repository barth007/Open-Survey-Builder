
import { debugLog, debugWarn } from '@/lib/logger';

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuerySurveyByPublicCode } from '@/hooks/survey/useQuerySurveyByPublicCode';
import { QuestionItem } from '@/components/survey/response/QuestionItem';
import { useSurveyResponseLogic } from '@/hooks/survey/useSurveyResponseLogic';
import { useSubmitResponse } from '@/hooks/survey/useSubmitResponse';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { Loader } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Answer } from '@/types/survey';
import { PublicSurveyLayout } from '@/components/survey/PublicSurveyLayout';
import { WelcomePage } from '@/components/survey/WelcomePage';
import { ThankYouPage } from '@/components/survey/ThankYouPage';
import { RecordingPermissionDialog } from '@/components/survey/recording/RecordingPermissionDialog';
import { RecordingWidget } from '@/components/survey/recording/RecordingWidget';
import { useRecordingPermissions } from '@/components/survey/recording/useRecordingPermissions';
import { useRecordingUpload } from '@/hooks/survey/useRecordingUpload';

interface PublicSurveyProps {
  isPreviewMode?: boolean;
}

// Define enum for survey flow states
type SurveyFlowState = 'welcome' | 'permissions' | 'questions' | 'thankYou';

const PublicSurvey = ({ isPreviewMode = false }: PublicSurveyProps) => {
  const { publicCode } = useParams<{ publicCode: string }>();
  const { data: survey, isLoading, error } = useQuerySurveyByPublicCode(publicCode || '', isPreviewMode);
  const { 
    answers, 
    handleAnswerChange, 
    isSubmitting,
    isQuestionVisible,
    responseId
  } = useSurveyResponseLogic(survey?.id);
  const { submitResponse } = useSubmitResponse();
  const { permissions, requestPermissions, hasPermissions } = useRecordingPermissions();
  const { uploadRecording, isUploading, uploadError } = useRecordingUpload();
  
  // Track the current state of the survey flow
  const [flowState, setFlowState] = useState<SurveyFlowState>('welcome');
  const [recordingDeclined, setRecordingDeclined] = useState(false);

  debugLog('PublicSurvey survey data:', survey);

  // Check if recording is enabled and required
  const recordingEnabled = survey?.recordingEnabled || false;
  const recordingRequired = survey?.recordingRequired || false;

  const handleStartSurvey = () => {
    if (recordingEnabled && !permissions) {
      setFlowState('permissions');
    } else {
      setFlowState('questions');
    }
  };

  const handlePermissionGranted = (grantedPermissions: { audio: boolean; video: boolean }) => {
    debugLog('Recording permissions granted:', grantedPermissions);
    setFlowState('questions');
  };

  const handlePermissionDeclined = () => {
    debugLog('Recording permissions declined');
    setRecordingDeclined(true);
    
    if (recordingRequired) {
      // If recording is required and user declines, skip to thank you page
      setFlowState('thankYou');
    } else {
      // If recording is optional, continue to survey
      setFlowState('questions');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!survey) return;
      
      // In preview mode, don't actually submit the response
      if (isPreviewMode) {
        setFlowState('thankYou');
        toast("Preview Submission", {
          description: "This is a preview. Your response has not been recorded.",
        });
        return;
      }

      // Transform answers from Record to Answer[] format
      const formattedAnswers: Answer[] = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value
      }));

      await submitResponse({
        surveyId: survey.id,
        answers: formattedAnswers,
        metadata: {
          submitTime: new Date().toISOString(),
          userAgent: navigator.userAgent,
        },
      });

      // Change flow state to thank you page
      setFlowState('thankYou');

      toast("Response submitted", {
        description: "Thank you for completing the survey",
      });
    } catch (error) {
      console.error("Error submitting response:", error);
      toast("Submission failed", {
        description: "There was an error submitting your response",
      });
    }
  };

  // Check if welcome page should be shown - show if ANY welcome field has content
  const hasWelcomeContent = survey && (
    survey.welcomeTitle?.trim() || 
    survey.welcomeMessage?.trim() || 
    survey.welcomeInstructions?.trim() || 
    survey.welcomeButtonText?.trim()
  );

  // Check if thank you page should be shown - show if ANY thank you field has content
  const hasThankYouContent = survey && (
    survey.thankYouTitle?.trim() || 
    survey.thankYouMessage?.trim() || 
    survey.thankYouButtonText?.trim() || 
    survey.redirectUrl?.trim()
  );

  // If there's no welcome content, skip directly to permissions or questions
  React.useEffect(() => {
    if (survey && !hasWelcomeContent && flowState === 'welcome') {
      if (recordingEnabled && !permissions) {
        setFlowState('permissions');
      } else {
        setFlowState('questions');
      }
    }
  }, [survey, hasWelcomeContent, flowState, recordingEnabled, permissions]);

  if (isLoading) {
    return (
      <PublicSurveyLayout surveyTitle="Loading..." isPreviewMode={isPreviewMode}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PublicSurveyLayout>
    );
  }

  if (error || !survey) {
    return (
      <PublicSurveyLayout surveyTitle="Survey Not Available" isPreviewMode={isPreviewMode}>
        <div className="container max-w-3xl py-10 px-4">
          <div className="p-6 bg-destructive/10 rounded-lg">
            <h2 className="text-xl font-bold mb-2 text-destructive">Survey Not Available</h2>
            <p className="text-destructive-foreground">
              {error?.message || "This survey does not exist or is not published yet."}
            </p>
          </div>
        </div>
      </PublicSurveyLayout>
    );
  }

  // Thank you page logic with recording context
  const getThankYouProps = () => {
    if (recordingDeclined && recordingRequired) {
      return {
        thankYouTitle: "Recording Required",
        thankYouMessage: "This survey requires recording permissions to participate. Thank you for your understanding.",
        thankYouButtonText: survey.thankYouButtonText || "Continue",
        redirectUrl: survey.redirectUrl || ""
      };
    }

    return {
      thankYouTitle: survey.thankYouTitle || "Thank You",
      thankYouMessage: survey.thankYouMessage || "Thank you for your participation.",
      thankYouButtonText: survey.thankYouButtonText || "Continue",
      redirectUrl: survey.redirectUrl || ""
    };
  };

  return (
    <PublicSurveyLayout 
      surveyTitle={survey?.title || "Loading..."} 
      isPreviewMode={isPreviewMode}
    >
      <div className="container max-w-3xl py-10 px-4">
      
        {/* Welcome page - only show if there's welcome content */}
        {flowState === 'welcome' && hasWelcomeContent && (
          <WelcomePage
            welcomeTitle={survey.welcomeTitle || ''}
            welcomeMessage={survey.welcomeMessage || ''}
            welcomeInstructions={survey.welcomeInstructions || ''}
            welcomeButtonText={survey.welcomeButtonText || ''}
            onStart={handleStartSurvey}
          />
        )}

        {/* Recording Permission Dialog */}
        <RecordingPermissionDialog
          isOpen={flowState === 'permissions'}
          onPermissionGranted={handlePermissionGranted}
          onDecline={handlePermissionDeclined}
          requiresAudio={recordingEnabled}
          requiresVideo={recordingEnabled}
          surveyTitle={survey?.title}
        />

        {/* Questions */}
        {flowState === 'questions' && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">{survey.title}</h1>
              {survey.description && (
                <p className="text-muted-foreground">{survey.description}</p>
              )}
            </div>

            {/* Recording Status */}
            {recordingEnabled && permissions && responseId && (
              <div className="mb-6">
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-800">
                  <p className="text-sm font-medium">Recording is active for this survey</p>
                  <p className="text-xs">Your responses are being recorded as configured</p>
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

            {/* Recording declined but optional */}
            {recordingEnabled && recordingDeclined && !recordingRequired && (
              <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
                <p className="text-sm font-medium">Recording was declined</p>
                <p className="text-xs">You can continue with the survey without recording</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {survey.questions.filter(question => isQuestionVisible(question)).map((question, index) => (
                <QuestionItem
                  key={question.id}
                  question={question}
                  index={index}
                  answers={answers}
                  onAnswerChange={handleAnswerChange}
                  responseId={responseId}
                />
              ))}

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full md:w-auto" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : isPreviewMode ? (
                    "Preview Submit"
                  ) : (
                    "Submit Response"
                  )}
                </Button>
              </div>
            </form>
          </>
        )}

        {/* Thank You page - only show if there's thank you content or recording was declined */}
        {flowState === 'thankYou' && (hasThankYouContent || (recordingDeclined && recordingRequired)) && (
          <ThankYouPage {...getThankYouProps()} />
        )}
      </div>
    </PublicSurveyLayout>
  );
};

export default PublicSurvey;
