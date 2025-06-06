
import React from 'react';
import { Question } from '@/types/survey';
import { QuestionHeader } from '@/components/question/QuestionHeader';
import { QuestionTypeAndMaxAnswers } from '@/components/question/QuestionTypeAndMaxAnswers';
import { QuestionOptions } from '@/components/question/QuestionOptions';
import { QuestionFooter } from '@/components/question/QuestionFooter';
import { QuestionCardMedia } from '@/components/question/QuestionCardMedia';
import { QuestionConditionalLogic } from '@/components/question/QuestionConditionalLogic';
import { useQuestionCardLogic } from '@/hooks/question/useQuestionCardLogic';
import { Card, CardContent } from '@/components/ui/card';

interface QuestionCardProps {
  question: Question;
  questions: Question[];
  onQuestionChange: (updatedQuestion: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onDuplicateQuestion?: (question: Question) => Question;
  isDragging?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questions,
  onQuestionChange,
  onDeleteQuestion,
  onDuplicateQuestion,
  isDragging = false
}) => {
  const {
    localQuestion,
    handleQuestionChange,
    handleOptionChange,
    handleDeleteOption,
    handleAddOption,
    handleRequiredChange,
    handleMaxSelectionsChange,
    handleMediaUpload,
    handleMediaRemove,
    handleFigmaUpload,
    handleFigmaRemove,
    handleConditionalLogicChange
  } = useQuestionCardLogic(question, onQuestionChange);

  return (
    <Card className={`transition-all duration-200 ${isDragging ? 'opacity-50 rotate-2' : ''}`}>
      <CardContent className="p-6 space-y-4">
        <QuestionHeader
          question={localQuestion}
          onQuestionChange={handleQuestionChange}
          onDeleteQuestion={onDeleteQuestion}
          onDuplicateQuestion={onDuplicateQuestion}
        />
        
        <QuestionTypeAndMaxAnswers
          question={localQuestion}
          onQuestionChange={handleQuestionChange}
          onRequiredChange={handleRequiredChange}
          onMaxSelectionsChange={handleMaxSelectionsChange}
        />

        <QuestionCardMedia
          question={localQuestion}
          onMediaUpload={handleMediaUpload}
          onMediaRemove={handleMediaRemove}
          onFigmaUpload={handleFigmaUpload}
          onFigmaRemove={handleFigmaRemove}
        />

        <QuestionOptions
          question={localQuestion}
          onOptionChange={handleOptionChange}
          onDeleteOption={handleDeleteOption}
          onAddOption={handleAddOption}
        />

        <QuestionConditionalLogic
          question={localQuestion}
          questions={questions}
          onConditionalLogicChange={handleConditionalLogicChange}
        />
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
