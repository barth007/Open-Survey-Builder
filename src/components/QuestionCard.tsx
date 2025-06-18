
import React, { useEffect } from 'react';
import { Question } from '@/types/survey';
import QuestionHeader from './../features/survey-editor/components/QuestionHeader';
import QuestionTypeAndMaxAnswers from './../features/survey-editor/components/QuestionTypeAndMaxAnswers';
import QuestionOptions from './../features/survey-editor/components/QuestionOptions';
import QuestionFooter from './../features/survey-editor/components/QuestionFooter';
import QuestionCardMedia from './../features/survey-editor/components/QuestionCardMedia';
import QuestionConditionalLogic from './../features/survey-editor/components/QuestionConditionalLogic';
import LikertScaleOptions from '@/features/survey-editor/components/LikertScaleOptions';
import LikertOptionsDialog from '@/components/survey/LikertOptionsDialog';
import { useQuestionCardLogic } from '@/hooks/question/useQuestionCardLogic';
import { Card, CardContent } from '@/components/ui/card';

interface QuestionCardProps {
  question: Question;
  questions: Question[];
  onQuestionChange: (updatedQuestion: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onDuplicateQuestion?: (question: Question) => Question;
  isDragging?: boolean;
  dragHandleProps?: any;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questions,
  onQuestionChange,
  onDeleteQuestion,
  onDuplicateQuestion,
  isDragging = false,
  dragHandleProps
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
    handleLikertOptionsEdit,
    likertOptionsDialogOpen,
    setLikertOptionsDialogOpen,
    saveLikertOptions,
    isMultipleType,
    isLikertType,
    duplicateQuestion
  } = useQuestionCardLogic(question, questions, onQuestionChange, onDeleteQuestion, onDuplicateQuestion);

  // Debug logging for option counts
  useEffect(() => {
    if (isLikertType) {
      const expectedCount = question.type === 'likert5' ? 5 : 
                           question.type === 'likert7' ? 7 : 
                           question.type === 'likert10' ? 10 : 0;
      
      console.log(`[QuestionCard] Likert question ${question.id} (${question.type}):`, {
        actualOptions: question.options.length,
        expectedOptions: expectedCount,
        options: question.options.map(opt => opt.text)
      });

      if (expectedCount !== question.options.length) {
        console.warn(`[QuestionCard] Option count mismatch for ${question.type}: expected ${expectedCount}, got ${question.options.length}`);
      }
    }
  }, [question.type, question.options.length, isLikertType, question.id]);

  return (
    <>
      <Card className={`transition-all duration-200 ${isDragging ? 'opacity-50 rotate-2' : ''}`}>
        <CardContent className="p-6 space-y-4">
          <QuestionHeader
            text={question.text}
            description={question.description || ''}
            figmaPrototypeUrl={question.figmaPrototypeUrl}
            onTextChange={handleTextChange}
            onDescriptionChange={handleDescriptionChange}
            onFigmaPrototypeUrlChange={handleFigmaPrototypeUrlChange}
            dragHandleProps={dragHandleProps}
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

          {isLikertType && (
            <LikertScaleOptions
              type={question.type}
              options={question.options}
              onEditOptions={handleLikertOptionsEdit}
            />
          )}

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

      {isLikertType && (
        <LikertOptionsDialog
          isOpen={likertOptionsDialogOpen}
          onClose={() => setLikertOptionsDialogOpen(false)}
          options={question.options}
          onSave={saveLikertOptions}
        />
      )}
    </>
  );
};

export default QuestionCard;
