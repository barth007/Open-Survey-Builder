import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  welcomeTitle: string;
  welcomeMessage: string;
  welcomeInstructions: string;
  welcomeButtonText: string;
}

export const WelcomePage: React.FC<Props> = ({
  welcomeTitle,
  welcomeMessage,
  welcomeInstructions,
  welcomeButtonText
}) => {
  return (
    <Card className="w-full border border-ice min-h-[320px] h-auto">
      <CardContent className="space-y-4 p-6">
        <h3 className="text-lg font-medium">Welcome Page</h3>

        <div className="space-y-2">
          <Label>Welcome Title</Label>
          <Input value={welcomeTitle} disabled />
        </div>

        <div className="space-y-2">
          <Label>Welcome Message</Label>
          <Textarea value={welcomeMessage} rows={3} disabled />
        </div>

        <div className="space-y-2">
          <Label>Instructions</Label>
          <Input value={welcomeInstructions} disabled />
        </div>

        <div className="space-y-2">
          <Label>Button Text</Label>
          <Input value={welcomeButtonText} disabled />
        </div>
      </CardContent>
    </Card>
  );
};
