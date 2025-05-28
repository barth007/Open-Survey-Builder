
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  thankYouTitle: string;
  thankYouMessage: string;
  thankYouButtonText: string;
  redirectUrl: string;
  onThankYouTitleChange: (v: string) => void;
  onThankYouMessageChange: (v: string) => void;
  onThankYouButtonTextChange: (v: string) => void;
  onRedirectUrlChange: (v: string) => void;
}

export const ThankYouCard: React.FC<Props> = ({
  thankYouTitle,
  thankYouMessage,
  thankYouButtonText,
  redirectUrl,
  onThankYouTitleChange,
  onThankYouMessageChange,
  onThankYouButtonTextChange,
  onRedirectUrlChange,
}) => {
  return (
    <div className="rounded-xl border border-abyss bg-white p-6 space-y-4">
      <h3 className="text-lg font-medium">Thank You Page</h3>

      <div className="space-y-2">
        <Label htmlFor="thankYouTitle">Thank You Title</Label>
        <Input
          id="thankYouTitle"
          value={thankYouTitle}
          onChange={(e) => onThankYouTitleChange(e.target.value)}
          placeholder="Thank you!"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="thankYouMessage">Message</Label>
        <Textarea
          id="thankYouMessage"
          rows={3}
          value={thankYouMessage}
          onChange={(e) => onThankYouMessageChange(e.target.value)}
          placeholder="We appreciate your feedback…"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="thankYouButtonText">Button Text</Label>
        <Input
          id="thankYouButtonText"
          value={thankYouButtonText}
          onChange={(e) => onThankYouButtonTextChange(e.target.value)}
          placeholder="Submit Another Response"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="redirectUrl">Redirect URL</Label>
        <Input
          id="redirectUrl"
          value={redirectUrl}
          onChange={(e) => onRedirectUrlChange(e.target.value)}
          placeholder="https://example.com"
        />
      </div>
    </div>
  );
};
