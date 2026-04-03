
import { useState } from 'react';
import {
  Question,
  QuestionType,
  LIKERT_5_LABELS,
  LIKERT_7_LABELS,
  LIKERT_10_LABELS
} from '@/types/survey';
import { debugLog } from '@/lib/logger';

export const useLikertOptions = (
  question: Question,
  onQuestionChange: (updatedQuestion: Question) => void
) => {
  const [likertOptionsDialogOpen, setLikertOptionsDialogOpen] = useState(false);

  const handleTypeChange = (type: QuestionType) => {
    console.log(`[useLikertOptions] Changing question type from ${question.type} to ${type}`);
    debugLog(`[useLikertOptions] Changing question type from ${question.type} to ${type}`);

    if (type === 'likert5' || type === 'likert7' || type === 'likert10') {
      let labels: string[] = [];

      if (type === 'likert5') {
        labels = [...LIKERT_5_LABELS];
        debugLog(`[useLikertOptions] Using Likert 5 labels:`, labels);
      } else if (type === 'likert7') {
        labels = [...LIKERT_7_LABELS];
        debugLog(`[useLikertOptions] Using Likert 7 labels:`, labels);
      } else if (type === 'likert10') {
        labels = [...LIKERT_10_LABELS];
        debugLog(`[useLikertOptions] Using Likert 10 labels:`, labels);
      }

      debugLog(`[useLikertOptions] Expected ${labels.length} options for ${type}`);

      const options = labels.map((label, index) => ({
        id: `likert-${question.id}-${index}`,
        text: label
      }));

      debugLog(`[useLikertOptions] Generated ${options.length} options:`, options);

      const updatedQuestion = {
        ...question,
        type,
        options,
        customLikertLabels: false
      };

      debugLog(`[useLikertOptions] Updating question with ${updatedQuestion.options.length} options`);
      onQuestionChange(updatedQuestion);

      // Additional verification after state update
      setTimeout(() => {
        debugLog(`[useLikertOptions] Question ${question.id} should now have ${options.length} options`);
      }, 100);
    } else {
      console.log(`[useLikertOptions] Non-Likert type ${type}, keeping existing options or clearing`);
      onQuestionChange({ ...question, type });
    }
  };

  const handleLikertOptionsEdit = () => {
    console.log(`[useLikertOptions] Opening Likert options dialog for question ${question.id}`);
    setLikertOptionsDialogOpen(true);
  };

  return {
    likertOptionsDialogOpen,
    setLikertOptionsDialogOpen,
    handleTypeChange,
    handleLikertOptionsEdit
  };
};
