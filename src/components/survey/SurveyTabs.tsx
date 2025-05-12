
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EditTab from '@/components/survey/EditTab';
import PreviewTab from '@/components/survey/PreviewTab';
import AnswersTab from '@/components/AnswersTab';
import PagesTab from '@/components/survey/PagesTab';
import { Survey, Question } from '@/types/survey';

interface SurveyTabsProps {
  activeTab: "edit" | "preview" | "answers" | "pages";
  setActiveTab: (tab: "edit" | "preview" | "answers" | "pages") => void;
  survey: Survey;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onQuestionChange: (question: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onDuplicateQuestion: (question: Question) => void;
  onAddQuestion: () => void;
  onWelcomeTitleChange: (title: string) => void;
  onWelcomeMessageChange: (message: string) => void;
  onWelcomeInstructionsChange: (instructions: string) => void;
  onWelcomeButtonTextChange: (text: string) => void;
  onThankYouTitleChange: (title: string) => void;
  onThankYouMessageChange: (message: string) => void;
  onThankYouButtonTextChange: (text: string) => void;
  onRedirectUrlChange: (url: string) => void;
}

const SurveyTabs: React.FC<SurveyTabsProps> = ({
  activeTab,
  setActiveTab,
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
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
      <TabsList className="grid w-full grid-cols-4 bg-ice">
        <TabsTrigger value="edit" className="data-[state=active]:bg-abyss data-[state=active]:text-white">Edit</TabsTrigger>
        <TabsTrigger value="pages" className="data-[state=active]:bg-abyss data-[state=active]:text-white">Pages</TabsTrigger>
        <TabsTrigger value="preview" className="data-[state=active]:bg-abyss data-[state=active]:text-white">Preview</TabsTrigger>
        <TabsTrigger value="answers" className="data-[state=active]:bg-abyss data-[state=active]:text-white">
          Answers
        </TabsTrigger>
      </TabsList>

      <TabsContent value="edit" className="space-y-4">
        <EditTab
          survey={survey}
          onTitleChange={onTitleChange}
          onDescriptionChange={onDescriptionChange}
          onQuestionChange={onQuestionChange}
          onDeleteQuestion={onDeleteQuestion}
          onDuplicateQuestion={onDuplicateQuestion}
          onAddQuestion={onAddQuestion}
        />
      </TabsContent>

      <TabsContent value="pages" className="space-y-4">
        <PagesTab
          survey={survey}
          onWelcomeTitleChange={onWelcomeTitleChange}
          onWelcomeMessageChange={onWelcomeMessageChange}
          onWelcomeInstructionsChange={onWelcomeInstructionsChange}
          onWelcomeButtonTextChange={onWelcomeButtonTextChange}
          onThankYouTitleChange={onThankYouTitleChange}
          onThankYouMessageChange={onThankYouMessageChange}
          onThankYouButtonTextChange={onThankYouButtonTextChange}
          onRedirectUrlChange={onRedirectUrlChange}
        />
      </TabsContent>

      <TabsContent value="preview" className="space-y-4">
        <PreviewTab survey={survey} />
      </TabsContent>

      <TabsContent value="answers" className="space-y-4">
        <AnswersTab survey={survey} />
      </TabsContent>
    </Tabs>
  );
};

export default SurveyTabs;
