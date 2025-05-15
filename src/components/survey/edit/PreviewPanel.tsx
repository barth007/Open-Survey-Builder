
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
      <h2 className="text-lg font-medium mb-2">Live Preview</h2>
      
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
