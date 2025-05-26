
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ThankYouPageSettingsProps {
  thankYouTitle: string;
  thankYouMessage: string;
  thankYouButtonText: string;
  redirectUrl: string;
  onThankYouTitleChange: (value: string) => void;
  onThankYouMessageChange: (value: string) => void;
  onThankYouButtonTextChange: (value: string) => void;
  onRedirectUrlChange: (value: string) => void;
}

export const ThankYouPageSettings: React.FC<ThankYouPageSettingsProps> = ({
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
    <Card className="w-full border border-ice">
      <CardHeader className="pb-2">
        <h3 className="text-lg font-medium">Thank You Page</h3>
      </CardHeader>
      <CardContent>
        <div className="w-full">
          <div className="w-full">
            <Label htmlFor="thankYouTitle">Thank You Title</Label>
            <Input 
              id="thankYouTitle"
              placeholder="Thank you for your responses"
              value={thankYouTitle || ''}
              onChange={(e) => onThankYouTitleChange(e.target.value)}
            />
          </div>
          <div className="w-full">
            <Label htmlFor="thankYouMessage">Thank You Message</Label>
            <Textarea 
              id="thankYouMessage"
              placeholder="Your feedback has been submitted successfully."
              value={thankYouMessage || ''}
              onChange={(e) => onThankYouMessageChange(e.target.value)}
              rows={2}
            />
          </div>
          <div className="w-full">
            <Label htmlFor="thankYouButtonText">Button Text</Label>
            <Input 
              id="thankYouButtonText"
              placeholder="Close"
              value={thankYouButtonText || ''}
              onChange={(e) => onThankYouButtonTextChange(e.target.value)}
            />
          </div>
          <div className="w-full">
            <Label htmlFor="redirectUrl">Redirect URL (Optional)</Label>
            <Input 
              id="redirectUrl"
              placeholder="https://example.com/thank-you"
              value={redirectUrl || ''}
              onChange={(e) => onRedirectUrlChange(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
