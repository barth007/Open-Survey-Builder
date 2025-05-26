import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Question } from '@/types/survey';
import LikertOptionsDialog from './survey/LikertOptionsDialog';
import QuestionHeader from './question/QuestionHeader';
import QuestionCardMedia from './question/QuestionCardMedia';
import QuestionTypeAndMaxAnswers from './question/QuestionTypeAndMaxAnswers';
import QuestionOptions from './question/QuestionOptions';
import LikertScaleOptions from './question/LikertScaleOptions';
import QuestionConditionalLogic from './question/QuestionConditionalLogic';
import QuestionFooter from './question/QuestionFooter';
import { useQuestionCardLogic } from '@/hooks/question/useQuestionCardLogic';

interface QuestionCardProps {
  question: Question;
  questions: Question[];
  onQuestionChange: (updatedQuestion: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onDuplicateQuestion?: (question: Question) => void;
  isDragging?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questions,
  onQuestionChange,
  onDeleteQuestion,
  onDuplicateQuestion,
  isDragging = false,
}) => {
  const {
    conditionalLogicOpen,
    setConditionalLogicOpen,
    likertOptionsDialogOpen,
    setLikertOptionsDialogOpen,
    handleTextChange,
    handleDescriptionChange,
    handleTypeChange,
    handleRequiredChange,
    handleMaxSelectionsChange,
    addOption,
    deleteOption,
    updateOptionText,
    handleMediaUpload,
    removeQuestionMedia,
    duplicateQuestion,
    handleConditionalLogicChange,
    handleLikertOptionsEdit,
    saveLikertOptions,
    handleFigmaPrototypeUrlChange,
    isMultipleType,
    isLikertType
  } = useQuestionCardLogic(question, questions, onQuestionChange, onDeleteQuestion, onDuplicateQuestion);

  return (
    <Card className={`w-full mb-4 ${isDragging ? 'opacity-50' : ''} border-abyss`}>
      <CardContent className="pt-6 space-y-5">
        <QuestionHeader 
          text={question.text}
          description={question.description || ''}
          figmaPrototypeUrl={question.figmaPrototypeUrl}
          onTextChange={handleTextChange}
          onDescriptionChange={handleDescriptionChange}
          onFigmaPrototypeUrlChange={handleFigmaPrototypeUrlChange}
        />

        <QuestionCardMedia 
          media={question.media}
          onMediaUpload={handleMediaUpload}
          onMediaRemove={removeQuestionMedia}
        />

        <QuestionTypeAndMaxAnswers 
          type={question.type}
          onTypeChange={handleTypeChange}
          maxSelections={question.maxSelections}
          onMaxSelectionsChange={handleMaxSelectionsChange}
          isMultipleType={isMultipleType}
          optionsCount={question.options.length}
        />

        <div className="border-t border-ice pt-3">
          <QuestionOptions 
            type={question.type}
            options={question.options}
            onAddOption={addOption}
            onUpdateOptionText={updateOptionText}
            onDeleteOption={deleteOption}
          />

          <LikertScaleOptions 
            type={question.type}
            options={question.options}
            onEditOptions={handleLikertOptionsEdit}
          />
        </div>

        <QuestionConditionalLogic 
          question={question}
          questions={questions}
          conditionalLogicOpen={conditionalLogicOpen}
          setConditionalLogicOpen={setConditionalLogicOpen}
          onConditionalLogicChange={handleConditionalLogicChange}
        />
      </CardContent>
      
      <CardFooter>
        <QuestionFooter 
          isRequired={question.isRequired}
          onRequiredChange={handleRequiredChange}
          onDuplicateQuestion={onDuplicateQuestion ? duplicateQuestion : undefined}
          onDeleteQuestion={() => onDeleteQuestion(question.id)}
        />
      </CardFooter>

      <LikertOptionsDialog
        isOpen={likertOptionsDialogOpen}
        onClose={() => setLikertOptionsDialogOpen(false)}
        options={question.options}
        onSave={saveLikertOptions}
      />
    </Card>
  );
};

export default QuestionCard;
