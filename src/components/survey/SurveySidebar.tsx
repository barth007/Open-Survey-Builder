
import React from 'react';
import { Sidebar, SidebarGroup, SidebarSection } from "@/components/ui/sidebar";
import { SurveyFolders } from "@/components/survey/SurveyFolders";
import { UnorganizedSurveys } from "@/components/survey/UnorganizedSurveys";
import { useSurveyData } from "@/hooks/useSurveyData";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateFolderDialog } from "@/components/survey/CreateFolderDialog";
import UserProfile from '@/components/UserProfile';
import { useAuth } from '@/providers/AuthProvider';
import { Navigate } from 'react-router-dom';

export function SurveySidebar() {
  const [openDialog, setOpenDialog] = React.useState<"createFolder" | "createSurvey" | null>(null);
  const { surveyData, isLoading, createFolder, createSurvey, error, deleteSurvey, deleteFolder, updateSurveyOrder } = useSurveyData();
  const { user } = useAuth();
  const [openFolders, setOpenFolders] = React.useState<Set<string>>(new Set());

  // If not authenticated, don't show the sidebar
  if (!user) {
    return null;
  }

  const handleCreateSurvey = async () => {
    try {
      await createSurvey();
    } catch (error) {
      console.error("Error creating survey:", error);
    }
  };

  const handleCreateFolder = async (name: string) => {
    try {
      await createFolder(name);
      setOpenDialog(null);
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  const toggleFolder = (id: string) => {
    setOpenFolders(prev => {
      const newOpenFolders = new Set(prev);
      if (newOpenFolders.has(id)) {
        newOpenFolders.delete(id);
      } else {
        newOpenFolders.add(id);
      }
      return newOpenFolders;
    });
  };

  return (
    <>
      <Sidebar className="border-r border-border">
        <SidebarGroup>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold tracking-tight">Surveys</h2>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setOpenDialog("createFolder")}
                title="Create Folder"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                onClick={handleCreateSurvey}
                title="Create Survey"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-[100px]">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-destructive text-center p-2 text-sm">
              Error loading surveys
            </div>
          ) : (
            <>
              {surveyData?.folders && surveyData.folders.length > 0 && (
                <SurveyFolders 
                  folders={surveyData.folders}
                  openFolders={openFolders}
                  onToggleFolder={toggleFolder}
                  onCreateFolder={handleCreateFolder}
                  onCreateSurvey={createSurvey}
                  onDeleteSurvey={deleteSurvey}
                  onDeleteFolder={deleteFolder}
                  onUpdateOrder={updateSurveyOrder}
                />
              )}
              
              {surveyData?.unorganizedSurveys && (
                <UnorganizedSurveys 
                  surveys={surveyData.unorganizedSurveys}
                  onCreateSurvey={handleCreateSurvey}
                  onDeleteSurvey={deleteSurvey}
                  onUpdateOrder={updateSurveyOrder}
                />
              )}
            </>
          )}
        </SidebarGroup>
        
        {/* User profile section */}
        <UserProfile />
      </Sidebar>

      <CreateFolderDialog 
        open={openDialog === "createFolder"} 
        onOpenChange={() => setOpenDialog(null)}
        onCreateFolder={handleCreateFolder}
      />
    </>
  );
}
