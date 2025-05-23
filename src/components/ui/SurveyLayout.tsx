
import React, { ReactNode } from 'react';
import { SurveySidebar } from '@/components/survey/SurveySidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

interface SurveyLayoutProps {
  children: ReactNode;
}

const SurveyLayout = ({ children }: SurveyLayoutProps) => {
  return (
    <div className="flex h-screen bg-background">
      <SidebarProvider collapsedWidth={60}>
        <SurveySidebar />
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </SidebarProvider>
    </div>
  );
};

export default SurveyLayout;
