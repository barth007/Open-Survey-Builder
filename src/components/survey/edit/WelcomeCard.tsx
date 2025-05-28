import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface WelcomeCardProps {
  welcomeTitle: string;
  welcomeMessage: string;
  welcomeInstructions: string;
  welcomeButtonText: string;
  onWelcomeTitleChange: (value: string) => void;
  onWelcomeMessageChange: (value: string) => void;
  onWelcomeInstructionsChange: (value: string) => void;
  onWelcomeButtonTextChange: (value: string) => void;
}

export const WelcomeCard: React.FC<WelcomeCardProps> = ({
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
    <Card className="w-full mb-4 border-abyss">
      <CardContent className="pt-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="welcomeTitle">Welcome Title</Label>
          <Input
            id="welcomeTitle"
            value={welcomeTitle}
            onChange={(e) => onWelcomeTitleChange(e.target.value)}
            placeholder="Welcome to our survey"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="welcomeMessage">Message</Label>
          <Textarea
            id="welcomeMessage"
            value={welcomeMessage}
            onChange={(e) => onWelcomeMessageChange(e.target.value)}
            placeholder="We're glad you're here..."
            className="w-full resize-none"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="welcomeInstructions">Instructions</Label>
          <Input
            id="welcomeInstructions"
            value={welcomeInstructions}
            onChange={(e) => onWelcomeInstructionsChange(e.target.value)}
            placeholder="Click the button to begin"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="welcomeButtonText">Button Text</Label>
          <Input
            id="welcomeButtonText"
            value={welcomeButtonText}
            onChange={(e) => onWelcomeButtonTextChange(e.target.value)}
            placeholder="Start"
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};
