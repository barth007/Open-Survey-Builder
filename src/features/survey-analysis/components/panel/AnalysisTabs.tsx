import React from 'react';
import { AlertTriangle, FileText, Filter, Scale, Tag, Video } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type TabType = 'tagging' | 'statistics' | 'scale' | 'outliers' | 'summary' | 'recordings';

interface AnalysisTabsProps {
  activeTab: TabType;
  setActiveTab: React.Dispatch<React.SetStateAction<TabType>>;
  isLikert: boolean;
}

const tabs: Array<{
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  likertOnly?: boolean;
}> = [
  { id: 'summary', label: 'Summary', icon: FileText },
  { id: 'tagging', label: 'Tagging', icon: Tag },
  { id: 'statistics', label: 'Statistics', icon: Filter },
  { id: 'scale', label: 'Scale', icon: Scale, likertOnly: true },
  { id: 'outliers', label: 'Outliers', icon: AlertTriangle, likertOnly: true },
  { id: 'recordings', label: 'Recordings', icon: Video },
];

export const AnalysisTabs: React.FC<AnalysisTabsProps> = ({
  activeTab,
  setActiveTab,
  isLikert,
}) => {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="tablist"
      aria-label="Analysis tabs"
    >
      {tabs
        .filter((tab) => !tab.likertOnly || isLikert)
        .map((tab) => {
          const Icon = tab.icon;

          return (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'h-9 rounded-full border border-border/70 px-4 text-sm font-medium text-muted-foreground shadow-none',
                activeTab === tab.id
                  ? 'bg-[#111111] text-white hover:bg-[#111111]/95 hover:text-white'
                  : 'bg-muted/[0.18] hover:bg-background hover:text-foreground',
              )}
              role="tab"
              aria-selected={activeTab === tab.id}
            >
              <Icon className="mr-2 h-4 w-4" />
              {tab.label}
            </Button>
          );
        })}
    </div>
  );
};
