
import React from 'react';
import { Question } from '@/types/survey';
import QuestionCard from '@/components/QuestionCard';

interface QuestionsListProps {
  questions: Question[];
  onQuestionChange: (question: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onDuplicateQuestion: (question: Question) => void;
}

const QuestionsList: React.FC<QuestionsListProps> = ({
  questions,
  onQuestionChange,
  onDeleteQuestion,
  onDuplicateQuestion
}) => {
  return (
    <>
      {questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          questions={questions}
          onQuestionChange={onQuestionChange}
          onDeleteQuestion={onDeleteQuestion}
          onDuplicateQuestion={onDuplicateQuestion}
        />
      ))}
    </>
  );
};

export default QuestionsList;
