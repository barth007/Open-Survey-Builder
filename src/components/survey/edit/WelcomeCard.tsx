import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props {
  welcomeTitle: string;
  welcomeMessage: string;
  welcomeInstructions: string;
  welcomeButtonText: string;
  onWelcomeTitleChange: (value: string) => void;
  onWelcomeMessageChange: (value: string) => void;
  onWelcomeInstructionsChange: (value: string) => void;
  onWelcomeButtonTextChange: (value: string) => void;
}

const WelcomeCard: React.FC<Props> = ({
  welcomeTitle,
  welcomeMessage,
  welcomeInstructions,
  welcomeButtonText,
  onWelcomeTitleChange,
  onWelcomeMessageChange,
  onWelcomeInstructionsChange,
  onWelcomeButtonTextChange
}) => (
  <Card className="w-full mb-4 border-abyss">
    <CardContent className="pt-6 space-y-5">
      <div className="space-y-2">
        <Label htmlFor="welcomeTitle">Welcome Title</Label>
        <Input
          id="welcomeTitle"
          placeholder="Welcome to our survey"
          value={welcomeTitle}
          onChange={(e) => onWelcomeTitleChange(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="welcomeMessage">Welcome Message</Label>
        <Textarea
          id="welcomeMessage"
          placeholder="Thank you for taking the time..."
          value={welcomeMessage}
          onChange={(e) => onWelcomeMessageChange(e.target.value)}
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="welcomeInstructions">Instructions</Label>
        <Input
          id="welcomeInstructions"
          placeholder="Click the button to begin"
          value={welcomeInstructions}
          onChange={(e) => onWelcomeInstructionsChange(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="welcomeButtonText">Button Text</Label>
        <Input
          id="welcomeButtonText"
          placeholder="Start Survey"
          value={welcomeButtonText}
          onChange={(e) => onWelcomeButtonTextChange(e.target.value)}
        />
      </div>
    </CardContent>
  </Card>
);

export default WelcomeCard;
