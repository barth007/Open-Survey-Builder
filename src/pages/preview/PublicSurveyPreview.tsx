import { useParams } from 'react-router-dom';
import { useQuerySurveyByPublicCode } from '@/hooks/survey/useQuerySurveyByPublicCode';
import { Button } from '@/components/ui/button';
import { useSurveyResponseLogic } from '@/hooks/survey/useSurveyResponseLogic';
import { Question } from '@/types/survey';
import { QuestionItem } from '@/components/survey/response/QuestionItem';

const PublicSurveyPreview = () => {
  const { publicCode } = useParams();
  const { data: surveyData, isLoading, error } = useQuerySurveyByPublicCode(publicCode, true);

  const {
    answers,
    isSubmitting,
    handleAnswerChange,
    handleSubmit,
    isQuestionVisible,
  } = useSurveyResponseLogic(surveyData?.id);

  const getQuestions = (): Question[] => {
    if (!surveyData?.questions) return [];
    const questions = Array.isArray(surveyData.questions) ? surveyData.questions : [];
    return questions.map((q: any) => ({
      id: q.id || '',
      type: q.type || 'text',
      text: q.text || '',
      description: q.description,
      isRequired: q.isRequired || false,
      options: Array.isArray(q.options) ? q.options : [],
      maxSelections: q.maxSelections,
      figmaPrototypeUrl: q.figmaPrototypeUrl,
      media: q.media,
      conditionalLogic: q.conditionalLogic,
      isVisible: q.isVisible !== undefined ? q.isVisible : true,
    }));
  };

  const getSurveyTitle = (): string => {
    return surveyData?.title || 'Untitled Survey';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-pebble flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-abyss" />
      </div>
    );
  }

  if (error || !surveyData) {
    return (
      <div className="min-h-screen bg-pebble flex items-center justify-center">
        <div className="text-center p-8 max-w-md text-magma">
          <h2 className="text-2xl font-semibold mb-4">Survey Not Available</h2>
          <p>This survey is not currently published, and you may not have access.</p>
        </div>
      </div>
    );
  }

  const questions = getQuestions();

  return (
    <div className="min-h-screen bg-pebble py-8">
      <div className="container max-w-3xl">
        <div className="bg-white rounded-lg shadow-sm border border-ice p-6">
          <h2 className="text-2xl font-bold mb-2 text-carbon">{getSurveyTitle()}</h2>
          <p className="text-gray-600 mb-6">{surveyData.description}</p>

          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
            <p className="text-sm font-medium">This is a preview</p>
            <p className="text-xs">Responses will not be saved</p>
          </div>

          {questions.map((question, index) =>
            isQuestionVisible(question) ? (
              <QuestionItem
                key={question.id}
                question={question}
                index={index}
                answers={answers}
                onAnswerChange={handleAnswerChange}
              />
            ) : null
          )}

          {questions.length > 0 && (
            <Button
              className="mt-4 bg-sunset hover:opacity-90"
              onClick={() => handleSubmit(false)}  // disables saving
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Preview Submit'}
            </Button>
          )}

          {questions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>This survey has no questions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicSurveyPreview;
