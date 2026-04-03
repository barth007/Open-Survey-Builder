
import React from 'react';
import { Question } from '@/types/survey';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useIsMobile } from '@/hooks/use-mobile';
import { getGridColumns, cn } from '@/lib/utils';

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
    <div className="mt-8">
      <RadioGroup 
        name={`likert-${question.id}`}
        value={value}
        onValueChange={onChange}
        className={cn(
          "grid gap-3",
          isMobile ? "grid-cols-1" : "grid-cols-2 md:grid-cols-5"
        )}
      >
        {question.options.map((option, index) => {
          const isSelected = value === option.id;
          return (
            <div key={option.id}>
              <label 
                htmlFor={`likert-${option.id}`}
                className={cn(
                  "group flex flex-col items-center justify-center p-6 rounded-2xl border transition-all cursor-pointer h-full text-center",
                  isSelected 
                    ? "bg-primary/5 border-primary/20 ring-1 ring-primary/20" 
                    : "bg-muted/10 border-transparent hover:bg-muted/20 hover:border-border/50"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm mb-4 transition-colors",
                  isSelected 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "bg-muted text-muted-foreground/40 group-hover:bg-muted/40 group-hover:text-muted-foreground/60"
                )}>
                  {index + 1}
                </div>
                
                <span className={cn(
                  "text-sm font-bold leading-tight transition-colors",
                  isSelected ? "text-foreground" : "text-foreground/70 group-hover:text-foreground"
                )}>
                  {option.text}
                </span>

                <RadioGroupItem
                  value={option.id}
                  id={`likert-${option.id}`}
                  className="sr-only"
                />
              </label>
            </div>
          );
        })}
      </RadioGroup>
      {(question.scaleLeftLabel || question.scaleCenterLabel || question.scaleRightLabel) && (
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground/70">
          <div className="text-left">{question.scaleLeftLabel || ''}</div>
          <div className="text-center">{question.scaleCenterLabel || ''}</div>
          <div className="text-right">{question.scaleRightLabel || ''}</div>
        </div>
      )}
    </div>
  );
};
