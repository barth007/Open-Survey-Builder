import React from 'react';
import { ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';

interface AnalysisPanelHeaderProps {
  onToggleVisibility?: () => void;
}

export const AnalysisPanelHeader: React.FC<AnalysisPanelHeaderProps> = ({
  onToggleVisibility,
}) => {
  return (
    <CardHeader className="border-b border-border/60 px-5 py-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Insights Rail
          </p>
          <CardTitle className="mt-1 text-base font-semibold tracking-tight text-foreground">
            Question analysis
          </CardTitle>
        </div>

        {onToggleVisibility && (
          <Button
            variant="ghost"
            onClick={onToggleVisibility}
            className="h-9 w-9 rounded-full border border-border/70 bg-muted/[0.18] p-0 text-muted-foreground hover:bg-background hover:text-foreground"
            title="Hide insights"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </CardHeader>
  );
};
