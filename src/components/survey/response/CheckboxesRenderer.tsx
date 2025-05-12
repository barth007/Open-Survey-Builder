
import React from 'react';
import { Question } from '@/types/survey';
import { Checkbox } from "@/components/ui/checkbox";

interface CheckboxesRendererProps {
  question: Question;
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

export const CheckboxesRenderer: React.FC<CheckboxesRendererProps> = ({
  question,
  selectedValues,
  onChange
}) => {
  const handleCheckboxChange = (optionId: string) => {
    if (selectedValues.includes(optionId)) {
      onChange(selectedValues.filter(id => id !== optionId));
      return;
    }
    
    if (question.maxSelections === 1) {
      onChange([optionId]);
      return;
    }
    
    if (question.maxSelections && selectedValues.length >= question.maxSelections) {
      return;
    }
    
    onChange([...selectedValues, optionId]);
  };

  return (
    <div className="space-y-2">
      {question.options.map((option) => (
        <div key={option.id} className="flex items-start space-x-2">
          <Checkbox
            id={`response-${option.id}`}
            checked={selectedValues.includes(option.id)}
            onCheckedChange={() => handleCheckboxChange(option.id)}
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
    </div>
  );
};
