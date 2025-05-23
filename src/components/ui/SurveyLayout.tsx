import React, { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { SurveySidebar } from '@/components/survey/SurveySidebar';
import { SurveyNavigationHeader } from '@/components/survey/SurveyNavigationHeader';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useActiveUsers } from '@/hooks/useActiveUsers';

interface SurveyLayoutProps {
  children: ReactNode;
}

const SurveyLayout = ({ children }: SurveyLayoutProps) => {
  const { id: surveyId } = useParams();
  const { activeUsers } = useActiveUsers(surveyId || '');

  return (
    <div className="flex h-screen w-full bg-background">
      <SidebarProvider collapsedWidth={60}>
        <SurveySidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <SurveyNavigationHeader activeUsers={activeUsers} />
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default SurveyLayout;
