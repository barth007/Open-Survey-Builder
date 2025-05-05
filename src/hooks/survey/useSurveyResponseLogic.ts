
import { useState } from 'react';
import { Question, Answer } from '@/types/survey';
import { useSubmitResponse } from './useSubmitResponse';
import { useToast } from "@/hooks/use-toast";
import { getParticipantId, collectMetadata } from '@/utils/participantUtils';

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

  const handleSubmit = async (isPublished: boolean) => {
    if (!surveyId) return;

    setIsSubmitting(true);
    
    // Transform answers into the format expected by the API
    const formattedAnswers = Object.entries(answers).map(([questionId, value]) => ({
      questionId,
      value
    }));
    
    try {
      // Collect participant ID and metadata
      const participantId = getParticipantId();
      const metadata = await collectMetadata();
      
      await submitResponse(surveyId, formattedAnswers, isPublished, participantId, metadata);
      
      // Show different messages based on whether responses are being saved
      if (isPublished) {
        toast({
          title: "Success",
          description: "Your response has been submitted. Thank you!",
        });
      } else {
        toast({
          title: "Response viewed",
          description: "This survey is currently in preview mode. Your responses were not saved.",
        });
      }
      
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
