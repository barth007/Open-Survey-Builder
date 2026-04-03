
import React from 'react';
import { Question } from '@/types/survey';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

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
  const badgeType = question.badgeType ?? 'letters';

  const getBadge = (index: number) => {
    if (badgeType === 'off') {
      return null;
    }

    if (badgeType === 'numbers') {
      return String(index + 1);
    }

    return String.fromCharCode(65 + index);
  };
  
  return (
    <div className="space-y-3">
      <RadioGroup 
        name={`question-${question.id}`} 
        value={value}
        onValueChange={onChange}
        className="grid grid-cols-1 gap-3"
      >
        {question.options.map((option, index) => {
          const isSelected = value === option.id;
          const badge = getBadge(index);

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
                  {badge && (
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors",
                      isSelected 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                        : "bg-muted text-muted-foreground/40 group-hover:bg-muted/40 group-hover:text-muted-foreground/60"
                    )}>
                      {badge}
                    </div>
                  )}
                  
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

                  <RadioGroupItem
                    value={option.id}
                    id={`response-${option.id}`}
                    className="sr-only"
                  />
                </div>
              </label>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
};
