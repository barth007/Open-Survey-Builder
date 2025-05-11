
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Question, ConditionalLogic, QuestionType } from '@/types/survey';
import LikertOptionsDialog from './survey/LikertOptionsDialog';
import QuestionHeader from './question/QuestionHeader';
import QuestionCardMedia from './question/QuestionCardMedia';
import QuestionTypeAndMaxAnswers from './question/QuestionTypeAndMaxAnswers';
import QuestionOptions from './question/QuestionOptions';
import LikertScaleOptions from './question/LikertScaleOptions';
import QuestionConditionalLogic from './question/QuestionConditionalLogic';
import QuestionFooter from './question/QuestionFooter';
import { LIKERT_5_LABELS, LIKERT_7_LABELS, LIKERT_10_LABELS } from '@/types/survey';

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
  const [conditionalLogicOpen, setConditionalLogicOpen] = useState(!!question.conditionalLogic?.dependsOn);
  const [likertOptionsDialogOpen, setLikertOptionsDialogOpen] = useState(false);

  useEffect(() => {
    if (question.conditionalLogic?.dependsOn && 
        ['equals', 'notEquals'].includes(question.conditionalLogic.operator) && 
        questions.find(q => q.id === question.conditionalLogic?.dependsOn)) {
      
      const selectedDependentQuestion = questions.find(q => q.id === question.conditionalLogic?.dependsOn);
      const value = question.conditionalLogic.value;
      
      if (selectedDependentQuestion && 
          value && 
          !selectedDependentQuestion.options.some(opt => opt.id === value) && 
          selectedDependentQuestion.options.length > 0) {
        
        handleConditionalLogicChange('value', selectedDependentQuestion.options[0].id);
      }
    }
  }, [questions, question.conditionalLogic]);

  const handleTextChange = (text: string) => {
    onQuestionChange({ ...question, text });
  };

  const handleDescriptionChange = (description: string) => {
    onQuestionChange({ ...question, description });
  };

  const handleTypeChange = (type: QuestionType) => {
    if (type === 'likert5' || type === 'likert7' || type === 'likert10') {
      let labels: string[] = [];
      
      if (type === 'likert5') labels = LIKERT_5_LABELS;
      else if (type === 'likert7') labels = LIKERT_7_LABELS;
      else if (type === 'likert10') labels = LIKERT_10_LABELS;
      
      const options = labels.map((label, index) => ({
        id: `likert-${question.id}-${index}`,
        text: label
      }));
      
      onQuestionChange({ 
        ...question, 
        type,
        options,
        customLikertLabels: false 
      });
    } else {
      onQuestionChange({ ...question, type });
    }
  };

  const handleRequiredChange = (isRequired: boolean) => {
    onQuestionChange({ ...question, isRequired });
  };

  const handleMaxSelectionsChange = (value: string) => {
    const maxSelections = value === "no-limit" ? undefined : parseInt(value);
    onQuestionChange({
      ...question,
      maxSelections: isNaN(maxSelections as number) ? undefined : maxSelections
    });
  };

  const addOption = (text: string) => {
    if (text.trim() === '') return;
    
    const newOption = {
      id: Date.now().toString(),
      text
    };
    
    onQuestionChange({
      ...question,
      options: [...question.options, newOption]
    });
  };

  const deleteOption = (optionId: string) => {
    onQuestionChange({
      ...question,
      options: question.options.filter(option => option.id !== optionId)
    });
  };

  const updateOptionText = (optionId: string, text: string) => {
    onQuestionChange({
      ...question,
      options: question.options.map(option => 
        option.id === optionId ? { ...option, text } : option
      )
    });
  };

  const handleMediaUpload = (file: File, type: 'image' | 'video') => {
    const url = URL.createObjectURL(file);
    
    onQuestionChange({
      ...question,
      media: {
        type,
        url
      }
    });
  };

  const removeQuestionMedia = () => {
    const { media, ...rest } = question;
    onQuestionChange({
      ...rest,
      id: question.id,
      type: question.type,
      text: question.text,
      isRequired: question.isRequired,
      options: question.options,
    });
  };

  const duplicateQuestion = () => {
    if (onDuplicateQuestion) {
      onDuplicateQuestion(question);
    }
  };

  const handleConditionalLogicChange = (field: keyof ConditionalLogic, value: string) => {
    const updatedLogic: ConditionalLogic = {
      ...(question.conditionalLogic || { operator: 'equals', dependsOn: '' }),
      [field]: value,
    };

    if (field === 'dependsOn' && value !== '') {
      const dependentQuestion = questions.find(q => q.id === value);
      if (dependentQuestion && dependentQuestion.options.length > 0) {
        updatedLogic.value = dependentQuestion.options[0].id;
      } else {
        updatedLogic.value = '';
      }
    } else if (field === 'operator' && ['equals', 'notEquals'].includes(value)) {
      const dependentQuestion = questions.find(q => q.id === updatedLogic.dependsOn);
      if (dependentQuestion && dependentQuestion.options.length > 0 && !updatedLogic.value) {
        updatedLogic.value = dependentQuestion.options[0].id;
      }
    }

    onQuestionChange({
      ...question,
      conditionalLogic: updatedLogic,
    });
  };

  const handleLikertOptionsEdit = () => {
    setLikertOptionsDialogOpen(true);
  };

  const saveLikertOptions = (newOptions: any[]) => {
    onQuestionChange({
      ...question,
      options: newOptions,
      customLikertLabels: true
    });
  };

  const handleFigmaPrototypeUrlChange = (figmaPrototypeUrl: string) => {
    onQuestionChange({ ...question, figmaPrototypeUrl });
  };

  const isMultipleType = question.type === 'multipleChoice' || question.type === 'checkboxes';
  const isLikertType = question.type === 'likert5' || question.type === 'likert7' || question.type === 'likert10';

  return (
    <Card className={`mb-4 ${isDragging ? 'opacity-50' : ''} border-abyss`}>
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
