
import React from 'react';
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import { QuestionOption, QuestionType } from '@/types/survey';
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";

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
  if (!type.startsWith('likert')) {
    return null;
  }
  
  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium">Likert Scale Options</h4>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onEditOptions}
          className="flex items-center gap-1"
        >
          <Settings size={14} />
          Customize Options
        </Button>
      </div>
      <RadioGroup>
        <div className="grid grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-2 mt-2">
          {options.map((option) => (
            <div key={option.id} className="flex flex-col items-center">
              <RadioGroup.Item value={option.id} id={option.id} disabled className="mx-auto" />
              <Label htmlFor={option.id} className="text-xs text-center mt-1">
                {option.text}
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
};

export default LikertScaleOptions;
