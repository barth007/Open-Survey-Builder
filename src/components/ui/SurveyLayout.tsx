
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
        <div className="h-screen flex flex-col pt-14">
            <SurveyNavigationHeader activeUsers={activeUsers} />
            <div className="sticky top-14 z-40">
                <SurveyTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />
            </div>
            <div className="flex flex-1 overflow-hidden">
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
