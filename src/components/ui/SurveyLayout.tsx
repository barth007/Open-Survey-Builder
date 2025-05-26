
import React, { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { SurveySidebar } from '@/components/survey/SurveySidebar';
import { SurveyNavigationHeader } from '@/components/survey/SurveyNavigationHeader';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useActiveUsers } from '@/hooks/useActiveUsers';
import SurveyTabs from '@/components/survey/SurveyTabs';

interface SurveyLayoutProps {
  children: ReactNode;
  activeTab: "edit" | "answers";
  setActiveTab: (tab: "edit" | "answers") => void;
}

const SurveyLayout = ({ children, activeTab, setActiveTab }: SurveyLayoutProps) => {
  const { id: surveyId } = useParams();
  const { activeUsers } = useActiveUsers(surveyId || '');

  return (
    <SidebarProvider collapsedWidth={60}>
      <div className="h-screen flex flex-col">
        {/* Fixed header spanning full width */}
        <SurveyNavigationHeader activeUsers={activeUsers} />

        {/* Main layout with sidebar and content */}
        <div className="flex flex-1 overflow-hidden pt-14">
          <SurveySidebar />
          
          {/* Main content area with sticky tabs */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {/* Sticky tabs - only in content area, not over sidebar */}
            <div className="sticky top-0 z-40 bg-white border-b flex-shrink-0">
              <SurveyTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
            
            {/* Scrollable content area */}
            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SurveyLayout;
