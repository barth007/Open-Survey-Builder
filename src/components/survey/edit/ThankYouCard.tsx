import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props {
  thankYouTitle: string;
  thankYouMessage: string;
  thankYouButtonText: string;
  redirectUrl: string;
  onThankYouTitleChange: (value: string) => void;
  onThankYouMessageChange: (value: string) => void;
  onThankYouButtonTextChange: (value: string) => void;
  onRedirectUrlChange: (value: string) => void;
}

const ThankYouCard: React.FC<Props> = ({
  thankYouTitle,
  thankYouMessage,
  thankYouButtonText,
  redirectUrl,
  onThankYouTitleChange,
  onThankYouMessageChange,
  onThankYouButtonTextChange,
  onRedirectUrlChange
}) => (
    <Card className="w-full border border-ice shadow-sm rounded-xl bg-white">
    <CardContent className="pt-6 pb-6 px-4 sm:px-6 space-y-5">
      <div className="space-y-2">
        <Label htmlFor="thankYouTitle">Thank You Title</Label>
        <Input
          id="thankYouTitle"
          value={thankYouTitle}
          onChange={(e) => onThankYouTitleChange(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="thankYouMessage">Thank You Message</Label>
        <Textarea
          id="thankYouMessage"
          value={thankYouMessage}
          onChange={(e) => onThankYouMessageChange(e.target.value)}
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="thankYouButtonText">Button Text</Label>
        <Input
          id="thankYouButtonText"
          value={thankYouButtonText}
          onChange={(e) => onThankYouButtonTextChange(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="redirectUrl">Redirect URL</Label>
        <Input
          id="redirectUrl"
          value={redirectUrl}
          onChange={(e) => onRedirectUrlChange(e.target.value)}
        />
      </div>
    </CardContent>
  </Card>
);

export default ThankYouCard;
