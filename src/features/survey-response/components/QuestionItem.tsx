
import React from 'react';
import { AnswerValue, Question } from '@/types/survey';
import { QuestionRenderer } from './QuestionRenderer';
import { QuestionMedia } from './QuestionMedia';
import { isContentBlock } from '@/features/survey-editor/lib/editor-blocks';

interface QuestionItemProps {
  question: Question;
  index: number;
  answers: Record<string, AnswerValue>;
  onAnswerChange: (questionId: string, value: AnswerValue) => void;
  responseId?: string;
  onRecordingComplete?: (questionId: string, recordingUrl: string) => void;
}

export const QuestionItem: React.FC<QuestionItemProps> = ({
  question,
  index,
  answers,
  onAnswerChange,
  responseId,
  onRecordingComplete
}) => {
  const isContent = isContentBlock(question);
  
  return (
    <div className="py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {!isContent && (
        <div className="space-y-4 mb-8">
          <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-tight">
            {question.text}
            {question.isRequired && (
              <span className="ml-2 text-rose-500 inline-block w-1.5 h-1.5 rounded-full bg-rose-500 mb-6" />
            )}
          </h3>
          
          {question.description && (
            <p className="text-lg text-muted-foreground/60 font-medium leading-relaxed max-w-2xl">
              {question.description}
            </p>
          )}
        </div>
      )}

      <div className="space-y-6">
        <QuestionMedia media={question.media} />

        {question.figmaPrototypeUrl && (
          <div className="mt-4">
            <a 
              href={question.figmaPrototypeUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-primary/60 hover:text-primary transition-colors uppercase tracking-widest"
            >
              View Figma Prototype ↗
            </a>
          </div>
        )}

        <div className="pt-4">
          <QuestionRenderer 
            question={question} 
            answers={answers} 
            onAnswerChange={onAnswerChange} 
          />
        </div>
      </div>
    </div>
  );
};
