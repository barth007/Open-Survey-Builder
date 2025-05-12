
import React from 'react';
import { Question } from '@/types/survey';

interface TextQuestionRendererProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
}

export const TextQuestionRenderer: React.FC<TextQuestionRendererProps> = ({
  question,
  value,
  onChange
}) => {
  return (
    <input 
      type="text" 
      className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-abyss"
      placeholder="Your answer"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};
