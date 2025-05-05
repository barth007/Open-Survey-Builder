
import { useToast } from "@/hooks/use-toast";
import { Question } from '@/types/survey';
import { useState } from 'react';

export const useQuestionManagement = (initialQuestions: Question[] = []) => {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const { toast } = useToast();

  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type: 'text',
      text: '',
      isRequired: false,
      options: []
    };
    
    setQuestions(prev => [...prev, newQuestion]);
    return newQuestion;
  };

  const updateQuestion = (updatedQuestion: Question) => {
    // Validate the question structure
    if (!updatedQuestion.id) {
      console.error("Cannot update question without an ID");
      return;
    }

    setQuestions(prev => 
      prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q)
    );
  };

  const deleteQuestion = (questionId: string) => {
    if (!questionId) {
      console.error("Cannot delete question without an ID");
      return;
    }
    
    setQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const duplicateQuestion = (questionToDuplicate: Question) => {
    if (!questionToDuplicate.id) {
      console.error("Cannot duplicate question without an ID");
      return questionToDuplicate;
    }

    const newQuestion: Question = {
      ...questionToDuplicate,
      id: crypto.randomUUID(),
      options: questionToDuplicate.options.map(option => ({
        ...option,
        id: `${Date.now()}-${option.id}`
      }))
    };

    setQuestions(prev => {
      const questionIndex = prev.findIndex(q => q.id === questionToDuplicate.id);
      if (questionIndex === -1) {
        // If not found, just append to the end
        return [...prev, newQuestion];
      }
      
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
