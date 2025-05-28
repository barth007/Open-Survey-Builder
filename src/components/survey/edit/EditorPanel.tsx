
import React from 'react';
import { Survey, Question } from '@/types/survey';
import SurveyTitle from '@/components/SurveyTitle';
import { WelcomePageSettings } from './WelcomePage';
import { WelcomeCard } from './WelcomeCard';
import { QuestionSection } from './QuestionSection';
import { ThankYouPageSettings } from './ThankYouPageSettings';
import { ThankYouCard } from './ThankYouCard';

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
  const updateSurvey = (updatedFields: Partial<Survey>) => {
    // Implement the logic to update the survey object here
    console.log("Updating survey with fields:", updatedFields);
  };

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto space-y-4 px-6 py-4">
  <div className="p-4">
    <SurveyTitle
        title={survey.title}
        description={survey.description}
        onTitleChange={onTitleChange}
        onDescriptionChange={onDescriptionChange}
      />
    <WelcomeCard
      welcomeTitle={survey.welcomeTitle || ""}
      welcomeMessage={survey.welcomeMessage || ""}
      welcomeInstructions={survey.welcomeInstructions || ""}
      welcomeButtonText={survey.welcomeButtonText || ""}
      onWelcomeTitleChange={(v) => updateSurvey({ welcomeTitle: v })}
      onWelcomeMessageChange={(v) => updateSurvey({ welcomeMessage: v })}
      onWelcomeInstructionsChange={(v) => updateSurvey({ welcomeInstructions: v })}
      onWelcomeButtonTextChange={(v) => updateSurvey({ welcomeButtonText: v })}
    />
  </div>

  <QuestionSection
    questions={survey.questions}
    onQuestionChange={onQuestionChange}
    onDeleteQuestion={onDeleteQuestion}
    onDuplicateQuestion={onDuplicateQuestion}
    onAddQuestion={onAddQuestion}
  />

  <div className="p-4">
    <ThankYouCard
      thankYouTitle={survey.thankYouTitle || ""}
      thankYouMessage={survey.thankYouMessage || ""}
      thankYouButtonText={survey.thankYouButtonText || ""}
      redirectUrl={survey.redirectUrl || ""}
      onThankYouTitleChange={(v) => updateSurvey({ thankYouTitle: v })}
      onThankYouMessageChange={(v) => updateSurvey({ thankYouMessage: v })}
      onThankYouButtonTextChange={(v) => updateSurvey({ thankYouButtonText: v })}
      onRedirectUrlChange={(v) => updateSurvey({ redirectUrl: v })}
    />
  </div>
</div>

  );
};
