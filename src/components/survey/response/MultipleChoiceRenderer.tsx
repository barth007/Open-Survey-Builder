
import React from 'react';
import { Question } from '@/types/survey';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface MultipleChoiceRendererProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
}

export const MultipleChoiceRenderer: React.FC<MultipleChoiceRendererProps> = ({
  question,
  value,
  onChange
}) => {
  return (
    <div className="space-y-2">
      <RadioGroup 
        name={`question-${question.id}`} 
        value={value}
        onValueChange={onChange}
      >
        {question.options.map((option) => (
          <div key={option.id} className="flex items-start space-x-2">
            <RadioGroupItem
              value={option.id}
              id={`response-${option.id}`}
              className="mt-1"
            />
            <div>
              <label htmlFor={`response-${option.id}`} className="text-md text-carbon">{option.text}</label>
              {option.media && (
                <div className="mt-2">
                  {option.media.type === 'image' || option.media.type === 'gif' ? (
                    <img 
                      src={option.media.url} 
                      alt={option.text} 
                      className="max-h-32 object-contain rounded-md" 
                    />
                  ) : (
                    <video 
                      src={option.media.url} 
                      controls 
                      className="max-h-32 w-full rounded-md"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};
