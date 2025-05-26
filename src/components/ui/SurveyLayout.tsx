
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
        <div className="h-screen flex flex-col">
            <SurveyNavigationHeader activeUsers={activeUsers} />
            {/* Add top padding to account for the fixed header (h-14 = 56px) */}
            <div className="flex flex-1 overflow-hidden pt-14">
                <SidebarProvider collapsedWidth={60}>
                    <SurveySidebar />
                    <main className="flex-1 overflow-auto">
                        {children}
                    </main>
                </SidebarProvider>
            </div>
        </div>
    );
};

export default SurveyLayout;
