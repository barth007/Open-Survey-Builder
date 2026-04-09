import React from 'react';
import { CheckCircle2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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
    <section className="overflow-hidden rounded-[34px] border border-border/70 bg-background shadow-[0_14px_50px_rgba(15,15,15,0.05)]">
      <div className="flex items-center gap-3 border-b border-border/60 bg-muted/[0.18] px-6 py-4 sm:px-8">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-background">
          <CheckCircle2 className="h-4 w-4 text-foreground/70" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Thank You Page
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Confirmation screen shown after submission.
          </p>
        </div>
      </div>

      <div className="grid gap-5 px-6 py-7 sm:px-8 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="thankYouTitle" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Title
          </Label>
          <Input
            id="thankYouTitle"
            value={thankYouTitle}
            onChange={(e) => onThankYouTitleChange(e.target.value)}
            placeholder="Thank you!"
            className="rounded-xl border-border/70 bg-muted/[0.08]"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="thankYouButtonText" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Button Text
          </Label>
          <Input
            id="thankYouButtonText"
            value={thankYouButtonText}
            onChange={(e) => onThankYouButtonTextChange(e.target.value)}
            placeholder="Submit Another Response"
            className="rounded-xl border-border/70 bg-muted/[0.08]"
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="thankYouMessage" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Message
          </Label>
          <Textarea
            id="thankYouMessage"
            rows={3}
            value={thankYouMessage}
            onChange={(e) => onThankYouMessageChange(e.target.value)}
            placeholder="We appreciate your feedback..."
            className="min-h-[92px] rounded-xl border-border/70 bg-muted/[0.08]"
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="redirectUrl" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Redirect URL
          </Label>
          <Input
            id="redirectUrl"
            value={redirectUrl}
            onChange={(e) => onRedirectUrlChange(e.target.value)}
            placeholder="https://example.com"
            className="rounded-xl border-border/70 bg-muted/[0.08]"
          />
        </div>
      </div>
    </section>
  );
};
