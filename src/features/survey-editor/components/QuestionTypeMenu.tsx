
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { QuestionType } from '@/types/survey';
import { cn } from "@/lib/utils";

interface QuestionTypeMenuProps {
  currentType: QuestionType;
  onTypeChange: (type: QuestionType) => void;
  className?: string;
}

const QuestionTypeMenu: React.FC<QuestionTypeMenuProps> = ({
  currentType,
  onTypeChange,
  className,
}) => {
  const getTypeLabel = () => {
    switch (currentType) {
      case 'text':
        return 'Text';
      case 'multipleChoice':
        return 'Multiple Choice (Radio)';
      case 'checkboxes':
        return 'Multiple Choice (Checkboxes)';
      case 'likert5':
        return 'Likert: 5-point Scale';
      case 'likert7':
        return 'Likert: 7-point Scale';
      case 'likert10':
        return 'Likert: 10-point Scale';
      default:
        return 'Select Type';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={cn("flex items-center gap-2 w-full", className)}
        >
          {getTypeLabel()}
          <ChevronDown size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Question Types</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem 
            onClick={() => onTypeChange('text')}
            className={currentType === 'text' ? "bg-muted" : ""}
          >
            Text
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger 
            className={['multipleChoice', 'checkboxes'].includes(currentType) ? "bg-muted" : ""}
          >
            Multiple Choice
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem
              onClick={() => onTypeChange('multipleChoice')}
              className={currentType === 'multipleChoice' ? "bg-muted" : ""}
            >
              Radio Buttons
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onTypeChange('checkboxes')}
              className={currentType === 'checkboxes' ? "bg-muted" : ""}
            >
              Checkboxes
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger
            className={currentType.startsWith('likert') ? "bg-muted" : ""}
          >
            Likert Scale
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem
              onClick={() => onTypeChange('likert5')}
              className={currentType === 'likert5' ? "bg-muted" : ""}
            >
              5-point Scale
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onTypeChange('likert7')}
              className={currentType === 'likert7' ? "bg-muted" : ""}
            >
              7-point Scale
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onTypeChange('likert10')}
              className={currentType === 'likert10' ? "bg-muted" : ""}
            >
              10-point Scale
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default QuestionTypeMenu;
