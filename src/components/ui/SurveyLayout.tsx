
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Save, CheckCircle, AlertTriangle } from "lucide-react";
import { Survey } from '@/types/survey';

interface SurveyLayoutProps {
  children: React.ReactNode;
  activeTab: "edit" | "answers";
  setActiveTab: (tab: "edit" | "answers") => void;
  isSaving: boolean;
  lastSaved: Date | null;
  survey: Survey;
  onPublishToggle: () => Promise<void>;
  isTyping: boolean;
  onManualSave: () => Promise<void>;
}

const SurveyLayout = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  isSaving,
  lastSaved,
  survey,
  onPublishToggle,
  isTyping,
  onManualSave
}: SurveyLayoutProps) => {
  const { toast } = useToast();

  const handleSaveClick = async () => {
    try {
      await onManualSave();
      toast({
        title: "Survey saved",
        description: "Your survey has been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error saving survey",
        description: "There was an error saving your survey. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-800">{survey.title || "Untitled Survey"}</h1>
        <div className="flex items-center space-x-4">
          {isSaving && (
            <div className="flex items-center text-sm text-gray-500">
              <Save className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </div>
          )}
          {!isSaving && lastSaved && (
            <div className="flex items-center text-sm text-green-500">
              <CheckCircle className="mr-2 h-4 w-4" />
              Saved {lastSaved.toLocaleTimeString()}
            </div>
          )}
          {!survey.isPublished && (
            <Button variant="outline" size="sm" onClick={onPublishToggle}>
              Publish
            </Button>
          )}
          {survey.isPublished && (
            <Button variant="outline" size="sm" onClick={onPublishToggle}>
              Unpublish
            </Button>
          )}
          <Button onClick={handleSaveClick} disabled={isTyping}>
            Save
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center px-6 py-3 bg-white border-b border-gray-200">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "edit" | "answers")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit" className="data-[state=active]:bg-sunset data-[state=active]:text-white">
              Edit
            </TabsTrigger>
            <TabsTrigger value="answers" className="data-[state=active]:bg-sunset data-[state=active]:text-white">
              Answers
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default SurveyLayout;
