
import React from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
    <TooltipProvider>
      <div className={`flex ${isMobile ? 'flex-col gap-4' : 'justify-between'} border-t px-3 sm:px-6 py-4 border-ice w-full`}>
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
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size={isMobile ? "sm" : "icon"}
                  onClick={onDuplicateQuestion}
                  className={`text-abyss border-abyss hover:bg-abyss hover:text-white ${isMobile ? 'flex-1' : ''}`}
                >
                  <Copy size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Duplicate question</p>
              </TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size={isMobile ? "sm" : "icon"}
                onClick={onDeleteQuestion}
                className={`text-magma hover:text-magma hover:bg-red-50 ${isMobile ? 'flex-1' : ''}`}
              >
                <Trash size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete question</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default QuestionFooter;
