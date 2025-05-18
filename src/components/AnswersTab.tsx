
import React from 'react';
import { Survey } from '@/types/survey';
import { AnswersTabContent } from '@/components/survey/analysis/AnswersTabContent';

interface AnswersTabProps {
  survey: Survey;
}

const AnswersTab: React.FC<AnswersTabProps> = ({ survey }) => {
  return (
    <div className="w-full">
      <AnswersTabContent survey={survey} />
    </div>
  );
};

export default AnswersTab;
