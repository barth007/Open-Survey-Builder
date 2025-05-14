
import React from 'react';
import { Question } from '@/types/survey';
import { TextQuestionRenderer } from './TextQuestionRenderer';
import { MultipleChoiceRenderer } from './MultipleChoiceRenderer';
import { CheckboxesRenderer } from './CheckboxesRenderer';
import { LikertScaleRenderer } from './LikertScaleRenderer';
import { useIsMobile } from '@/hooks/use-mobile';
import { getGridColumns } from '@/lib/utils';

interface QuestionRendererProps {
  question: Question;
  answers: Record<string, string | string[]>;
  onAnswerChange: (questionId: string, value: string | string[]) => void;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  answers,
  onAnswerChange
}) => {
  const isMobile = useIsMobile();
  
  switch(question.type) {
    case 'text':
      return (
        <TextQuestionRenderer
          question={question}
          value={(answers[question.id] as string) || ''}
          onChange={(value) => onAnswerChange(question.id, value)}
        />
      );
    
    case 'multipleChoice':
      return (
        <MultipleChoiceRenderer
          question={question}
          value={(answers[question.id] as string) || ''}
          onChange={(value) => onAnswerChange(question.id, value)}
          isMobile={isMobile}
        />
      );
    
    case 'checkboxes':
      return (
        <CheckboxesRenderer
          question={question}
          selectedValues={(answers[question.id] as string[]) || []}
          onChange={(values) => onAnswerChange(question.id, values)}
          isMobile={isMobile}
        />
      );
      
    case 'likert5':
    case 'likert7':
    case 'likert10':
      return (
        <LikertScaleRenderer
          question={question}
          value={(answers[question.id] as string) || ''}
          onChange={(value) => onAnswerChange(question.id, value)}
        />
      );
    
    default:
      return null;
  }
};
