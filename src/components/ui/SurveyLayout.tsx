
import React from 'react';
import { SurveyNavigationHeader } from '@/components/survey/SurveyNavigationHeader';
import SurveyTabs from '@/components/survey/SurveyTabs';
import { useActiveUsers } from '@/hooks/useActiveUsers';
import { useParams } from 'react-router-dom';
import { Survey } from '@/types/survey';

interface SurveyLayoutProps {
  children: React.ReactNode;
  activeTab: "edit" | "answers";
  setActiveTab: (tab: "edit" | "answers") => void;
  isSaving?: boolean;
  lastSaved?: Date | null;
  survey?: Survey;
}

const SurveyLayout = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  isSaving, 
  lastSaved,
  survey 
}: SurveyLayoutProps) => {
  const { id: surveyId } = useParams();
  const { activeUsers } = useActiveUsers(surveyId);

  return (
    <div className="min-h-screen bg-background">
      <SurveyNavigationHeader 
        activeUsers={activeUsers} 
        isSaving={isSaving}
        lastSaved={lastSaved}
        survey={survey}
      />
      
      <div className="pt-14 h-screen">
        <div className="h-full flex flex-col">
          <SurveyTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyLayout;
