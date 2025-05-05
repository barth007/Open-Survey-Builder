
import { useToast } from "@/hooks/use-toast";
import { Question } from '@/types/survey';
import { useState } from 'react';

export const useQuestionManagement = (initialQuestions: Question[] = []) => {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const { toast } = useToast();

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: 'text',
      text: '',
      isRequired: false,
      options: []
    };
    
    setQuestions(prev => [...prev, newQuestion]);
    return newQuestion;
  };

  const updateQuestion = (updatedQuestion: Question) => {
    setQuestions(prev => 
      prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q)
    );
  };

  const deleteQuestion = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const duplicateQuestion = (questionToDuplicate: Question) => {
    const newQuestion: Question = {
      ...questionToDuplicate,
      id: Date.now().toString(),
      options: questionToDuplicate.options.map(option => ({
        ...option,
        id: `${Date.now()}-${option.id}`
      }))
    };

    setQuestions(prev => {
      const questionIndex = prev.findIndex(q => q.id === questionToDuplicate.id);
      const updatedQuestions = [...prev];
      updatedQuestions.splice(questionIndex + 1, 0, newQuestion);
      return updatedQuestions;
    });

    toast({
      title: "Question duplicated",
      description: "The question has been duplicated successfully.",
    });

    return newQuestion;
  };

  return {
    questions,
    setQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion
  };
};
