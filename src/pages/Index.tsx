import React, { useState, useEffect } from 'react';
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import EditTab from '@/components/survey/EditTab';
import PreviewTab from '@/components/survey/PreviewTab';
import AnswersTab from '@/components/AnswersTab';
import { useSurveyState } from '@/hooks/useSurveyState';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import UserProfile from '@/components/UserProfile';
import { useActiveUsers } from '@/hooks/useActiveUsers';

const Index = () => {
  const [activeTab, setActiveTab] = useState<"edit" | "preview" | "answers">("edit");
  const { id: surveyId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { activeUsers } = useActiveUsers(surveyId);
  
  const {
    survey,
    handleTitleChange,
    handleDescriptionChange,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
    togglePublish,
    handleSave,
    isLoading,
    error
  } = useSurveyState(surveyId);

  const [pendingChanges, setPendingChanges] = useState(false);

  useEffect(() => {
    if (survey.title) {
      document.title = survey.title;
    }
  }, [survey.title]);

  useEffect(() => {
    let saveTimer: ReturnType<typeof setTimeout>;
    
    if (pendingChanges) {
      saveTimer = setTimeout(() => {
        handleSave();
        setPendingChanges(false);
      }, 2000); // Save after 2 seconds of inactivity
    }
    
    return () => {
      if (saveTimer) clearTimeout(saveTimer);
    };
  }, [pendingChanges, handleSave]);

  const handleSurveyTitleChange = (title: string) => {
    handleTitleChange(title);
    setPendingChanges(true);
    if (surveyId) {
      queryClient.setQueriesData({ queryKey: ['survey', surveyId] }, (oldData: any) => {
        if (!oldData) return oldData;
        return { ...oldData, title, name: title };
      });
    }
  };

  const handleCopyLink = () => {
    if (!surveyId) return;
    
    const baseUrl = window.location.origin;
    const surveyUrl = `${baseUrl}/survey-response/${surveyId}`;
    
    navigator.clipboard.writeText(surveyUrl);
    
    toast({
      title: survey.isPublished 
        ? "Survey Link Copied" 
        : "Preview Link Copied",
      description: survey.isPublished
        ? "You have copied the Survey link"
        : "You have copied the Preview link"
    });
  };

  const handleQuestionChange = (updatedQuestion: any) => {
    updateQuestion(updatedQuestion);
    setPendingChanges(true);
  };

  const handleDescriptionChangeWithTracking = (description: string) => {
    handleDescriptionChange(description);
    setPendingChanges(true);
  };

  const handleAddQuestion = () => {
    addQuestion();
    setPendingChanges(true);
  };

  const handleDeleteQuestion = (questionId: string) => {
    deleteQuestion(questionId);
    setPendingChanges(true);
  };

  const handleDuplicateQuestion = (question: any) => {
    duplicateQuestion(question);
    setPendingChanges(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-pebble flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-abyss"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-pebble flex items-center justify-center">
        <div className="text-center p-8 max-w-md text-magma">
          <h2 className="text-2xl font-semibold mb-4">Error Loading Survey</h2>
          <p>{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
        </div>
      </div>
    );
  }

  if (!surveyId) {
    return (
      <div className="min-h-screen bg-pebble flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Welcome to Survey Builder</h2>
          <p className="text-gray-600">Select a survey or create a new one to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pebble py-8">
      <div className="container max-w-3xl">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-abyss">{survey.title}</h1>
          <div className="flex items-center gap-2">
            {pendingChanges && (
              <span className="text-sm text-gray-500 italic mr-2">Saving...</span>
            )}
            
            <div className="flex -space-x-2 mr-2">
              {activeUsers.map(user => (
                <UserProfile key={user.id} compact />
              ))}
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex">
                    <Button 
                      onClick={togglePublish} 
                      className={`
                        ${survey.isPublished 
                          ? "border-transparent bg-green-500 bg-opacity-10 text-green-700 hover:bg-green-500 hover:bg-opacity-20" 
                          : "border-transparent bg-orange-500 bg-opacity-10 text-orange-700 hover:bg-orange-500 hover:bg-opacity-20"}
                        rounded-r-none border-r
                      `}
                    >
                      {survey.isPublished ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      className="bg-transparent text-gray-500 hover:bg-gray-100 rounded-l-none pl-2"
                      onClick={handleCopyLink}
                    >
                      <Link2 size={18} />
                    </Button>
                  </div>
                </TooltipTrigger>
                {!survey.isPublished && (
                  <TooltipContent>
                    <p>Preview the survey</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "edit" | "preview" | "answers")} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-ice">
            <TabsTrigger value="edit" className="data-[state=active]:bg-abyss data-[state=active]:text-white">Edit</TabsTrigger>
            <TabsTrigger value="preview" className="data-[state=active]:bg-abyss data-[state=active]:text-white">Preview</TabsTrigger>
            <TabsTrigger value="answers" className="data-[state=active]:bg-abyss data-[state=active]:text-white">
              Answers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-4">
            <EditTab
              survey={survey}
              onTitleChange={handleSurveyTitleChange}
              onDescriptionChange={handleDescriptionChangeWithTracking}
              onQuestionChange={handleQuestionChange}
              onDeleteQuestion={handleDeleteQuestion}
              onDuplicateQuestion={handleDuplicateQuestion}
              onAddQuestion={handleAddQuestion}
            />
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <PreviewTab survey={survey} />
          </TabsContent>

          <TabsContent value="answers" className="space-y-4">
            <AnswersTab survey={survey} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
