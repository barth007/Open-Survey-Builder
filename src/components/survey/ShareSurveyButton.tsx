
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Survey } from '@/types/survey';

interface ShareSurveyButtonProps {
  survey: Survey;
}

export const ShareSurveyButton: React.FC<ShareSurveyButtonProps> = ({ survey }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!survey.isPublished) {
    return (
      <Button variant="outline" disabled>
        Publish to Share
      </Button>
    );
  }
  
  const publicUrl = `${window.location.origin}/p/${survey.publicCode}`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicUrl);
    toast("Link copied!", {
      description: "The survey link has been copied to your clipboard.",
    });
    setIsOpen(false);
  };
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">Share Survey</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h3 className="font-medium">Share this survey</h3>
          <p className="text-sm text-muted-foreground">
            Anyone with this link can respond to your survey
          </p>
          <div className="flex gap-2">
            <Input 
              value={publicUrl}
              readOnly
              className="text-xs"
            />
            <Button onClick={copyToClipboard}>
              Copy
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
