
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { SurveyResponse } from '@/types/survey';

interface SummaryCardProps {
  responses: SurveyResponse[] | undefined;
  onExportCSV: () => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ responses, onExportCSV }) => {
  const totalResponses = responses?.length || 0;
  const lastResponseDate = responses && responses.length > 0 
    ? new Date(responses[responses.length - 1].submittedAt).toLocaleString() 
    : 'No responses yet';

  return (
    <div className="rounded-[28px] border border-border/70 bg-background px-6 py-5 shadow-[0_8px_30px_rgba(15,15,15,0.05)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Response Summary</p>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{totalResponses}</span> total &mdash; last received {lastResponseDate}
          </p>
        </div>
        <Button
          onClick={onExportCSV}
          variant="outline"
          size="sm"
          className="shrink-0 gap-2 rounded-full border-border/70"
          disabled={!responses || responses.length === 0}
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>
    </div>
  );
};
