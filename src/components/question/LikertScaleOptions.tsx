
import React from 'react';
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QuestionOption, QuestionType } from '@/types/survey';
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { useIsMobile } from '@/hooks/use-mobile';

interface LikertScaleOptionsProps {
  type: QuestionType;
  options: QuestionOption[];
  onEditOptions: () => void;
}

const LikertScaleOptions: React.FC<LikertScaleOptionsProps> = ({
  type,
  options,
  onEditOptions
}) => {
  const isMobile = useIsMobile();
  
  if (!type.startsWith('likert')) {
    return null;
  }
  
  return (
    <div className="mt-6">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h4 className="text-sm font-medium mb-2 md:mb-0">Likert Scale Options</h4>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onEditOptions}
          className="flex items-center gap-2 text-xs md:text-sm"
        >
          <Settings size={14} />
          Customize Options
        </Button>
      </div>
      <RadioGroup className="w-full">
        {isMobile ? (
          // Mobile view - vertical list
          <div className="space-y-2">
            {options.map((option) => (
              <div key={option.id} className="flex items-center p-2 border border-ice rounded-md">
                <RadioGroupItem value={option.id} id={option.id} disabled className="mr-3" />
                <Label htmlFor={option.id} className="text-xs break-words flex-1">
                  {option.text}
                </Label>
              </div>
            ))}
          </div>
        ) : (
          // Desktop view - grid layout
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-3">
            {options.map((option) => (
              <div key={option.id} className="flex flex-col items-center p-2 border border-ice rounded-md">
                <RadioGroupItem value={option.id} id={option.id} disabled className="mx-auto mb-2" />
                <Label htmlFor={option.id} className="text-xs text-center mt-1 px-1 break-words w-full">
                  {option.text}
                </Label>
              </div>
            ))}
          </div>
        )}
      </RadioGroup>
    </div>
  );
};

export default LikertScaleOptions;
