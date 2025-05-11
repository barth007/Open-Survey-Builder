
import React from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trash, Copy } from "lucide-react";

interface QuestionFooterProps {
  isRequired: boolean;
  onRequiredChange: (isRequired: boolean) => void;
  onDuplicateQuestion?: () => void;
  onDeleteQuestion: () => void;
}

const QuestionFooter: React.FC<QuestionFooterProps> = ({
  isRequired,
  onRequiredChange,
  onDuplicateQuestion,
  onDeleteQuestion
}) => {
  return (
    <div className="flex justify-between border-t px-6 py-3 border-ice">
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          <Switch
            checked={isRequired}
            onCheckedChange={onRequiredChange}
            className="data-[state=checked]:bg-flame"
          />
          <Label className="ml-2 text-carbon whitespace-nowrap">Required</Label>
        </div>
      </div>
      
      <div className="flex gap-2">
        {onDuplicateQuestion && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onDuplicateQuestion}
            className="text-abyss border-abyss hover:bg-abyss hover:text-white"
          >
            <Copy size={16} className="mr-1" />
            Duplicate
          </Button>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onDeleteQuestion}
          className="text-magma hover:text-magma hover:bg-red-50"
        >
          <Trash size={16} className="mr-1" />
          Delete
        </Button>
      </div>
    </div>
  );
};

export default QuestionFooter;
