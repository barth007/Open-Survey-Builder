
import React from 'react';
import { Survey, Question } from '@/types/survey';
import SurveyTitle from '@/components/SurveyTitle';
import { WelcomePageSettings } from './WelcomePage';
import { QuestionSection } from './QuestionSection';
import { ThankYouPageSettings } from './ThankYouPageSettings';

interface EditorPanelProps {
  survey: Survey;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onQuestionChange: (question: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onDuplicateQuestion: (question: Question) => void;
  onAddQuestion: () => void;
  onWelcomeTitleChange: (value: string) => void;
  onWelcomeMessageChange: (value: string) => void;
  onWelcomeInstructionsChange: (value: string) => void;
  onWelcomeButtonTextChange: (value: string) => void;
  onThankYouTitleChange: (value: string) => void;
  onThankYouMessageChange: (value: string) => void;
  onThankYouButtonTextChange: (value: string) => void;
  onRedirectUrlChange: (value: string) => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  survey,
  onTitleChange,
  onDescriptionChange,
  onQuestionChange,
  onDeleteQuestion,
  onDuplicateQuestion,
  onAddQuestion,
  onWelcomeTitleChange,
  onWelcomeMessageChange,
  onWelcomeInstructionsChange,
  onWelcomeButtonTextChange,
  onThankYouTitleChange,
  onThankYouMessageChange,
  onThankYouButtonTextChange,
  onRedirectUrlChange
}) => {
  return (
    <div className="space-y-6">
      <SurveyTitle
        title={survey.title}
        description={survey.description}
        onTitleChange={onTitleChange}
        onDescriptionChange={onDescriptionChange}
      />

      {/* Welcome Page Settings */}
      <WelcomePageSettings
        welcomeTitle={survey.welcomeTitle || ''}
        welcomeMessage={survey.welcomeMessage || ''}
        welcomeInstructions={survey.welcomeInstructions || ''}
        welcomeButtonText={survey.welcomeButtonText || ''}
        onWelcomeTitleChange={onWelcomeTitleChange}
        onWelcomeMessageChange={onWelcomeMessageChange}
        onWelcomeInstructionsChange={onWelcomeInstructionsChange}
        onWelcomeButtonTextChange={onWelcomeButtonTextChange}
      />

      {/* Survey Questions */}
      <QuestionSection
        questions={survey.questions}
        onQuestionChange={onQuestionChange}
        onDeleteQuestion={onDeleteQuestion}
        onDuplicateQuestion={onDuplicateQuestion}
        onAddQuestion={onAddQuestion}
      />

      {/* Thank You Page Settings */}
      <ThankYouPageSettings
        thankYouTitle={survey.thankYouTitle || ''}
        thankYouMessage={survey.thankYouMessage || ''}
        thankYouButtonText={survey.thankYouButtonText || ''}
        redirectUrl={survey.redirectUrl || ''}
        onThankYouTitleChange={onThankYouTitleChange}
        onThankYouMessageChange={onThankYouMessageChange}
        onThankYouButtonTextChange={onThankYouButtonTextChange}
        onRedirectUrlChange={onRedirectUrlChange}
      />
    </div>
  );
};
