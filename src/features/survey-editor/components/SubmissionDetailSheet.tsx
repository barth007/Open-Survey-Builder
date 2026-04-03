import React from 'react';
import { CalendarClock, Camera, Mail, UserRound } from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { SubmissionRow } from '@/features/survey-editor/lib/submission-rows';

interface SubmissionDetailSheetProps {
  submission: SubmissionRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SubmissionDetailSheet: React.FC<SubmissionDetailSheetProps> = ({
  submission,
  open,
  onOpenChange,
}) => {
  if (!submission) {
    return null;
  }

  const email =
    typeof submission.response.metadata?.email === 'string'
      ? submission.response.metadata.email
      : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full border-border/70 px-0 sm:max-w-xl">
        <SheetHeader className="border-b border-border/60 px-5 pb-4 pt-8">
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-full border border-border/70 bg-muted/[0.18] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Submission
            </div>
            {submission.hasRecording && (
              <div className="rounded-full border border-border/70 bg-muted/[0.18] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Recording linked
              </div>
            )}
          </div>
          <SheetTitle className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
            {submission.participantLabel}
          </SheetTitle>
          <SheetDescription className="mt-2 text-sm text-muted-foreground">
            {new Date(submission.submittedAt).toLocaleString()}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-136px)]">
          <div className="space-y-5 px-5 py-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] border border-border/70 bg-muted/[0.14] px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-border/70 bg-background">
                    <CalendarClock className="h-4 w-4 text-foreground/70" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground">
                      Submitted
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {new Date(submission.submittedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-border/70 bg-muted/[0.14] px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-border/70 bg-background">
                    {email ? (
                      <Mail className="h-4 w-4 text-foreground/70" />
                    ) : (
                      <UserRound className="h-4 w-4 text-foreground/70" />
                    )}
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground">
                      Respondent
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {email || submission.response.participantId || 'Anonymous'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-border/70 bg-background px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium text-foreground">
                  Submission details
                </p>
                {submission.hasRecording && (
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-border/70 bg-muted/[0.18]">
                    <Camera className="h-4 w-4 text-foreground/70" />
                  </div>
                )}
              </div>
              <dl className="mt-4 space-y-2">
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-muted/[0.14] px-4 py-3">
                  <dt className="text-sm text-muted-foreground">Response ID</dt>
                  <dd className="break-all text-sm font-medium text-foreground">{submission.id}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-muted/[0.14] px-4 py-3">
                  <dt className="text-sm text-muted-foreground">Participant ID</dt>
                  <dd className="break-all text-sm font-medium text-foreground">{submission.response.participantId || 'None'}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-muted/[0.14] px-4 py-3">
                  <dt className="text-sm text-muted-foreground">Recording</dt>
                  <dd className="text-sm font-medium text-foreground">{submission.hasRecording ? 'Linked' : 'None'}</dd>
                </div>
              </dl>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  Answers
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {submission.answers.length} captured answer{submission.answers.length === 1 ? '' : 's'}
                </p>
              </div>

              {submission.answers.map((answer) => (
                <div
                  key={`${submission.id}-${answer.questionId}`}
                  className="rounded-[24px] border border-border/70 bg-background px-4 py-4"
                >
                  <p className="text-[11px] font-medium text-muted-foreground">
                    {answer.questionLabel}
                  </p>
                  <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
                    {answer.valueLabel || 'No value'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
