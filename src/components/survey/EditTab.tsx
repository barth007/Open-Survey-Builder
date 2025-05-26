import React from 'react';
import { Survey } from '@/types/survey';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { HomeIcon } from 'lucide-react';
import { EditorPanel } from './edit/EditorPanel';

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
  return (
    <div className="bg-red-100 border border-red-500 w-full">
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
    </div>
  );
};

export default EditTab;
