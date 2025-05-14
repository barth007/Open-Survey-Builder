
import React from 'react';
import { Question } from '@/types/survey';
import { Checkbox } from "@/components/ui/checkbox";
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
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
    <div className={isMobile ? "space-y-3" : "space-y-2"}>
      {question.options.map((option) => (
        <div 
          key={option.id} 
          className={`flex items-start ${isMobile ? 'space-x-3 pb-2' : 'space-x-2'}`}
        >
          <Checkbox
            id={`response-${option.id}`}
            checked={selectedValues.includes(option.id)}
            onCheckedChange={() => handleCheckboxChange(option.id)}
            className={`mt-1 ${isMobile ? 'scale-110' : ''}`}
          />
          <div className={isMobile ? 'flex-1' : ''}>
            <label 
              htmlFor={`response-${option.id}`} 
              className={`text-md text-carbon ${isMobile ? 'text-base' : ''}`}
            >
              {option.text}
            </label>
            {option.media && (
              <div className={`mt-2 ${isMobile ? 'w-full' : ''}`}>
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
