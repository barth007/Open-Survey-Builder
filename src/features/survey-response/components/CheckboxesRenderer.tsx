
import React from 'react';
import { Question } from '@/types/survey';
import { Checkbox } from "@/components/ui/checkbox";
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

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
    <div className="grid grid-cols-1 gap-3">
      {question.options.map((option, index) => {
        const isSelected = selectedValues.includes(option.id);
        return (
          <div key={option.id}>
            <label 
              htmlFor={`response-${option.id}`}
              className={cn(
                "group flex items-center p-4 rounded-2xl border transition-all cursor-pointer",
                isSelected 
                  ? "bg-primary/5 border-primary/20 ring-1 ring-primary/20" 
                  : "bg-muted/10 border-transparent hover:bg-muted/20 hover:border-border/50"
              )}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors",
                  isSelected 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "bg-muted text-muted-foreground/40 group-hover:bg-muted/40 group-hover:text-muted-foreground/60"
                )}>
                  {String.fromCharCode(65 + index)}
                </div>
                
                <div className="flex-1">
                  <span className={cn(
                    "text-lg font-bold transition-colors",
                    isSelected ? "text-foreground" : "text-foreground/70 group-hover:text-foreground"
                  )}>
                    {option.text}
                  </span>
                  {option.media && (
                    <div className="mt-4">
                      {option.media.type === 'image' || option.media.type === 'gif' ? (
                        <img 
                          src={option.media.url} 
                          alt={option.text} 
                          className="max-h-48 w-auto object-contain rounded-xl" 
                        />
                      ) : (
                        <video 
                          src={option.media.url} 
                          controls 
                          className="max-h-48 w-auto rounded-xl"
                        />
                      )}
                    </div>
                  )}
                </div>

                <Checkbox
                  id={`response-${option.id}`}
                  checked={isSelected}
                  onCheckedChange={() => handleCheckboxChange(option.id)}
                  className="sr-only"
                />
              </div>
            </label>
          </div>
        );
      })}
    </div>
  );
};
