
import React from 'react';
import { Question } from '@/types/survey';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useIsMobile } from '@/hooks/use-mobile';
import { getGridColumns } from '@/lib/utils';

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
  const isMobile = useIsMobile();

  return (
    <div className="mt-6">
      <RadioGroup 
        name={`likert-${question.id}`}
        value={value}
        onValueChange={onChange}
        className="w-full"
      >
        {isMobile ? (
          // Mobile vertical layout
          <div className="flex flex-col space-y-3 w-full">
            {question.options.map((option) => (
              <div 
                key={option.id} 
                className={`flex items-center p-3 border rounded-md transition-colors w-full
                  ${value === option.id 
                    ? 'border-blue-400 bg-blue-50 ring-1 ring-blue-300' 
                    : 'border-gray-200 hover:bg-gray-50'}
                `}
              >
                <RadioGroupItem
                  value={option.id}
                  id={`likert-${option.id}`}
                  className="mr-3"
                />
                <label 
                  htmlFor={`likert-${option.id}`}
                  className="text-sm text-gray-700 flex-1 cursor-pointer break-words"
                >
                  {option.text}
                </label>
              </div>
            ))}
          </div>
        ) : (
          // Desktop grid layout with responsive columns based on option count
          <div className={`grid ${getGridColumns(question.options.length)} gap-2`}>
            {question.options.map((option) => (
              <div 
                key={option.id} 
                className={`flex flex-col items-center p-2 border rounded-md transition-colors
                  ${value === option.id 
                    ? 'border-blue-400 bg-blue-50 ring-1 ring-blue-300' 
                    : 'border-gray-200 hover:bg-gray-50'}
                `}
              >
                <RadioGroupItem
                  value={option.id}
                  id={`likert-${option.id}`}
                  className="mx-auto mb-2"
                />
                <label 
                  htmlFor={`likert-${option.id}`}
                  className="text-xs text-center text-gray-700 px-1 cursor-pointer break-words w-full overflow-hidden"
                  style={{ overflowWrap: 'break-word', wordBreak: 'break-word', hyphens: 'auto', maxWidth: '100%' }}
                >
                  {option.text}
                </label>
              </div>
            ))}
          </div>
        )}
      </RadioGroup>
    </div>
  );
};
