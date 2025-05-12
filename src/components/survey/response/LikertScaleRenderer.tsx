
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {question.options.map((option) => (
            <div key={option.id} className="flex flex-col items-center p-2">
              <RadioGroupItem
                value={option.id}
                id={`likert-${option.id}`}
                className="mx-auto mb-2"
              />
              <label 
                htmlFor={`likert-${option.id}`}
                className="text-sm text-center mt-2 text-gray-700"
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
