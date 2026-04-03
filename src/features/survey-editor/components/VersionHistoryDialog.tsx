import React from 'react';
import { History } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface SurveyRevisionRecord {
  id: string;
  label?: string | null;
  createdAt: string;
  restoredAt?: string | null;
  snapshot?: {
    name?: string;
    questions?: Array<unknown>;
  } | null;
}

interface VersionHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  revisions: SurveyRevisionRecord[];
  isRestoring?: boolean;
  onRestore: (revisionId: string) => void;
}

export const VersionHistoryDialog: React.FC<VersionHistoryDialogProps> = ({
  open,
  onOpenChange,
  revisions,
  isRestoring = false,
  onRestore,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl rounded-[28px] border-border/70 p-0 overflow-hidden">
      <DialogHeader className="border-b border-border/60 bg-muted/[0.18] px-6 py-5">
        <DialogTitle className="flex items-center gap-3 text-lg font-semibold tracking-tight text-foreground">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-background">
            <History className="h-4 w-4 text-foreground/70" />
          </span>
          Version History
        </DialogTitle>
      </DialogHeader>

      <div className="max-h-[70vh] space-y-3 overflow-y-auto px-6 py-6">
        {revisions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 px-5 py-8 text-center">
            <p className="text-sm font-medium text-foreground">No revisions yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Revisions appear automatically as the form evolves.
            </p>
          </div>
        ) : (
          revisions.map((revision) => {
            const questionCount = revision.snapshot?.questions?.length ?? 0;

            return (
              <div key={revision.id} className="rounded-2xl border border-border/70 bg-background px-5 py-4 shadow-[0_10px_24px_rgba(15,15,15,0.04)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {revision.label || revision.snapshot?.name || 'Untitled revision'}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(revision.createdAt).toLocaleString()}
                    </p>
                    <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      {questionCount} question{questionCount === 1 ? '' : 's'}
                    </p>
                    {revision.restoredAt ? (
                      <p className="mt-2 text-xs text-emerald-700">
                        Restored {new Date(revision.restoredAt).toLocaleString()}
                      </p>
                    ) : null}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={isRestoring}
                    onClick={() => onRestore(revision.id)}
                    className="rounded-full border-border/70 px-4"
                  >
                    Restore draft
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </DialogContent>
  </Dialog>
);
