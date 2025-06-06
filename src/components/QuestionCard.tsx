
import React from 'react';
import { Question } from '@/types/survey';
import QuestionHeader from '@/components/question/QuestionHeader';
import QuestionTypeAndMaxAnswers from '@/components/question/QuestionTypeAndMaxAnswers';
import QuestionOptions from '@/components/question/QuestionOptions';
import QuestionFooter from '@/components/question/QuestionFooter';
import QuestionCardMedia from '@/components/question/QuestionCardMedia';
import QuestionConditionalLogic from '@/components/question/QuestionConditionalLogic';
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
    handleTextChange,
    handleDescriptionChange,
    handleRequiredChange,
    handleMaxSelectionsChange,
    addOption,
    deleteOption,
    updateOptionText,
    handleMediaUpload,
    removeQuestionMedia,
    handleFigmaPrototypeUrlChange,
    conditionalLogicOpen,
    setConditionalLogicOpen,
    handleConditionalLogicChange,
    isMultipleType,
    duplicateQuestion
  } = useQuestionCardLogic(question, questions, onQuestionChange, onDeleteQuestion, onDuplicateQuestion);

  return (
    <Card className={`transition-all duration-200 ${isDragging ? 'opacity-50 rotate-2' : ''}`}>
      <CardContent className="p-6 space-y-4">
        <QuestionHeader
          text={question.text}
          description={question.description || ''}
          figmaPrototypeUrl={question.figmaPrototypeUrl}
          onTextChange={handleTextChange}
          onDescriptionChange={handleDescriptionChange}
          onFigmaPrototypeUrlChange={handleFigmaPrototypeUrlChange}
        />
        
        <QuestionTypeAndMaxAnswers
          type={question.type}
          onTypeChange={(type) => onQuestionChange({ ...question, type })}
          maxSelections={question.maxSelections}
          onMaxSelectionsChange={handleMaxSelectionsChange}
          isMultipleType={isMultipleType}
          optionsCount={question.options.length}
        />

        <QuestionCardMedia
          media={question.media}
          onMediaUpload={handleMediaUpload}
          onMediaRemove={removeQuestionMedia}
        />

        <QuestionOptions
          type={question.type}
          options={question.options}
          onAddOption={addOption}
          onUpdateOptionText={updateOptionText}
          onDeleteOption={deleteOption}
        />

        <QuestionConditionalLogic
          question={question}
          questions={questions}
          conditionalLogicOpen={conditionalLogicOpen}
          setConditionalLogicOpen={setConditionalLogicOpen}
          onConditionalLogicChange={handleConditionalLogicChange}
        />

        <QuestionFooter
          isRequired={question.isRequired}
          onRequiredChange={handleRequiredChange}
          onDuplicateQuestion={onDuplicateQuestion ? () => duplicateQuestion() : undefined}
          onDeleteQuestion={() => onDeleteQuestion(question.id)}
        />
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
