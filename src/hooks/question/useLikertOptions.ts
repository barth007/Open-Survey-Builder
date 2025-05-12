
import { useState } from 'react';
import { Question, LIKERT_5_LABELS, LIKERT_7_LABELS, LIKERT_10_LABELS, QuestionType } from '@/types/survey';

export const useLikertOptions = (
  question: Question,
  onQuestionChange: (updatedQuestion: Question) => void
) => {
  const [likertOptionsDialogOpen, setLikertOptionsDialogOpen] = useState(false);

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

  const handleLikertOptionsEdit = () => {
    setLikertOptionsDialogOpen(true);
  };

  return {
    likertOptionsDialogOpen,
    setLikertOptionsDialogOpen,
    handleTypeChange,
    handleLikertOptionsEdit
  };
};
