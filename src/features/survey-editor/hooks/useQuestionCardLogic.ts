
import { useEffect, useRef } from 'react';
import { Question, QuestionType } from '@/types/survey';
import { debugLog } from '@/lib/logger';
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
  const isChangingTypeRef = useRef(false);

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

  // Enhanced type change handler with better coordination
  const handleQuestionTypeChange = (type: QuestionType) => {
    console.log(`[useQuestionCardLogic] Changing question type from ${question.type} to ${type}`);

    // Set flag to prevent interference from other effects
    isChangingTypeRef.current = true;

    // Use the Likert-aware type change handler
    handleTypeChange(type);

    // Reset flag after a delay to allow the change to complete
    setTimeout(() => {
      isChangingTypeRef.current = false;
      console.log(`[useQuestionCardLogic] Question ${question.id} type change completed. Final options count:`, question.options.length);
    }, 200);
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
  }, [questions, question.conditionalLogic, handleConditionalLogicChange]);

  // Monitor Likert options with better protection against interference
  useEffect(() => {
    if (isChangingTypeRef.current) {
      console.log(`[useQuestionCardLogic] Skipping options check - type change in progress`);
      return;
    }

    const isLikertType = question.type.startsWith('likert');
    if (isLikertType && question.options.length === 0) {
      console.warn(`[useQuestionCardLogic] Likert question ${question.id} (${question.type}) has no options, regenerating...`);
      handleTypeChange(question.type);
    } else if (isLikertType) {
      // Validate option count for Likert types
      const expectedCount = question.type === 'likert5' ? 5 :
        question.type === 'likert7' ? 7 :
          question.type === 'likert10' ? 10 : 0;

      if (expectedCount > 0 && question.options.length !== expectedCount) {
        console.warn(`[useQuestionCardLogic] Likert question ${question.id} (${question.type}) has ${question.options.length} options, expected ${expectedCount}. Regenerating...`);
        handleTypeChange(question.type);
      } else {
        debugLog(`[useQuestionCardLogic] Likert question ${question.id} (${question.type}) has correct number of options: ${question.options.length}`);
      }
    }
  }, [question.id, question.type, question.options.length, handleTypeChange]);

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

    // From useLikertOptions - expose all needed properties
    likertOptionsDialogOpen,
    setLikertOptionsDialogOpen,
    handleTypeChange: handleQuestionTypeChange, // Use enhanced handler
    handleLikertOptionsEdit,

    // Computed values
    isMultipleType,
    isLikertType
  };
};
