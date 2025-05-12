
import React from 'react';
import { Question } from '@/types/survey';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface LikertScaleRendererProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
}

export const LikertScaleRenderer: React.FC<LikertScaleRendererProps> = ({
  question,
  value,
  onChange
}) => {
  return (
    <div className="mt-6">
      <RadioGroup 
        name={`likert-${question.id}`}
        value={value}
        onValueChange={onChange}
        className="w-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {question.options.map((option) => (
            <div 
              key={option.id} 
              className="flex flex-col items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            >
              <RadioGroupItem
                value={option.id}
                id={`likert-${option.id}`}
                className="mx-auto mb-3"
              />
              <label 
                htmlFor={`likert-${option.id}`}
                className="text-sm text-center text-gray-700 px-1"
              >
                {option.text}
              </label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
};
