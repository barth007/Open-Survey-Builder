import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import type { QuestionOption } from '@/types/survey';

interface BulkInsertOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (options: QuestionOption[]) => void;
}

export const BulkInsertOptionsDialog: React.FC<BulkInsertOptionsDialogProps> = ({
  open,
  onOpenChange,
  onInsert,
}) => {
  const [text, setText] = useState('');

  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const handleInsert = () => {
    const options: QuestionOption[] = lines.map((line) => ({
      id: crypto.randomUUID(),
      text: line,
    }));
    onInsert(options);
    setText('');
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) setText('');
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-[28px] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk insert options</DialogTitle>
          <DialogDescription>
            Enter one option per line. They will be appended to the existing options.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={'Option A\nOption B\nOption C'}
          rows={8}
          className="rounded-2xl border-border/70 bg-muted/10 shadow-none focus-visible:ring-1 font-mono text-sm"
          autoFocus
        />

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)} className="rounded-full">
            Cancel
          </Button>
          <Button
            onClick={handleInsert}
            disabled={lines.length === 0}
            className="rounded-full"
          >
            Insert {lines.length > 0 ? `${lines.length} option${lines.length === 1 ? '' : 's'}` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
