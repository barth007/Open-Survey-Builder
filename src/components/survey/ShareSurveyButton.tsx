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

  const publicUrl = survey.isPublished
    ? `${window.location.origin}/survey/${survey.id}`
    : `${window.location.origin}/preview/${survey.publicCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicUrl);
    toast(
      survey.isPublished ? "Survey link copied!" : "Preview link copied!",
      {
        description: survey.isPublished
          ? "You have copied the live survey link."
          : "You have copied the preview link. Responses won’t be stored.",
      }
    );
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">
          {survey.isPublished ? "Share Survey" : "Copy Preview Link"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h3 className="font-medium">
            {survey.isPublished ? "Share this survey" : "Preview this survey"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {survey.isPublished
              ? "Anyone with this link can respond to your survey"
              : "Preview link – responses are not saved"}
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
