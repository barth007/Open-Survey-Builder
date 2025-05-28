import React from "react";
import { Survey } from "@/types/survey";
import { WelcomeCard } from "./WelcomeCard";
import { ThankYouCard } from "./ThankYouCard";
import { QuestionSection } from "./QuestionSection";

interface Props {
  survey: Survey;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onQuestionChange: (question: any) => void;
  onDeleteQuestion: (id: string) => void;
  onDuplicateQuestion: (question: any) => void;
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

export const EditorPanel: React.FC<Props> = ({
  survey,
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
  onRedirectUrlChange,
}) => {
  return (
    <div className="flex flex-col space-y-6 w-full">
      <WelcomeCard
        welcomeTitle={survey.welcomeTitle || ""}
        welcomeMessage={survey.welcomeMessage || ""}
        welcomeInstructions={survey.welcomeInstructions || ""}
        welcomeButtonText={survey.welcomeButtonText || ""}
        onWelcomeTitleChange={onWelcomeTitleChange}
        onWelcomeMessageChange={onWelcomeMessageChange}
        onWelcomeInstructionsChange={onWelcomeInstructionsChange}
        onWelcomeButtonTextChange={onWelcomeButtonTextChange}
      />

      <QuestionSection
        questions={survey.questions}
        onQuestionChange={onQuestionChange}
        onDeleteQuestion={onDeleteQuestion}
        onDuplicateQuestion={onDuplicateQuestion}
        onAddQuestion={onAddQuestion}
      />

      <ThankYouCard
        thankYouTitle={survey.thankYouTitle || ""}
        thankYouMessage={survey.thankYouMessage || ""}
        thankYouButtonText={survey.thankYouButtonText || ""}
        redirectUrl={survey.redirectUrl || ""}
        onThankYouTitleChange={onThankYouTitleChange}
        onThankYouMessageChange={onThankYouMessageChange}
        onThankYouButtonTextChange={onThankYouButtonTextChange}
        onRedirectUrlChange={onRedirectUrlChange}
      />
    </div>
  );
};
