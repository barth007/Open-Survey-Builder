
import React from 'react';
import { Question } from '@/types/survey';
import { QuestionRenderer } from './QuestionRenderer';
import { QuestionMedia } from './QuestionMedia';

interface QuestionItemProps {
  question: Question;
  index: number;
  answers: Record<string, string | string[]>;
  onAnswerChange: (questionId: string, value: string | string[]) => void;
}

export const QuestionItem: React.FC<QuestionItemProps> = ({
  question,
  index,
  answers,
  onAnswerChange
}) => {
  return (
    <div className="mb-6 pb-6 border-b border-ice last:border-b-0">
      <h3 className="font-medium mb-2 text-carbon break-words">
        {index + 1}. {question.text} 
        {question.isRequired && <span className="text-magma ml-1">*</span>}
      </h3>
      
      {question.description && (
        <p className="text-sm text-gray-600 mb-3 break-words">{question.description}</p>
      )}

      {question.maxSelections && (
        <p className="text-xs text-gray-500 mb-3">
          (Max selections: {question.maxSelections})
        </p>
      )}

      <QuestionMedia media={question.media} />

      {question.figmaPrototypeUrl && (
        <p className="text-sm text-blue-600 mt-2 mb-4 break-words">
          <a href={question.figmaPrototypeUrl} target="_blank" rel="noopener noreferrer" 
             className="inline-block max-w-full overflow-hidden text-ellipsis">
            View Figma Prototype
          </a>
        </p>
      )}

      <QuestionRenderer 
        question={question} 
        answers={answers} 
        onAnswerChange={onAnswerChange} 
      />
    </div>
  );
};
