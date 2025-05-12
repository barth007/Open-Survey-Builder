
import { useState, useEffect } from 'react';
import { Question, ConditionalLogic, QuestionType, LIKERT_5_LABELS, LIKERT_7_LABELS, LIKERT_10_LABELS } from '@/types/survey';
import { useToast } from "@/hooks/use-toast";

export const useQuestionCardLogic = (
  question: Question,
  questions: Question[],
  onQuestionChange: (updatedQuestion: Question) => void,
  onDeleteQuestion: (id: string) => void,
  onDuplicateQuestion?: (question: Question) => void
) => {
  const [conditionalLogicOpen, setConditionalLogicOpen] = useState(!!question.conditionalLogic?.dependsOn);
  const [likertOptionsDialogOpen, setLikertOptionsDialogOpen] = useState(false);
  const { toast } = useToast();

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

  return {
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
  };
};
