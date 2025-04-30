
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuerySurveyByPublicCode } from '@/hooks/survey/useQuerySurveyByPublicCode';
import QuestionRenderer from '@/components/survey/response/QuestionRenderer';
import { useSurveyResponseLogic } from '@/hooks/survey/useSurveyResponseLogic';
import { useSubmitResponse } from '@/hooks/survey/useSubmitResponse';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { Loader } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface PublicSurveyProps {
  isPreviewMode?: boolean; // New prop to indicate if this is preview mode
}

const PublicSurvey = ({ isPreviewMode = false }: PublicSurveyProps) => {
  const { publicCode } = useParams<{ publicCode: string }>();
  const { survey, isLoading, error } = useQuerySurveyByPublicCode(publicCode || '', isPreviewMode);
  const { answers, updateAnswer, validateAnswers } = useSurveyResponseLogic(survey);
  const { submitResponse, isSubmitting } = useSubmitResponse();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!survey) return;
      
      const validation = validateAnswers(survey.questions || []);
      
      if (!validation.valid) {
        toast("Please complete all required fields", {
          description: "Some required questions haven't been answered",
        });
        return;
      }

      if (isPreviewMode) {
        // In preview mode, don't actually submit the response
        toast("Preview Submission", {
          description: "This is a preview. Your response has not been recorded.",
        });
        return;
      }

      await submitResponse({
        surveyId: survey.id,
        answers,
        metadata: {
          submitTime: new Date().toISOString(),
          userAgent: navigator.userAgent,
        },
      });

      toast("Response submitted", {
        description: "Thank you for completing the survey",
      });
    } catch (error) {
      console.error("Error submitting response:", error);
      toast("Submission failed", {
        description: "There was an error submitting your response",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="container max-w-3xl py-10 px-4">
        <div className="p-6 bg-destructive/10 rounded-lg">
          <h2 className="text-xl font-bold mb-2 text-destructive">Survey Not Available</h2>
          <p className="text-destructive-foreground">
            {error?.message || "This survey does not exist or is not published yet."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-10 px-4">
      {/* Preview Mode Banner */}
      {isPreviewMode && (
        <Alert variant="warning" className="mb-6 border-amber-500 bg-amber-50">
          <AlertTitle className="text-amber-800 font-bold">Survey Preview Mode</AlertTitle>
          <AlertDescription className="text-amber-700">
            This is a preview of your survey. Responses submitted here will not be recorded.
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{survey.name}</h1>
        {survey.description && (
          <p className="text-muted-foreground">{survey.description}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {(survey.questions || []).map((question, index) => (
          <QuestionRenderer
            key={question.id || index}
            question={question}
            onChange={(value) => updateAnswer(question.id || `q-${index}`, value)}
            value={answers[question.id || `q-${index}`]}
          />
        ))}

        <div className="pt-4">
          <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
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
    </div>
  );
};

export default PublicSurvey;
