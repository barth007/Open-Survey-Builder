
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface WelcomePageSettingsProps {
  welcomeTitle: string;
  welcomeMessage: string;
  welcomeInstructions: string;
  welcomeButtonText: string;
  onWelcomeTitleChange: (value: string) => void;
  onWelcomeMessageChange: (value: string) => void;
  onWelcomeInstructionsChange: (value: string) => void;
  onWelcomeButtonTextChange: (value: string) => void;
}

export const WelcomePageSettings: React.FC<WelcomePageSettingsProps> = ({
  welcomeTitle,
  welcomeMessage,
  welcomeInstructions,
  welcomeButtonText,
  onWelcomeTitleChange,
  onWelcomeMessageChange,
  onWelcomeInstructionsChange,
  onWelcomeButtonTextChange
}) => {
  return (
    <Card className="border border-ice">
      <CardHeader className="pb-2">
        <h3 className="text-lg font-medium">Welcome Page</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="welcomeTitle">Welcome Title</Label>
            <Input 
              id="welcomeTitle"
              placeholder="Welcome to our survey"
              value={welcomeTitle || ''}
              onChange={(e) => onWelcomeTitleChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="welcomeMessage">Welcome Message</Label>
            <Textarea 
              id="welcomeMessage"
              placeholder="Thank you for taking the time to participate in our survey..."
              value={welcomeMessage || ''}
              onChange={(e) => onWelcomeMessageChange(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="welcomeInstructions">Instructions</Label>
            <Input 
              id="welcomeInstructions"
              placeholder="Click the button below to begin the survey."
              value={welcomeInstructions || ''}
              onChange={(e) => onWelcomeInstructionsChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="welcomeButtonText">Button Text</Label>
            <Input 
              id="welcomeButtonText"
              placeholder="Start Survey"
              value={welcomeButtonText || ''}
              onChange={(e) => onWelcomeButtonTextChange(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
