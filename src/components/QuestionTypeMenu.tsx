
import React from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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

  const currentTypeLabel = questionTypes.find(type => type.value === currentType)?.label || 'Select Type';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {currentTypeLabel}
          <ChevronDown size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {questionTypes.map((type) => (
          <DropdownMenuItem
            key={type.value}
            onClick={() => onTypeChange(type.value)}
            className={currentType === type.value ? "bg-muted" : ""}
          >
            {type.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default QuestionTypeMenu;
