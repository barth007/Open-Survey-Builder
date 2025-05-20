
import React from 'react';
import { Survey } from '@/types/survey';
import { SplitPanelLayout } from '@/components/ui/split-panel-layout';
import { EditorPanel } from './edit/EditorPanel';
import { PreviewPanel } from './edit/PreviewPanel';

interface EditTabProps {
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

const EditTab: React.FC<EditTabProps> = ({
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
  // Editor panel content
  const editorPanel = (
    <EditorPanel 
      survey={survey}
      onTitleChange={onTitleChange}
      onDescriptionChange={onDescriptionChange}
      onQuestionChange={onQuestionChange}
      onDeleteQuestion={onDeleteQuestion}
      onDuplicateQuestion={onDuplicateQuestion}
      onAddQuestion={onAddQuestion}
      onWelcomeTitleChange={onWelcomeTitleChange}
      onWelcomeMessageChange={onWelcomeMessageChange}
      onWelcomeInstructionsChange={onWelcomeInstructionsChange}
      onWelcomeButtonTextChange={onWelcomeButtonTextChange}
      onThankYouTitleChange={onThankYouTitleChange}
      onThankYouMessageChange={onThankYouMessageChange}
      onThankYouButtonTextChange={onThankYouButtonTextChange}
      onRedirectUrlChange={onRedirectUrlChange}
    />
  );

  // Preview panel content
  const previewPanel = (
    <PreviewPanel survey={survey} />
  );

  return (
    <SplitPanelLayout
      leftPanel={editorPanel}
      rightPanel={previewPanel}
      leftPanelTitle="Editor"
      rightPanelTitle="Preview"
      defaultLayout={[50, 50]}
      minSizes={["512px", "512px"]}
    />
  );
};

export default EditTab;
