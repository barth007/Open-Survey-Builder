
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Copy, Trash2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface QuestionFooterProps {
  isRequired: boolean;
  onRequiredChange: (required: boolean) => void;
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
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="required"
          checked={isRequired}
          onCheckedChange={onRequiredChange}
        />
        <Label htmlFor="required" className="text-sm text-carbon">
          Required
        </Label>
      </div>
      
      <div className="flex items-center space-x-2">
        {onDuplicateQuestion && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size={isMobile ? "sm" : "icon"}
                  onClick={onDuplicateQuestion}
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Duplicate question</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size={isMobile ? "sm" : "icon"}
                onClick={onDeleteQuestion}
                className="shrink-0 hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete question</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default QuestionFooter;
