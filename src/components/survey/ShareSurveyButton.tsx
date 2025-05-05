
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
import { Separator } from '@/components/ui/separator';
import { TeamSelector } from '@/components/survey/TeamSelector';
import { Shield, Globe, Users } from 'lucide-react';

interface ShareSurveyButtonProps {
  survey: Survey;
}

export const ShareSurveyButton: React.FC<ShareSurveyButtonProps> = ({ survey }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Don't allow sharing if the survey is not published
  const isShareable = survey.isPublished;
  
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
        <Button variant="outline">
          {isShareable ? "Share Survey" : "Sharing Options"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team Sharing
            </h3>
            <p className="text-xs text-muted-foreground mt-1 mb-2">
              Share this survey with a team
            </p>
            <TeamSelector 
              surveyId={survey.id} 
              currentTeamId={survey.folderId as string}
            />
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Public Link
            </h3>
            {isShareable ? (
              <>
                <p className="text-xs text-muted-foreground mt-1 mb-2">
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
              </>
            ) : (
              <>
                <p className="text-xs text-muted-foreground mt-1 mb-2">
                  Publish your survey to generate a shareable public link
                </p>
                <Button variant="secondary" disabled className="w-full">
                  <Shield className="h-4 w-4 mr-2" />
                  Publish to share
                </Button>
              </>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
