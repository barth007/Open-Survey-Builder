
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {question.options.map((option) => (
            <div 
              key={option.id} 
              className={`flex flex-col items-center p-4 border rounded-md transition-colors
                ${value === option.id 
                  ? 'border-blue-400 bg-blue-50 ring-1 ring-blue-300' 
                  : 'border-gray-200 hover:bg-gray-50'}
              `}
            >
              <RadioGroupItem
                value={option.id}
                id={`likert-${option.id}`}
                className="mx-auto mb-3"
              />
              <label 
                htmlFor={`likert-${option.id}`}
                className="text-sm text-center text-gray-700 px-1 cursor-pointer"
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
