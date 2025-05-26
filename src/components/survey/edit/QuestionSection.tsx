
import React from 'react';
import { Question } from '@/types/survey';
import QuestionsList from '../QuestionsList';
import AddQuestionButton from '@/components/AddQuestionButton';

interface QuestionSectionProps {
  questions: Question[];
  onQuestionChange: (question: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onDuplicateQuestion: (question: Question) => void;
  onAddQuestion: () => void;
}

export const QuestionSection: React.FC<QuestionSectionProps> = ({
  questions,
  onQuestionChange,
  onDeleteQuestion,
  onDuplicateQuestion,
  onAddQuestion
}) => {
  return (
    <div className="w-full flex flex-col space-y-4">
      <h3 className="text-lg font-medium">Survey Questions</h3>
      <QuestionsList 
        questions={questions}
        onQuestionChange={onQuestionChange}
        onDeleteQuestion={onDeleteQuestion}
        onDuplicateQuestion={onDuplicateQuestion}
      />
      <AddQuestionButton onClick={onAddQuestion} />
    </div>
  );
};
