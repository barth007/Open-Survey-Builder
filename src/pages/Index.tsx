
import React, { useState, useEffect } from 'react';
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EditTab from '@/components/survey/EditTab';
import PreviewTab from '@/components/survey/PreviewTab';
import AnswersTab from '@/components/AnswersTab';
import { useSurveyState } from '@/hooks/useSurveyState';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

const Index = () => {
  const [activeTab, setActiveTab] = useState<"edit" | "preview" | "answers">("edit");
  const { id: surveyId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [hasChanges, setHasChanges] = useState(false);
  
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

  useEffect(() => {
    if (survey.title) {
      document.title = survey.title;
    }
  }, [survey.title]);

  const handleSurveyTitleChange = (title: string) => {
    handleTitleChange(title);
    setHasChanges(true);
    if (surveyId) {
      queryClient.setQueriesData({ queryKey: ['survey', surveyId] }, (oldData: any) => {
        if (!oldData) return oldData;
        return { ...oldData, title, name: title };
      });
    }
  };

  const handleSaveWithReset = async () => {
    await handleSave();
    setHasChanges(false);
  };

  // Track changes for various operations
  const handleQuestionChange = (updatedQuestion: any) => {
    updateQuestion(updatedQuestion);
    setHasChanges(true);
  };

  const handleDescriptionChangeWithTracking = (description: string) => {
    handleDescriptionChange(description);
    setHasChanges(true);
  };

  const handleAddQuestion = () => {
    addQuestion();
    setHasChanges(true);
  };

  const handleDeleteQuestion = (questionId: string) => {
    deleteQuestion(questionId);
    setHasChanges(true);
  };

  const handleDuplicateQuestion = (question: any) => {
    duplicateQuestion(question);
    setHasChanges(true);
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
          <div className="flex gap-2">
            <Button 
              onClick={handleSaveWithReset} 
              className="flex gap-2 bg-sunset hover:opacity-90"
              disabled={!hasChanges}
            >
              <Save size={18} />
              Save
            </Button>
            <Button 
              onClick={togglePublish} 
              variant={survey.isPublished ? "destructive" : "outline"} 
              className={survey.isPublished ? "" : "border-green-600 text-green-600 hover:bg-green-600 hover:text-white"}
            >
              {survey.isPublished ? "Unpublish" : "Publish"}
            </Button>
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
