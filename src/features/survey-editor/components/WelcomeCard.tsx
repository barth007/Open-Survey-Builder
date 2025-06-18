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

export const WelcomeCard = ({
    welcomeTitle,
    welcomeMessage,
    welcomeInstructions,
    welcomeButtonText,
    onWelcomeTitleChange,
    onWelcomeMessageChange,
    onWelcomeInstructionsChange,
    onWelcomeButtonTextChange,
  }: WelcomeCardProps) => {
    return (
      <div className="rounded-xl border border-abyss bg-white p-6 space-y-4">
        <h3 className="text-lg font-medium">Welcome Page</h3>
  
        <div className="space-y-2">
          <Label htmlFor="welcomeTitle">Welcome Title</Label>
          <Input
            id="welcomeTitle"
            value={welcomeTitle}
            onChange={(e) => onWelcomeTitleChange(e.target.value)}
            placeholder="Welcome to our survey"
          />
        </div>
  
        <div className="space-y-2">
          <Label htmlFor="welcomeMessage">Welcome Message</Label>
          <Textarea
            id="welcomeMessage"
            rows={3}
            value={welcomeMessage}
            onChange={(e) => onWelcomeMessageChange(e.target.value)}
            placeholder="Thank you for joining…"
          />
        </div>
  
        <div className="space-y-2">
          <Label htmlFor="welcomeInstructions">Instructions</Label>
          <Input
            id="welcomeInstructions"
            value={welcomeInstructions}
            onChange={(e) => onWelcomeInstructionsChange(e.target.value)}
            placeholder="Click the button to begin."
          />
        </div>
  
        <div className="space-y-2">
          <Label htmlFor="welcomeButtonText">Button Text</Label>
          <Input
            id="welcomeButtonText"
            value={welcomeButtonText}
            onChange={(e) => onWelcomeButtonTextChange(e.target.value)}
            placeholder="Start Survey"
          />
        </div>
      </div>
    );
  };
