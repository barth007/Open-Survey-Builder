import React from 'react';
import { Sparkles } from 'lucide-react';

export const EmptyAnalysisState: React.FC = () => {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[28px] border border-dashed border-border/70 bg-muted/[0.14] px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-3xl border border-border/70 bg-background">
        <Sparkles className="h-5 w-5 text-muted-foreground/70" />
      </div>
      <h3 className="mt-6 text-xl font-semibold tracking-tight text-foreground">
        Select a question summary
      </h3>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
        Click any question card to inspect tags, statistics, qualitative notes, or recordings in this insights rail.
      </p>
    </div>
  );
};
