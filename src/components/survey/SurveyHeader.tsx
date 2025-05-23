
import React from 'react';
import { Survey } from '@/types/survey';
import { ShareSurveyButton } from './ShareSurveyButton';
import UserProfile from '@/components/UserProfile';
import { ActiveUser } from '@/types/survey-organization';

interface SurveyHeaderProps {
  survey: Survey;
  pendingChanges: boolean;
  activeUsers: ActiveUser[];
  onPublishToggle: () => void;
}

const SurveyHeader: React.FC<SurveyHeaderProps> = ({
  survey,
  pendingChanges,
  activeUsers,
  onPublishToggle
}) => {
  return (
    <header className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-abyss">{survey.title}</h1>
      <div className="flex items-center gap-2">
        {pendingChanges && (
          <span className="text-sm text-gray-500 italic mr-2">Saving...</span>
        )}

        {/* Avatars now shown in SurveyNavigationHeader */}

        <ShareSurveyButton survey={survey} onPublishToggle={onPublishToggle} />
      </div>
    </header>
  );
};

export default SurveyHeader;
