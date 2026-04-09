
import React from 'react';
import { PenLine, Palette, Settings, BarChart2, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type TabType = 'edit' | 'design' | 'settings' | 'answers' | 'recordings';

interface SurveyLayoutProps {
  children: React.ReactNode;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const tabs: Array<{ id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'edit', label: 'Edit', icon: PenLine },
  { id: 'design', label: 'Design', icon: Palette },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'answers', label: 'Answers', icon: BarChart2 },
  { id: 'recordings', label: 'Recordings', icon: Video },
];

const SurveyLayout = ({ children, activeTab, setActiveTab }: SurveyLayoutProps) => {
  return (
    <div className="flex flex-col h-full pt-14">
      <div className="flex items-center justify-center gap-2 px-6 py-3 border-b border-border/60 bg-muted/[0.07]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'h-9 rounded-full border border-border/70 px-4 text-sm font-medium shadow-none',
                activeTab === tab.id
                  ? 'bg-[#111111] text-white hover:bg-[#111111]/95 hover:text-white'
                  : 'bg-muted/[0.18] text-muted-foreground hover:bg-background hover:text-foreground',
              )}
            >
              <Icon className="mr-2 h-4 w-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default SurveyLayout;
