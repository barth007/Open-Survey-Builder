
import React from 'react';
import { Survey } from '@/types/survey';
import PreviewTab from '../PreviewTab';
import { WelcomePage } from '../WelcomePage';
import { ThankYouPage } from '../ThankYouPage';

interface PreviewPanelProps {
  survey: Survey;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ survey }) => {
  // Check if the survey has any content to display
  const hasContent = survey && (
    (survey.welcomeTitle || survey.welcomeMessage || survey.welcomeInstructions || survey.welcomeButtonText) ||
    (survey.questions && survey.questions.length > 0) ||
    (survey.thankYouTitle || survey.thankYouMessage || survey.thankYouButtonText || survey.redirectUrl)
  );

  if (!hasContent) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-center">
        <div className="mb-6">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-300">
            <path d="M8 10h8m-8 4h4m8-7v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h3 className="text-xl font-medium text-gray-700 mb-2">Your survey is empty</h3>
        <p className="text-gray-500 mt-2 max-w-xs">
          Add some questions or content to your survey to see a preview here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Page Preview */}
      {(survey.welcomeTitle || survey.welcomeMessage || survey.welcomeInstructions || survey.welcomeButtonText) && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="mb-3 pb-2 border-b border-gray-100">
            <span className="text-xs font-medium text-gray-500 uppercase">Welcome Page</span>
          </div>
          <WelcomePage 
            title={survey.welcomeTitle} 
            message={survey.welcomeMessage}
            instructions={survey.welcomeInstructions}
            buttonText={survey.welcomeButtonText}
            onStart={() => {}}
          />
        </div>
      )}
      
      {/* Questions Preview */}
      {survey.questions && survey.questions.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="mb-3 pb-2 border-b border-gray-100">
            <span className="text-xs font-medium text-gray-500 uppercase">Survey Questions</span>
          </div>
          <PreviewTab survey={survey} />
        </div>
      )}
      
      {/* Thank You Page Preview */}
      {(survey.thankYouTitle || survey.thankYouMessage || survey.thankYouButtonText || survey.redirectUrl) && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="mb-3 pb-2 border-b border-gray-100">
            <span className="text-xs font-medium text-gray-500 uppercase">Thank You Page</span>
          </div>
          <ThankYouPage 
            title={survey.thankYouTitle} 
            message={survey.thankYouMessage}
            buttonText={survey.thankYouButtonText}
            redirectUrl={survey.redirectUrl}
          />
        </div>
      )}
    </div>
  );
};
