
import { Question, QuestionOption } from '@/types/survey';

export const useQuestionOptions = (
  question: Question,
  onQuestionChange: (updatedQuestion: Question) => void
) => {
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

  const saveLikertOptions = (newOptions: QuestionOption[]) => {
    onQuestionChange({
      ...question,
      options: newOptions,
      customLikertLabels: true
    });
  };

  return {
    addOption,
    deleteOption,
    updateOptionText,
    saveLikertOptions
  };
};
