import React from 'react';
import { Plus } from 'lucide-react';

import { cn } from '@/lib/utils';

interface EditorInsertGuideProps {
  label: string;
  description?: string;
  prominent?: boolean;
  onInsert: (rect: DOMRect) => void;
}

export const EditorInsertGuide: React.FC<EditorInsertGuideProps> = ({
  label,
  description,
  prominent = false,
  onInsert,
}) => {
  if (prominent) {
    return (
      <div className="py-8">
        <div className="mx-auto w-full max-w-2xl rounded-[32px] border border-border/70 bg-[radial-gradient(circle_at_top,_rgba(17,17,17,0.08),_transparent_58%)] px-5 py-6 shadow-[0_24px_80px_rgba(15,15,15,0.08)] sm:px-7">
          <div className="flex flex-col items-center text-center">
            <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Start here
            </span>

            <button
              type="button"
              onClick={(event) => onInsert(event.currentTarget.getBoundingClientRect())}
              className="group mt-5 inline-flex w-full max-w-md items-center justify-center gap-3 rounded-[22px] bg-[#111111] px-5 py-4 text-left text-white shadow-[0_20px_40px_rgba(17,17,17,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#111111]/96"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                <Plus className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold tracking-tight">{label}</span>
                <span className="mt-1 block text-xs text-white/70">
                  Open the block menu and start shaping the form.
                </span>
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
                /
              </span>
            </button>

            {description && (
              <p className="mt-4 max-w-xl text-center text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center py-3')}>
      <button
        type="button"
        onClick={(event) => onInsert(event.currentTarget.getBoundingClientRect())}
        className="group flex w-full items-center gap-3 text-left"
      >
        <span className="h-px flex-1 bg-border/60 transition-colors duration-200 group-hover:bg-foreground/20" />
        <span
          className={cn(
            'inline-flex items-center gap-2 rounded-full border border-border/70 bg-background text-muted-foreground shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:text-foreground',
            prominent ? 'px-4 py-3 text-sm font-medium' : 'px-3 py-2 text-xs font-medium',
          )}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border/70 bg-muted/[0.18]">
            <Plus className="h-3.5 w-3.5" />
          </span>
          <span>{label}</span>
          <span className="rounded-full border border-border/70 bg-muted/[0.18] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            /
          </span>
        </span>
        <span className="h-px flex-1 bg-border/60 transition-colors duration-200 group-hover:bg-foreground/20" />
      </button>

      {description && (
        <p className="mt-3 max-w-md text-center text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
};
