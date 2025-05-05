
import { useState } from 'react';
import { Question, Answer } from '@/types/survey';
import { useSubmitResponse } from './useSubmitResponse';
import { useToast } from "@/hooks/use-toast";

export function useSurveyResponseLogic(surveyId: string | undefined) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { submitResponse } = useSubmitResponse();
  const { toast } = useToast();

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const isQuestionVisible = (question: Question): boolean => {
    if (!question.conditionalLogic || !question.conditionalLogic.dependsOn) return true;
    
    const { dependsOn, operator, value } = question.conditionalLogic;
    const answer = answers[dependsOn];
    
    switch (operator) {
      case 'equals':
        if (Array.isArray(answer)) {
          return answer.includes(value as string);
        }
        return answer === value;
      case 'notEquals':
        if (Array.isArray(answer)) {
          return !answer.includes(value as string);
        }
        return answer !== value;
      case 'isAnswered':
        if (Array.isArray(answer)) {
          return answer.length > 0;
        }
        return answer !== undefined && answer !== '';
      case 'isNotAnswered':
        if (Array.isArray(answer)) {
          return answer.length === 0;
        }
        return answer === undefined || answer === '';
      default:
        return true;
    }
  };

  // Updated handleSubmit to match the signature of submitResponse
  const handleSubmit = async (isPreviewMode: boolean) => {
    if (!surveyId) return;

    setIsSubmitting(true);
    
    // Transform answers from Record to Answer[] format
    const formattedAnswers: Answer[] = Object.entries(answers).map(([questionId, value]) => ({
      questionId,
      value
    }));
    
    try {
      // Updated to match the new submitResponse signature
      await submitResponse({
        surveyId,
        answers: formattedAnswers,
        metadata: {
          submitTime: new Date().toISOString(),
          userAgent: navigator.userAgent,
        }
      });
      
      // Show different messages based on preview mode
      toast({
        title: isPreviewMode ? "Preview Submission" : "Success",
        description: isPreviewMode 
          ? "This is a preview. Your response has not been recorded." 
          : "Your response has been submitted. Thank you!",
      });
      
      // Clear form
      setAnswers({});
      
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem submitting your response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    answers,
    isSubmitting,
    handleAnswerChange,
    handleSubmit,
    isQuestionVisible
  };
}
