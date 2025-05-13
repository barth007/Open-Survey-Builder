
import React, { useState } from 'react';
import { Survey } from '@/types/survey';
import SurveyTitle from '@/components/SurveyTitle';
import AddQuestionButton from '@/components/AddQuestionButton';
import QuestionsList from './QuestionsList';
import PreviewTab from './PreviewTab';
import { WelcomePage } from './WelcomePage';
import { ThankYouPage } from './ThankYouPage';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ChevronLeft, ChevronRight, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  // Toggle left panel visibility
  const toggleLeftPanel = () => {
    setLeftPanelCollapsed(!leftPanelCollapsed);
  };

  // Toggle right panel visibility
  const toggleRightPanel = () => {
    setRightPanelCollapsed(!rightPanelCollapsed);
  };

  // If both panels are collapsed, show controls to expand them
  if (leftPanelCollapsed && rightPanelCollapsed) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex gap-4">
          <Button onClick={toggleLeftPanel} variant="outline" className="flex gap-2">
            <ChevronRight size={18} />
            Show Editor
          </Button>
          <Button onClick={toggleRightPanel} variant="outline" className="flex gap-2">
            Show Preview
            <ChevronLeft size={18} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="min-h-[calc(100vh-200px)]">
      {leftPanelCollapsed ? (
        <div className="w-12 border-r border-gray-200 flex items-center justify-center">
          <Button 
            variant="ghost" 
            onClick={toggleLeftPanel} 
            className="p-2 h-auto"
            title="Show editor panel"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </div>
      ) : (
        <>
          <ResizablePanel defaultSize={60} minSize={30}>
            <div className="flex justify-end px-4 py-2 border-b">
              <Button 
                variant="ghost" 
                onClick={toggleLeftPanel} 
                className="p-1 h-8 w-8"
                title="Hide editor panel"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="h-[calc(100vh-260px)]">
              <div className="space-y-6 px-4">
                <SurveyTitle
                  title={survey.title}
                  description={survey.description}
                  onTitleChange={onTitleChange}
                  onDescriptionChange={onDescriptionChange}
                />

                {/* Welcome Page Settings */}
                <Card>
                  <CardHeader className="pb-2">
                    <h3 className="text-lg font-medium">Welcome Page</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="welcomeTitle">Welcome Title</Label>
                        <Input 
                          id="welcomeTitle"
                          placeholder="Welcome to our survey"
                          value={survey.welcomeTitle || ''}
                          onChange={(e) => onWelcomeTitleChange(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="welcomeMessage">Welcome Message</Label>
                        <Textarea 
                          id="welcomeMessage"
                          placeholder="Thank you for taking the time to participate in our survey..."
                          value={survey.welcomeMessage || ''}
                          onChange={(e) => onWelcomeMessageChange(e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="welcomeInstructions">Instructions</Label>
                        <Input 
                          id="welcomeInstructions"
                          placeholder="Click the button below to begin the survey."
                          value={survey.welcomeInstructions || ''}
                          onChange={(e) => onWelcomeInstructionsChange(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="welcomeButtonText">Button Text</Label>
                        <Input 
                          id="welcomeButtonText"
                          placeholder="Start Survey"
                          value={survey.welcomeButtonText || ''}
                          onChange={(e) => onWelcomeButtonTextChange(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Survey Questions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Survey Questions</h3>
                  <QuestionsList 
                    questions={survey.questions}
                    onQuestionChange={onQuestionChange}
                    onDeleteQuestion={onDeleteQuestion}
                    onDuplicateQuestion={onDuplicateQuestion}
                  />

                  <AddQuestionButton onClick={onAddQuestion} />
                </div>

                {/* Thank You Page Settings */}
                <Card>
                  <CardHeader className="pb-2">
                    <h3 className="text-lg font-medium">Thank You Page</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="thankYouTitle">Thank You Title</Label>
                        <Input 
                          id="thankYouTitle"
                          placeholder="Thank you for your responses"
                          value={survey.thankYouTitle || ''}
                          onChange={(e) => onThankYouTitleChange(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="thankYouMessage">Thank You Message</Label>
                        <Textarea 
                          id="thankYouMessage"
                          placeholder="Your feedback has been submitted successfully."
                          value={survey.thankYouMessage || ''}
                          onChange={(e) => onThankYouMessageChange(e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="thankYouButtonText">Button Text</Label>
                        <Input 
                          id="thankYouButtonText"
                          placeholder="Close"
                          value={survey.thankYouButtonText || ''}
                          onChange={(e) => onThankYouButtonTextChange(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="redirectUrl">Redirect URL (Optional)</Label>
                        <Input 
                          id="redirectUrl"
                          placeholder="https://example.com/thank-you"
                          value={survey.redirectUrl || ''}
                          onChange={(e) => onRedirectUrlChange(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </ResizablePanel>

          <ResizableHandle withHandle />
        </>
      )}
      
      {rightPanelCollapsed ? (
        <div className="w-12 border-l border-gray-200 flex items-center justify-center">
          <Button 
            variant="ghost" 
            onClick={toggleRightPanel} 
            className="p-2 h-auto"
            title="Show preview panel"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
        </div>
      ) : (
        <>
          <ResizablePanel defaultSize={40} minSize={30}>
            <div className="flex justify-start px-4 py-2 border-b">
              <Button 
                variant="ghost" 
                onClick={toggleRightPanel} 
                className="p-1 h-8 w-8"
                title="Hide preview panel"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="h-[calc(100vh-260px)]">
              <div className="space-y-6 px-4">
                <h2 className="text-lg font-medium mt-4">Live Preview</h2>
                
                <WelcomePage 
                  title={survey.welcomeTitle} 
                  message={survey.welcomeMessage}
                  instructions={survey.welcomeInstructions}
                  buttonText={survey.welcomeButtonText}
                  onStart={() => {}}
                />
                
                <PreviewTab survey={survey} />
                
                <ThankYouPage 
                  title={survey.thankYouTitle} 
                  message={survey.thankYouMessage}
                  buttonText={survey.thankYouButtonText}
                  redirectUrl={survey.redirectUrl}
                />
              </div>
            </ScrollArea>
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
};

export default EditTab;
