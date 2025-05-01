
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuerySurveyByPublicCode } from '@/hooks/survey/useQuerySurveyByPublicCode';
import { QuestionRenderer } from '@/components/survey/response/QuestionRenderer';
import { useSurveyResponseLogic } from '@/hooks/survey/useSurveyResponseLogic';
import { useSubmitResponse } from '@/hooks/survey/useSubmitResponse';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { Loader } from 'lucide-react';
import { Answer } from '@/types/survey';

const PublicSurvey = () => {
  const { publicCode } = useParams<{ publicCode: string }>();
  const { data: survey, isLoading, error } = useQuerySurveyByPublicCode(publicCode || '', false);
  const { answers, handleAnswerChange, isSubmitting } = useSurveyResponseLogic(survey?.id);
  const { submitResponse } = useSubmitResponse();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!survey) return;

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
            {error?.message || "This survey does not exist or is not available yet."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{survey.title}</h1>
        {survey.description && (
          <p className="text-muted-foreground">{survey.description}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {(survey.questions || []).map((question, index) => (
          <QuestionRenderer
            key={question.id || index}
            question={question}
            answers={answers}
            onAnswerChange={handleAnswerChange}
          />
        ))}

        <div className="pt-4">
          <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
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
