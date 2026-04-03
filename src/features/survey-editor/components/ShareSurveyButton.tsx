
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Survey } from '@/types/survey';
import { TeamSelector } from '@/features/survey-editor/components/TeamSelector';
import { Globe, Users, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPublicSurveyPath } from '@/lib/survey-routes';

interface ShareSurveyButtonProps {
  survey: Survey;
  onPublishToggle?: () => void;
  triggerClassName?: string;
}

export const ShareSurveyButton: React.FC<ShareSurveyButtonProps> = ({
  survey,
  onPublishToggle,
  triggerClassName,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Use a fallback for the public code to avoid undefined in URLs
  const publicCode = survey.publicCode || '';

  const baseUrl = window.location.origin;
  const publicUrl = publicCode ? `${baseUrl}${getPublicSurveyPath(publicCode)}` : '';

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast('Link copied!', { description: 'The public link has been copied to your clipboard.' });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="secondary" 
          size="sm" 
          className={cn(
            "h-9 gap-2 rounded-xl border border-border/70 bg-background px-3 text-sm font-medium text-foreground shadow-none hover:bg-muted/[0.18]",
            triggerClassName,
          )}
        >
          {survey.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
          <span>Share</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0 bg-background border border-border/10 rounded-xl shadow-2xl shadow-foreground/5 mr-4">
        <div className="p-6 pb-4">
          <h3 className="font-bold text-[11px] uppercase tracking-widest text-muted-foreground/40 mb-1">Share Survey</h3>
          <p className="text-xs text-muted-foreground/30 font-medium">
            Configure accessibility and sharing
          </p>
        </div>

        <div className="px-6 py-4 flex items-center justify-between border-t border-border/5">
          <div className="flex flex-col gap-1">
            <span className="text-[13px] font-bold text-foreground/70">Public Status</span>
            <span className="text-[10px] font-medium text-muted-foreground/30 uppercase tracking-wider">
              {survey.isPublished ? "Live & Collecting" : "Draft Mode"}
            </span>
          </div>
          <Switch
            checked={survey.isPublished}
            onCheckedChange={onPublishToggle}
            className="data-[state=checked]:bg-primary"
          />
        </div>

        <div className="space-y-6 p-6 border-t border-border/5">
          <div>
            <h3 className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground/20 flex items-center gap-2 mb-4">
              <Users className="h-3 w-3" />
              Team Sharing
            </h3>
            <TeamSelector
              surveyId={survey.id}
              currentTeamId={survey.teamId}
              currentFolderId={survey.folderId}
            />
          </div>

          <div>
            <h3 className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground/20 flex items-center gap-2 mb-3">
              <Globe className="h-3 w-3" />
              Public Link
            </h3>
            {survey.isPublished ? (
              <div className="flex gap-2">
                <Input
                  value={publicCode ? publicUrl : 'Unpublished'}
                  readOnly
                  className="h-9 text-[11px] font-semibold bg-primary/5 border-none focus-visible:ring-0 text-primary/60"
                />
                <Button
                  variant="ghost"
                  onClick={() => copyToClipboard(publicUrl)}
                  size="sm"
                  className="h-9 px-3 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5"
                  disabled={!publicCode}
                >
                  Copy
                </Button>
              </div>
            ) : (
              <div className="py-2 px-3 rounded-lg bg-muted/20 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/20 text-center">
                Publish to generate link
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
