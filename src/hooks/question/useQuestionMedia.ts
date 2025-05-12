
import { Question } from '@/types/survey';

export const useQuestionMedia = (
  question: Question,
  onQuestionChange: (updatedQuestion: Question) => void
) => {
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

  const handleFigmaPrototypeUrlChange = (figmaPrototypeUrl: string) => {
    onQuestionChange({ ...question, figmaPrototypeUrl });
  };

  return {
    handleMediaUpload,
    removeQuestionMedia,
    handleFigmaPrototypeUrlChange
  };
};
