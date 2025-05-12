
import { Question } from '@/types/survey';

export const useQuestionBasics = (
  question: Question,
  onQuestionChange: (updatedQuestion: Question) => void,
  onDeleteQuestion: (id: string) => void,
  onDuplicateQuestion?: (question: Question) => void
) => {
  const handleTextChange = (text: string) => {
    onQuestionChange({ ...question, text });
  };

  const handleDescriptionChange = (description: string) => {
    onQuestionChange({ ...question, description });
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

  const duplicateQuestion = () => {
    if (onDuplicateQuestion) {
      onDuplicateQuestion(question);
    }
  };

  return {
    handleTextChange,
    handleDescriptionChange,
    handleRequiredChange,
    handleMaxSelectionsChange,
    duplicateQuestion
  };
};
