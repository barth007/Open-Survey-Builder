import React from 'react';
import { Activity, ArrowDownRight, MousePointerClick, PlayCircle } from 'lucide-react';

interface FormInsightsData {
  overview: {
    views: number;
    starts: number;
    submissions: number;
    conversionRate: number;
  };
  questionDropOff: Array<{
    questionId: string;
    questionLabel: string;
    reachedCount: number;
    dropOffCount: number;
  }>;
}

interface FormInsightsPanelProps {
  insights?: FormInsightsData | null;
}

export const FormInsightsPanel: React.FC<FormInsightsPanelProps> = ({
  insights,
}) => {
  const metrics = [
    {
      label: 'Views',
      value: insights?.overview.views ?? 0,
      icon: MousePointerClick,
    },
    {
      label: 'Starts',
      value: insights?.overview.starts ?? 0,
      icon: PlayCircle,
    },
    {
      label: 'Submissions',
      value: insights?.overview.submissions ?? 0,
      icon: Activity,
    },
    {
      label: 'Conversion',
      value: `${insights?.overview.conversionRate ?? 0}%`,
      icon: ArrowDownRight,
    },
  ];

  return (
    <section className="space-y-5 rounded-[32px] border border-border/70 bg-background px-5 py-5 shadow-[0_14px_36px_rgba(15,15,15,0.04)]">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Form Insights
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Visits, starts, conversion, and last-question drop-off.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div key={metric.label} className="rounded-[24px] border border-border/70 bg-muted/[0.08] px-4 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground">{metric.label}</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{metric.value}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-background">
                  <Icon className="h-4 w-4 text-foreground/70" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Question Drop-Off
        </p>

        {(insights?.questionDropOff.length ?? 0) === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 px-4 py-5 text-sm text-muted-foreground">
            No respondent journey data yet.
          </div>
        ) : (
          insights?.questionDropOff.map((row) => (
            <div key={row.questionId} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/70 bg-muted/[0.08] px-4 py-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{row.questionLabel}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Reached by {row.reachedCount} respondent{row.reachedCount === 1 ? '' : 's'}
                </p>
              </div>
              <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                {row.dropOffCount} drop-off{row.dropOffCount === 1 ? '' : 's'}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
