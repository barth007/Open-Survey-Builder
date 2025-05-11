
import React, { useState } from 'react';
import { Check, Trash } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QuestionOption, QuestionType } from '@/types/survey';
import { FileImage } from "lucide-react";

interface QuestionOptionsProps {
  type: QuestionType;
  options: QuestionOption[];
  onAddOption: (text: string) => void;
  onUpdateOptionText: (optionId: string, text: string) => void;
  onDeleteOption: (optionId: string) => void;
}

const QuestionOptions: React.FC<QuestionOptionsProps> = ({
  type,
  options,
  onAddOption,
  onUpdateOptionText,
  onDeleteOption,
}) => {
  const [newOptionText, setNewOptionText] = useState('');
  
  const addOption = () => {
    if (newOptionText.trim() === '') return;
    onAddOption(newOptionText);
    setNewOptionText('');
  };

  if (type === 'text') {
    return (
      <Input disabled placeholder="Text answer will appear here" className="bg-muted/50" />
    );
  }

  const isMultipleChoice = type === 'multipleChoice';
  const isCheckboxes = type === 'checkboxes';
  const isLikertType = type.startsWith('likert');

  // Don't show options for Likert types (handled separately)
  if (isLikertType) {
    return null;
  }

  return (
    <div className="space-y-2">
      {(isMultipleChoice || isCheckboxes) && options.map((option) => (
        <div key={option.id} className="flex items-start gap-2">
          {isMultipleChoice ? (
            <RadioGroup className="flex mt-3">
              <RadioGroupItem value={option.id} id={option.id} disabled />
            </RadioGroup>
          ) : (
            <Checkbox disabled id={option.id} className="mt-3" />
          )}
          <div className="flex-1">
            <Input 
              value={option.text}
              onChange={(e) => onUpdateOptionText(option.id, e.target.value)}
              className="flex-1 border-ice"
            />
          </div>
          
          {option.media && (
            <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-md flex items-center justify-center overflow-hidden">
              <FileImage size={16} className="text-muted-foreground" />
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDeleteOption(option.id)}
            className="text-magma mt-1"
          >
            <Trash size={16} />
          </Button>
        </div>
      ))}
      
      {(isMultipleChoice || isCheckboxes) && (
        <div className="flex items-center gap-2 mt-2">
          <Input
            value={newOptionText}
            onChange={(e) => setNewOptionText(e.target.value)}
            placeholder="Add option"
            className="flex-1 border-ice"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addOption();
              }
            }}
          />
          <Button 
            onClick={addOption} 
            size="sm" 
            variant="outline"
            className="border-abyss text-abyss hover:bg-abyss hover:text-white"
          >
            <Check size={16} className="mr-1" />
            Add
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuestionOptions;
