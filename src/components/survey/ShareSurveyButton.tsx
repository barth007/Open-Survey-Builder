
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
import { useQueryClient } from '@tanstack/react-query';

interface ShareSurveyButtonProps {
  survey: Survey;
}

export const ShareSurveyButton: React.FC<ShareSurveyButtonProps> = ({ survey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const queryClient = useQueryClient();

  const copyToClipboard = async () => {
    setIsCopying(true);
    
    try {
      // If we have a surveyId, ensure we have the latest data before generating a link
      if (survey.id) {
        await queryClient.invalidateQueries({ queryKey: ['survey', survey.id] });
        // Get the most up-to-date survey data
        const latestSurveyData = queryClient.getQueryData(['survey', survey.id]) as Survey;
        
        // Use the latest survey data if available, otherwise use the prop
        const currentSurvey = latestSurveyData || survey;
        
        const baseUrl = window.location.origin;
        const publicUrl = currentSurvey.isPublished
          ? `${baseUrl}/survey/${currentSurvey.id}`
          : `${baseUrl}/preview/${currentSurvey.publicCode}`;
        
        await navigator.clipboard.writeText(publicUrl);
        
        toast(
          currentSurvey.isPublished ? "Survey link copied!" : "Preview link copied!",
          {
            description: currentSurvey.isPublished
              ? "You have copied the live survey link."
              : "You have copied the preview link. Responses won't be stored.",
          }
        );
      } else {
        toast("Error copying link", {
          description: "Could not generate a survey link."
        });
      }
    } catch (error) {
      console.error("Error copying link:", error);
      toast("Error copying link", {
        description: "Failed to copy the link to clipboard."
      });
    } finally {
      setIsCopying(false);
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" disabled={isCopying}>
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
              value={survey.isPublished 
                ? `${window.location.origin}/survey/${survey.id}`
                : `${window.location.origin}/preview/${survey.publicCode}`}
              readOnly
              className="text-xs"
            />
            <Button onClick={copyToClipboard} disabled={isCopying}>
              {isCopying ? "Copying..." : "Copy"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
