
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
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-md shadow-sm">
        <WelcomePage 
          title={survey.welcomeTitle} 
          message={survey.welcomeMessage}
          instructions={survey.welcomeInstructions}
          buttonText={survey.welcomeButtonText}
          onStart={() => {}}
        />
      </div>
      
      <div className="bg-white p-4 rounded-md shadow-sm">
        <PreviewTab survey={survey} />
      </div>
      
      <div className="bg-white p-4 rounded-md shadow-sm">
        <ThankYouPage 
          title={survey.thankYouTitle} 
          message={survey.thankYouMessage}
          buttonText={survey.thankYouButtonText}
          redirectUrl={survey.redirectUrl}
        />
      </div>
    </div>
  );
};
