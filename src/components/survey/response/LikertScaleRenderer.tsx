
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
  const columns = question.options.length;
  const gridClass = `grid grid-cols-${columns < 5 ? columns : 5} md:grid-cols-${columns} gap-1`;
  
  return (
    <div className="mt-4">
      <RadioGroup 
        name={`likert-${question.id}`}
        value={value}
        onValueChange={onChange}
      >
        <div className={gridClass}>
          {question.options.map((option) => (
            <div key={option.id} className="flex flex-col items-center">
              <RadioGroupItem
                value={option.id}
                id={`likert-${option.id}`}
                className="mx-auto"
              />
              <label 
                htmlFor={`likert-${option.id}`}
                className="text-xs text-center mt-1"
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
