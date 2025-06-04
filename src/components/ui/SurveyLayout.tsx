
import React from 'react';
import { SurveyNavigationHeader } from '@/components/survey/SurveyNavigationHeader';
import SurveyTabs from '@/components/survey/SurveyTabs';
import { Survey } from '@/types/survey';
import { ActiveUser } from '@/types/survey-organization';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface SurveyLayoutProps {
  children: React.ReactNode;
  activeTab: "edit" | "answers";
  setActiveTab: (tab: "edit" | "answers") => void;
  isSaving?: boolean;
  lastSaved?: Date | null;
  survey?: Survey;
  onPublishToggle?: () => void;
  isTyping?: boolean;
  onManualSave?: () => void;
}

const SurveyLayout: React.FC<SurveyLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  isSaving = false,
  lastSaved = null,
  survey,
  onPublishToggle,
  isTyping = false,
  onManualSave
}) => {
  const getStatusText = () => {
    if (isTyping) return "Typing...";
    if (isSaving) return "Saving...";
    return null;
  };

  const shouldShowSaveButton = () => {
    return isTyping || onManualSave;
  };

  return (
    <div className="flex flex-col h-screen pt-14 overflow-hidden">
      <SurveyNavigationHeader
        activeUsers={[]}
        isSaving={isSaving}
        lastSaved={lastSaved}
        survey={survey}
        onPublishToggle={onPublishToggle}
        statusText={getStatusText()}
      />
      
      <div className="flex items-center justify-between px-4 py-2 border-b bg-white">
        <SurveyTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {shouldShowSaveButton() && onManualSave && (
          <Button
            variant="outline"
            size="sm"
            onClick={onManualSave}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save now"}
          </Button>
        )}
      </div>
      
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default SurveyLayout;
