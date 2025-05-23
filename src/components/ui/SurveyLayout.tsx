import React, { ReactNode } from 'react';
import { SurveySidebar } from '@/components/survey/SurveySidebar';
import { SurveyNavigationHeader } from '@/components/survey/SurveyNavigationHeader';
import { SidebarProvider } from '@/components/ui/sidebar';

interface SurveyLayoutProps {
  children: ReactNode;
}

const SurveyLayout = ({ children }: SurveyLayoutProps) => {
  return (
    <div className="flex h-screen w-full bg-background">
      <SidebarProvider collapsedWidth={60}>
        {/* Sidebar with embedded user profile */}
        <SurveySidebar />

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <SurveyNavigationHeader />
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default SurveyLayout;
