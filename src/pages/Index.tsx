
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import EditTab from '@/components/survey/EditTab';
import PreviewTab from '@/components/survey/PreviewTab';
import AnswersTab from '@/components/AnswersTab';
import { useSurveyState } from '@/hooks/useSurveyState';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { SurveyFoldersList } from '@/components/survey/SurveyFoldersList';
import { useSurveyData } from '@/hooks/useSurveyData';

const Index = () => {
  const [activeTab, setActiveTab] = useState<"edit" | "preview" | "answers">("edit");
  const { id: surveyId } = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const {
    surveyData,
    isLoading: foldersLoading,
    createFolder,
    createSurvey,
    deleteSurvey,
    deleteFolder,
    updateSurveyOrder
  } = useSurveyData();

  const {
    survey,
    handleTitleChange,
    handleDescriptionChange,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
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
      }, 2000);
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

  const handleQuestionChange = (q: any) => { updateQuestion(q); setPendingChanges(true); };
  const handleDescriptionChangeWithTracking = (desc: string) => { handleDescriptionChange(desc); setPendingChanges(true); };
  const handleAddQuestion = () => { addQuestion(); setPendingChanges(true); };
  const handleDeleteQuestion = (id: string) => { deleteQuestion(id); setPendingChanges(true); };
  const handleDuplicateQuestion = (q: any) => { duplicateQuestion(q); setPendingChanges(true); };

  const handleCreateSurvey = async () => {
    try {
      await createSurvey({ name: "Untitled Survey" });
      toast({
        title: "Success",
        description: "New survey created successfully"
      });
    } catch (error) {
      console.error("Error creating survey:", error);
      toast({
        title: "Error",
        description: "Failed to create survey. Please try again."
      });
    }
  };

  if (isLoading || foldersLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-pebble">
      <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-abyss rounded-full"></div>
    </div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-pebble">
      <div className="text-center p-8 max-w-md text-magma">
        <h2 className="text-2xl font-semibold mb-4">Error Loading Survey</h2>
        <p>{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-pebble py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar with folders and surveys */}
          <div className="lg:col-span-1 bg-white p-4 rounded-md shadow">
            <h2 className="text-xl font-semibold mb-4">Surveys</h2>
            <Button 
              onClick={handleCreateSurvey}
              className="w-full mb-4"
            >
              Create New Survey
            </Button>
            
            <SurveyFoldersList 
              folders={surveyData?.folders || []}
              unorganizedSurveys={surveyData?.unorganizedSurveys || []}
              onCreateFolder={createFolder}
              onDeleteFolder={deleteFolder}
              onDeleteSurvey={deleteSurvey}
              onUpdateOrder={updateSurveyOrder}
              onCreateSurvey={createSurvey}
            />
          </div>

          {/* Main content area */}
          <div className="lg:col-span-3">
            {!surveyId ? (
              <div className="bg-white p-8 rounded-md shadow flex flex-col items-center justify-center min-h-[400px]">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Welcome to Survey Builder</h2>
                <p className="text-gray-600 mb-6">Select a survey from the sidebar or create a new one to get started.</p>
                <Button onClick={handleCreateSurvey}>Create New Survey</Button>
              </div>
            ) : (
              <>
                <header className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold text-abyss">{survey.title}</h1>
                  <div className="flex items-center gap-2">
                    {pendingChanges && <span className="text-sm text-gray-500 italic">Saving...</span>}
                  </div>
                </header>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "edit" | "preview" | "answers")} className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3 bg-ice">
                    <TabsTrigger value="edit" className="data-[state=active]:bg-abyss data-[state=active]:text-white">Edit</TabsTrigger>
                    <TabsTrigger value="preview" className="data-[state=active]:bg-abyss data-[state=active]:text-white">Preview</TabsTrigger>
                    <TabsTrigger value="answers" className="data-[state=active]:bg-abyss data-[state=active]:text-white">Answers</TabsTrigger>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
