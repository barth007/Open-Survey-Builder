import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ThankYouCardProps {
  thankYouTitle: string;
  thankYouMessage: string;
  thankYouButtonText: string;
  redirectUrl: string;
  onThankYouTitleChange: (value: string) => void;
  onThankYouMessageChange: (value: string) => void;
  onThankYouButtonTextChange: (value: string) => void;
  onRedirectUrlChange: (value: string) => void;
}

export const ThankYouCard: React.FC<ThankYouCardProps> = ({
  thankYouTitle,
  thankYouMessage,
  thankYouButtonText,
  redirectUrl,
  onThankYouTitleChange,
  onThankYouMessageChange,
  onThankYouButtonTextChange,
  onRedirectUrlChange
}) => {
  return (
    <Card className="w-full mb-4 border-abyss">
      <CardContent className="pt-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="thankYouTitle">Thank You Title</Label>
          <Input
            id="thankYouTitle"
            value={thankYouTitle}
            onChange={(e) => onThankYouTitleChange(e.target.value)}
            placeholder="Thanks for your feedback!"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="thankYouMessage">Message</Label>
          <Textarea
            id="thankYouMessage"
            value={thankYouMessage}
            onChange={(e) => onThankYouMessageChange(e.target.value)}
            placeholder="We appreciate your input..."
            className="w-full resize-none"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="thankYouButtonText">Button Text</Label>
          <Input
            id="thankYouButtonText"
            value={thankYouButtonText}
            onChange={(e) => onThankYouButtonTextChange(e.target.value)}
            placeholder="Done"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="redirectUrl">Redirect URL</Label>
          <Input
            id="redirectUrl"
            value={redirectUrl}
            onChange={(e) => onRedirectUrlChange(e.target.value)}
            placeholder="https://example.com"
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};
