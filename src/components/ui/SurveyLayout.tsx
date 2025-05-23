
import React, { ReactNode } from 'react';
import { SurveySidebar } from '@/components/survey/SurveySidebar';
import { SurveyNavigationHeader } from '@/components/survey/SurveyNavigationHeader';
import { SidebarProvider } from '@/components/ui/sidebar';
import UserProfile from '@/components/UserProfile';

interface SurveyLayoutProps {
  children: ReactNode;
}

const SurveyLayout = ({ children }: SurveyLayoutProps) => {
  return (
    <div className="flex h-screen bg-background w-full">
      <SidebarProvider collapsedWidth={60}>
        <div className="flex min-h-screen w-full">
          <div className="flex flex-col">
            <SurveySidebar />
            <UserProfile />
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
            <SurveyNavigationHeader />
            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default SurveyLayout;
