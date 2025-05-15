
import React from 'react';
import { Survey } from '@/types/survey';
import PreviewTab from '../PreviewTab';
import { WelcomePage } from '../WelcomePage';
import { ThankYouPage } from '../ThankYouPage';

interface PreviewPanelProps {
  survey: Survey;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ survey }) => {
  return (
    <div className="space-y-4">
      
      <WelcomePage 
        title={survey.welcomeTitle} 
        message={survey.welcomeMessage}
        instructions={survey.welcomeInstructions}
        buttonText={survey.welcomeButtonText}
        onStart={() => {}}
      />
      
      <PreviewTab survey={survey} />
      
      <ThankYouPage 
        title={survey.thankYouTitle} 
        message={survey.thankYouMessage}
        buttonText={survey.thankYouButtonText}
        redirectUrl={survey.redirectUrl}
      />
    </div>
  );
};
