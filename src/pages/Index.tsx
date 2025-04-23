
import React, { useState } from 'react';
import { Eye, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EditTab from '@/components/survey/EditTab';
import PreviewTab from '@/components/survey/PreviewTab';
import AnswersTab from '@/components/AnswersTab';
import { useSurveyState } from '@/hooks/useSurveyState';
import { useParams } from 'react-router-dom';

const Index = () => {
  const [activeTab, setActiveTab] = useState<"edit" | "preview" | "answers">("edit");
  const { id: surveyId } = useParams();
  const {
    survey,
    handleTitleChange,
    handleDescriptionChange,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
    togglePublish,
    handleSave
  } = useSurveyState();

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
          <h1 className="text-2xl font-bold text-abyss">Survey Builder</h1>
          <div className="flex gap-2">
            {activeTab !== "preview" && (
              <Button 
                variant="outline" 
                onClick={() => setActiveTab("preview")} 
                className="flex gap-2 border-abyss text-abyss hover:bg-abyss hover:text-white"
              >
                <Eye size={18} />
                Preview
              </Button>
            )}
            <Button 
              onClick={handleSave} 
              className="flex gap-2 bg-sunset hover:opacity-90"
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
              onTitleChange={handleTitleChange}
              onDescriptionChange={handleDescriptionChange}
              onQuestionChange={updateQuestion}
              onDeleteQuestion={deleteQuestion}
              onDuplicateQuestion={duplicateQuestion}
              onAddQuestion={addQuestion}
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
