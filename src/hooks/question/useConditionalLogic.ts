
import { useState } from 'react';
import { Question, ConditionalLogic } from '@/types/survey';

export const useConditionalLogic = (
  question: Question,
  questions: Question[],
  onQuestionChange: (updatedQuestion: Question) => void
) => {
  const [conditionalLogicOpen, setConditionalLogicOpen] = useState(!!question.conditionalLogic?.dependsOn);

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

  return {
    conditionalLogicOpen,
    setConditionalLogicOpen,
    handleConditionalLogicChange
  };
};
