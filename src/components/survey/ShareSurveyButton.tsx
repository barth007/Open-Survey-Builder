
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
import { Shield, Globe, Users, Link, Eye, Check, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface ShareSurveyButtonProps {
  survey: Survey;
  onPublishToggle?: () => void;
}

export const ShareSurveyButton: React.FC<ShareSurveyButtonProps> = ({ 
  survey,
  onPublishToggle
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Use a fallback for the public code to avoid undefined in URLs
  const publicCode = survey.publicCode || '';
  
  const baseUrl = window.location.origin;
  const publicUrl = `${baseUrl}/p/${publicCode}`;
  const previewUrl = `${baseUrl}/preview/${publicCode}`;
  
  const copyToClipboard = (url: string, type: 'public' | 'preview') => {
    navigator.clipboard.writeText(url);
    toast(`${type === 'public' ? 'Public' : 'Preview'} link copied!`, {
      description: `The ${type === 'public' ? 'public' : 'preview'} link has been copied to your clipboard.`,
    });
  };
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline"
          className={cn(
            survey.isPublished ? "text-green-600 border-green-400 hover:bg-green-50" : "text-gray-600 border-gray-300"
          )}
        >
          {survey.isPublished ? (
            <Check className="h-4 w-4 mr-2 text-green-600" />
          ) : (
            <X className="h-4 w-4 mr-2 text-gray-500" />
          )}
          {survey.isPublished ? "Published" : "Unpublished"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0 bg-white">
        <div className="p-4 pb-2">
          <h3 className="font-medium text-sm">Share Survey</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Configure how others access your survey
          </p>
        </div>
        
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-medium">Publishing</span>
            <span className="text-xs text-muted-foreground">
              {survey.isPublished ? "Survey is live and collecting responses" : "Survey is in draft mode"}
            </span>
          </div>
          <Switch 
            checked={survey.isPublished} 
            onCheckedChange={onPublishToggle}
            className={cn(
              survey.isPublished ? "bg-green-500" : "bg-gray-200"
            )}
          />
        </div>
        
        <Separator className="my-2" />
        
        <div className="space-y-4 p-4">
          <div>
            <h3 className="font-medium flex items-center gap-2 text-sm">
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
            <h3 className="font-medium flex items-center gap-2 text-sm">
              <Eye className="h-4 w-4" />
              Preview Link
            </h3>
            <p className="text-xs text-muted-foreground mt-1 mb-2">
              Share for testing - responses won't be recorded
            </p>
            <div className="flex gap-2">
              <Input 
                value={publicCode ? previewUrl : 'Publish survey to generate link'}
                readOnly
                className="text-xs"
              />
              <Button 
                onClick={() => copyToClipboard(previewUrl, 'preview')}
                size="sm"
                disabled={!publicCode}
              >
                Copy
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4" />
              Public Link
            </h3>
            {survey.isPublished ? (
              <>
                <p className="text-xs text-muted-foreground mt-1 mb-2">
                  Anyone with this link can respond to your survey
                </p>
                <div className="flex gap-2">
                  <Input 
                    value={publicCode ? publicUrl : 'Publish survey to generate link'}
                    readOnly
                    className="text-xs"
                  />
                  <Button 
                    onClick={() => copyToClipboard(publicUrl, 'public')}
                    size="sm"
                    disabled={!publicCode}
                  >
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
