import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  thankYouTitle: string;
  thankYouMessage: string;
  thankYouButtonText: string;
  redirectUrl: string;
}

export const ThankYouPage: React.FC<Props> = ({
  thankYouTitle,
  thankYouMessage,
  thankYouButtonText,
  redirectUrl
}) => {
  return (
    <Card className="w-full border border-ice min-h-[320px] h-auto">
      <CardContent className="space-y-4 p-6">
        <h3 className="text-lg font-medium">Thank You Page</h3>

        <div className="space-y-2">
          <Label>Thank You Title</Label>
          <Input value={thankYouTitle} disabled />
        </div>

        <div className="space-y-2">
          <Label>Thank You Message</Label>
          <Textarea value={thankYouMessage} rows={3} disabled />
        </div>

        <div className="space-y-2">
          <Label>Button Text</Label>
          <Input value={thankYouButtonText} disabled />
        </div>

        <div className="space-y-2">
          <Label>Redirect URL</Label>
          <Input value={redirectUrl} disabled />
        </div>
      </CardContent>
    </Card>
  );
};
