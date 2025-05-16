
import React from 'react';
import { Survey } from '@/types/survey';
import { AnswersTabContent } from '@/components/survey/analysis/AnswersTabContent';

interface AnswersTabProps {
  survey: Survey;
}

const AnswersTab: React.FC<AnswersTabProps> = ({ survey }) => {
  return <AnswersTabContent survey={survey} />;
};

export default AnswersTab;
