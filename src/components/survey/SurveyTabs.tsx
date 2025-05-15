
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Survey, Question } from '@/types/survey';
import AnswersTab from '@/components/AnswersTab';
import EditTab from '@/components/survey/EditTab';

interface SurveyTabsProps {
  activeTab: "edit" | "answers";
  setActiveTab: (tab: "edit" | "answers") => void;
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
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
      <div className="flex w-full">
        <TabsList className="grid grid-cols-2 w-full rounded-none">
          <TabsTrigger 
            value="edit" 
            className="data-[state=active]:bg-abyss data-[state=active]:text-white rounded-none data-[state=active]:rounded-t-md"
            style={{ width: '520px' }}
          >
            Edit
          </TabsTrigger>
          <TabsTrigger 
            value="answers" 
            className="data-[state=active]:bg-abyss data-[state=active]:text-white rounded-none data-[state=active]:rounded-t-md"
          >
            Answers
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="edit" className="mt-0">
        <EditTab
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
      </TabsContent>

      <TabsContent value="answers" className="mt-0">
        <AnswersTab survey={survey} />
      </TabsContent>
    </Tabs>
  );
};

export default SurveyTabs;
