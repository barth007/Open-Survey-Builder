
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuerySurveyByPublicCode } from '@/hooks/survey/useQuerySurveyByPublicCode';
import { Button } from "@/components/ui/button";
import { useSurveyResponseLogic } from '@/hooks/survey/useSurveyResponseLogic';
import { Question } from '@/types/survey';
import { QuestionItem } from '@/components/survey/response/QuestionItem';

const PublicSurvey = () => {
  const { publicCode } = useParams<{ publicCode: string }>();
  const { data: surveyData, isLoading, error } = useQuerySurveyByPublicCode(publicCode);
  const { 
    answers, 
    isSubmitting, 
    handleAnswerChange, 
    handleSubmit, 
    isQuestionVisible 
  } = useSurveyResponseLogic(surveyData?.id);

  // Helper function to ensure we're working with an array of questions
  const getQuestions = (): Question[] => {
    if (!surveyData || !surveyData.questions) return [];
    return Array.isArray(surveyData.questions) ? surveyData.questions : [];
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
  const questions = getQuestions();

  if (!isPublished) {
    return (
      <div className="min-h-screen bg-pebble flex items-center justify-center">
        <div className="text-center p-8 max-w-md text-magma">
          <h2 className="text-2xl font-semibold mb-4">Survey Not Available</h2>
          <p>This survey is not currently published and cannot be accessed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pebble py-8">
      <div className="container max-w-3xl">
        <div className="bg-white rounded-lg shadow-sm border border-ice p-6">
          <h2 className="text-2xl font-bold mb-2 text-carbon">{surveyData.title}</h2>
          <p className="text-gray-600 mb-6">{surveyData.description}</p>

          {questions.map((question, index) => (
            isQuestionVisible(question) && (
              <QuestionItem 
                key={question.id}
                question={question}
                index={index}
                answers={answers}
                onAnswerChange={handleAnswerChange}
              />
            )
          ))}

          {questions.length > 0 && (
            <Button 
              className="mt-4 bg-sunset hover:opacity-90"
              onClick={() => handleSubmit(isPublished)}
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
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">
          <p>This survey collects anonymous response data including browser information and device type.</p>
        </div>
      </div>
    </div>
  );
};

export default PublicSurvey;
