import React from 'react';
import { LayoutTemplate } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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
    <section className="overflow-hidden rounded-[34px] border border-border/70 bg-background shadow-[0_14px_50px_rgba(15,15,15,0.05)]">
      <div className="flex items-center gap-3 border-b border-border/60 bg-muted/[0.18] px-6 py-4 sm:px-8">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-background">
          <LayoutTemplate className="h-4 w-4 text-foreground/70" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Welcome Page
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Intro screen shown before the first question.
          </p>
        </div>
      </div>

      <div className="grid gap-5 px-6 py-7 sm:px-8 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="welcomeTitle" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Title
          </Label>
          <Input
            id="welcomeTitle"
            value={welcomeTitle}
            onChange={(e) => onWelcomeTitleChange(e.target.value)}
            placeholder="Welcome to our survey"
            className="rounded-xl border-border/70 bg-muted/[0.08]"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="welcomeButtonText" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Button Text
          </Label>
          <Input
            id="welcomeButtonText"
            value={welcomeButtonText}
            onChange={(e) => onWelcomeButtonTextChange(e.target.value)}
            placeholder="Start Survey"
            className="rounded-xl border-border/70 bg-muted/[0.08]"
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="welcomeMessage" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Message
          </Label>
          <Textarea
            id="welcomeMessage"
            rows={3}
            value={welcomeMessage}
            onChange={(e) => onWelcomeMessageChange(e.target.value)}
            placeholder="Thank you for joining..."
            className="min-h-[92px] rounded-xl border-border/70 bg-muted/[0.08]"
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="welcomeInstructions" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Instructions
          </Label>
          <Input
            id="welcomeInstructions"
            value={welcomeInstructions}
            onChange={(e) => onWelcomeInstructionsChange(e.target.value)}
            placeholder="Click the button to begin."
            className="rounded-xl border-border/70 bg-muted/[0.08]"
          />
        </div>
      </div>
    </section>
  );
};
