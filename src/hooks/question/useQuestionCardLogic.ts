
import { useEffect } from 'react';
import { Question, QuestionType } from '@/types/survey';
import { useToast } from "@/hooks/use-toast";
import { useQuestionBasics } from './useQuestionBasics';
import { useQuestionOptions } from './useQuestionOptions';
import { useQuestionMedia } from './useQuestionMedia';
import { useConditionalLogic } from './useConditionalLogic';
import { useLikertOptions } from './useLikertOptions';

export const useQuestionCardLogic = (
  question: Question,
  questions: Question[],
  onQuestionChange: (updatedQuestion: Question) => void,
  onDeleteQuestion: (id: string) => void,
  onDuplicateQuestion?: (question: Question) => void
) => {
  const { toast } = useToast();

  const {
    handleTextChange,
    handleDescriptionChange,
    handleRequiredChange,
    handleMaxSelectionsChange,
    duplicateQuestion
  } = useQuestionBasics(question, onQuestionChange, onDeleteQuestion, onDuplicateQuestion);

  const {
    addOption,
    deleteOption,
    updateOptionText,
    saveLikertOptions
  } = useQuestionOptions(question, onQuestionChange);

  const {
    handleMediaUpload,
    removeQuestionMedia,
    handleFigmaPrototypeUrlChange
  } = useQuestionMedia(question, onQuestionChange);

  const {
    conditionalLogicOpen,
    setConditionalLogicOpen,
    handleConditionalLogicChange
  } = useConditionalLogic(question, questions, onQuestionChange);

  const {
    likertOptionsDialogOpen,
    setLikertOptionsDialogOpen,
    handleTypeChange,
    handleLikertOptionsEdit
  } = useLikertOptions(question, onQuestionChange);

  // Enhanced type change handler to properly save Likert options
  const handleQuestionTypeChange = (type: QuestionType) => {
    console.log(`Changing question type from ${question.type} to ${type}`);
    
    // Use the Likert-aware type change handler
    handleTypeChange(type);
    
    // Ensure options are preserved for the new type
    setTimeout(() => {
      console.log(`Question ${question.id} type changed to ${type}, options:`, question.options);
    }, 100);
  };

  // Check if dependent question's options have changed
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

  // Monitor Likert options to ensure they're preserved
  useEffect(() => {
    const isLikertType = question.type.startsWith('likert');
    if (isLikertType && question.options.length === 0) {
      console.warn(`Likert question ${question.id} has no options, regenerating...`);
      handleTypeChange(question.type);
    }
  }, [question.type, question.options, handleTypeChange]);

  const isMultipleType = question.type === 'multipleChoice' || question.type === 'checkboxes';
  const isLikertType = question.type === 'likert5' || question.type === 'likert7' || question.type === 'likert10';

  return {
    // From useQuestionBasics
    handleTextChange,
    handleDescriptionChange,
    handleRequiredChange,
    handleMaxSelectionsChange,
    duplicateQuestion,
    
    // From useQuestionOptions
    addOption,
    deleteOption,
    updateOptionText,
    saveLikertOptions,
    
    // From useQuestionMedia
    handleMediaUpload,
    removeQuestionMedia,
    handleFigmaPrototypeUrlChange,
    
    // From useConditionalLogic
    conditionalLogicOpen,
    setConditionalLogicOpen,
    handleConditionalLogicChange,
    
    // From useLikertOptions
    likertOptionsDialogOpen,
    setLikertOptionsDialogOpen,
    handleTypeChange: handleQuestionTypeChange, // Use enhanced handler
    handleLikertOptionsEdit,
    
    // Computed values
    isMultipleType,
    isLikertType
  };
};
