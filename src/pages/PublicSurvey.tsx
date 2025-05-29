
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

interface PublicSurveyProps {
  isPreviewMode?: boolean;
}

// Define enum for survey flow states
type SurveyFlowState = 'welcome' | 'questions' | 'thankYou';

const PublicSurvey = ({ isPreviewMode = false }: PublicSurveyProps) => {
  const { publicCode } = useParams<{ publicCode: string }>();
  const { data: survey, isLoading, error } = useQuerySurveyByPublicCode(publicCode || '', isPreviewMode);
  const { 
    answers, 
    handleAnswerChange, 
    isSubmitting,
    isQuestionVisible
  } = useSurveyResponseLogic(survey?.id);
  const { submitResponse } = useSubmitResponse();
  
  // Track the current state of the survey flow
  const [flowState, setFlowState] = useState<SurveyFlowState>('welcome');

  console.log('PublicSurvey survey data:', survey);

  const handleStartSurvey = () => {
    setFlowState('questions');
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

  // If there's no welcome content, skip directly to questions
  React.useEffect(() => {
    if (survey && !hasWelcomeContent && flowState === 'welcome') {
      setFlowState('questions');
    }
  }, [survey, hasWelcomeContent, flowState]);

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

  return (
    <PublicSurveyLayout 
      surveyTitle={survey?.title || "Loading..."} 
      isPreviewMode={isPreviewMode}
    >
      <div className="container max-w-3xl py-10 px-4">
        {/* Preview Mode Banner */}
        {isPreviewMode && (
          <Alert className="mb-6 border-amber-500 bg-amber-50">
            <AlertTitle className="text-amber-800 font-bold">Survey Preview Mode</AlertTitle>
            <AlertDescription className="text-amber-700">
              This is a preview of your survey. Responses submitted here will not be recorded.
            </AlertDescription>
          </Alert>
        )}

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

        {/* Questions */}
        {flowState === 'questions' && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">{survey.title}</h1>
              {survey.description && (
                <p className="text-muted-foreground">{survey.description}</p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {survey.questions.filter(question => isQuestionVisible(question)).map((question, index) => (
                <QuestionItem
                  key={question.id}
                  question={question}
                  index={index}
                  answers={answers}
                  onAnswerChange={handleAnswerChange}
                />
              ))}

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full md:w-auto" 
                  disabled={isSubmitting}
                  onClick={() => {
                    // If no thank you content, just show success message instead of changing flow state
                    if (!hasThankYouContent && !isPreviewMode) {
                      // The form submission will handle this case
                    }
                  }}
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

        {/* Thank You page - only show if there's thank you content */}
        {flowState === 'thankYou' && hasThankYouContent && (
          <ThankYouPage
            thankYouTitle={survey.thankYouTitle || ''}
            thankYouMessage={survey.thankYouMessage || ''}
            thankYouButtonText={survey.thankYouButtonText || ''}
            redirectUrl={survey.redirectUrl || ''}
          />
        )}
      </div>
    </PublicSurveyLayout>
  );
};

export default PublicSurvey;
