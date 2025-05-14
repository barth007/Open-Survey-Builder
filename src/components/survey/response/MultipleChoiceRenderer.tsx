
import React from 'react';
import { Question } from '@/types/survey';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-2">
      <RadioGroup 
        name={`question-${question.id}`} 
        value={value}
        onValueChange={onChange}
        className={isMobile ? "space-y-3" : "space-y-2"}
      >
        {question.options.map((option) => (
          <div 
            key={option.id} 
            className={`flex items-start ${isMobile ? 'space-x-3 pb-2' : 'space-x-2'}`}
          >
            <RadioGroupItem
              value={option.id}
              id={`response-${option.id}`}
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
      </RadioGroup>
    </div>
  );
};
