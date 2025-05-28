
import React from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trash, Copy } from "lucide-react";
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex ${isMobile ? 'flex-col gap-4' : 'justify-between'} border-t px-3 sm:px-6 py-4 border-ice w-full min-h-[fit-content]`}>
      <div className="flex items-center gap-3">
        <div className="flex items-center space-x-2">
          <Switch
            checked={isRequired}
            onCheckedChange={onRequiredChange}
            className="data-[state=checked]:bg-flame"
          />
          <Label className="ml-2 text-carbon whitespace-nowrap">Required</Label>
        </div>
      </div>
      
      <div className={`flex ${isMobile ? 'w-full justify-between' : 'gap-3'}`}>
        {onDuplicateQuestion && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onDuplicateQuestion}
            className={`text-abyss border-abyss hover:bg-abyss hover:text-white ${isMobile ? 'flex-1 px-0 sm:px-2' : 'px-3'}`}
          >
            <Copy size={16} className={isMobile ? 'mx-auto' : 'mr-2'} />
            {!isMobile}
          </Button>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onDeleteQuestion}
          className={`text-magma hover:text-magma hover:bg-red-50 ${isMobile ? 'flex-1 px-0 sm:px-2' : 'px-3'}`}
        >
          <Trash size={16} className={isMobile ? 'mx-auto' : 'mr-2'} />
          {!isMobile}
        </Button>
      </div>
    </div>
  );
};

export default QuestionFooter;
