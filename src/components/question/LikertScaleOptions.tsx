
import React from 'react';
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-medium">Likert Scale Options</h4>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onEditOptions}
          className="flex items-center gap-2"
        >
          <Settings size={14} />
          Customize Options
        </Button>
      </div>
      <RadioGroup className="w-full">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-3">
          {options.map((option) => (
            <div key={option.id} className="flex flex-col items-center p-2 border border-ice rounded-md">
              <RadioGroupItem value={option.id} id={option.id} disabled className="mx-auto mb-2" />
              <Label htmlFor={option.id} className="text-xs text-center mt-1 px-1">
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
