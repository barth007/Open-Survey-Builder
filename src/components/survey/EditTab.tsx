
import React from 'react';
import { Survey } from '@/types/survey';
import { SplitPanelLayout } from '@/components/ui/split-panel-layout';
import { EditorPanel } from './edit/EditorPanel';
import { PreviewPanel } from './edit/PreviewPanel';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { HomeIcon } from 'lucide-react';

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
    <div className="space-y-1">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard" className="text-sm flex items-center">
              <HomeIcon className="h-3.5 w-3.5 mr-1" />
              <span>Dashboard</span>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#" className="text-sm">Surveys</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span className="text-sm font-medium">{survey.title || "Untitled Survey"}</span>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
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

  // Preview panel content
  const previewPanel = (
    <PreviewPanel survey={survey} />
  );

  return (
    <div className="h-[calc(100vh-6.5rem)]">
      <SplitPanelLayout
        leftPanel={editorPanel}
        rightPanel={previewPanel}
        leftPanelTitle="Editor"
        rightPanelTitle="Preview"
        defaultLayout={[50, 50]}
        minSizes={["30%", "30%"]}
      />
    </div>
  );
};

export default EditTab;
