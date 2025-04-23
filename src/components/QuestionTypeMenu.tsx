
import React from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { QuestionType } from '@/types/survey';

interface QuestionTypeMenuProps {
  currentType: QuestionType;
  onTypeChange: (type: QuestionType) => void;
}

const QuestionTypeMenu: React.FC<QuestionTypeMenuProps> = ({
  currentType,
  onTypeChange,
}) => {
  const questionTypes = [
    { value: 'text', label: 'Text' },
    { value: 'multipleChoice', label: 'Multiple Choice' },
    { value: 'checkboxes', label: 'Checkboxes' },
  ] as const;

  const likertTypes = [
    { value: 'likert5', label: '5-point Likert Scale' },
    { value: 'likert7', label: '7-point Likert Scale' },
    { value: 'likert10', label: '10-point Likert Scale' },
  ] as const;

  const getTypeLabel = () => {
    const basicType = questionTypes.find(type => type.value === currentType);
    if (basicType) return basicType.label;
    
    const likertType = likertTypes.find(type => type.value === currentType);
    if (likertType) return likertType.label;
    
    return 'Select Type';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {getTypeLabel()}
          <ChevronDown size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Basic Types</DropdownMenuLabel>
        <DropdownMenuGroup>
          {questionTypes.map((type) => (
            <DropdownMenuItem
              key={type.value}
              onClick={() => onTypeChange(type.value)}
              className={currentType === type.value ? "bg-muted" : ""}
            >
              {type.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>Likert Scales</DropdownMenuLabel>
        <DropdownMenuGroup>
          {likertTypes.map((type) => (
            <DropdownMenuItem
              key={type.value}
              onClick={() => onTypeChange(type.value as QuestionType)}
              className={currentType === type.value ? "bg-muted" : ""}
            >
              {type.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default QuestionTypeMenu;
