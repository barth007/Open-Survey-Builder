
import React from 'react';
import { Sidebar, SidebarGroup, SidebarContent } from "@/components/ui/sidebar";
import { SurveyFolders } from "@/components/survey/SurveyFolders";
import { UnorganizedSurveys } from "@/components/survey/UnorganizedSurveys";
import { useSurveyData } from "@/hooks/useSurveyData";
import { CreateFolderDialog } from "@/components/survey/CreateFolderDialog";
import UserProfile from '@/components/UserProfile';
import { useAuth } from '@/providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Folder, Loader } from 'lucide-react';

export function SurveySidebar() {
  const [openDialog, setOpenDialog] = React.useState<"createFolder" | "createSurvey" | null>(null);
  const { surveyData, isLoading, createFolder, createSurvey, error, deleteSurvey, deleteFolder, updateSurveyOrder } = useSurveyData();
  const { user } = useAuth();
  const [openFolders, setOpenFolders] = React.useState<Set<string>>(new Set());
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const handleCreateSurvey = async () => {
    try {
      await createSurvey({ name: "Untitled Survey" });
    } catch (error) {
      console.error("Error creating survey:", error);
    }
  };

  const handleCreateFolder = async (name: string) => {
    try {
      console.log("Creating folder:", name);
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
      <Sidebar className="border-r border-border flex flex-col h-screen">
        <div className="flex-1 flex flex-col overflow-hidden">
          <SidebarContent className="flex-1 overflow-auto">
            <SidebarGroup>
              <div className="mb-4">
                <h2 className="text-lg font-semibold tracking-tight">Survey Builder</h2>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center h-[100px]">
                  <Loader className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-destructive text-center p-2 text-sm">
                  Error loading surveys: {error.message}
                </div>
              ) : (
                <>
                  {/* Always show the folder section regardless of whether there are folders or not */}
                  <div className="mb-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full flex justify-center items-center gap-2"
                      onClick={() => setOpenDialog("createFolder")}
                    >
                      <Folder className="h-4 w-4" />
                      Create Folder
                    </Button>
                  </div>
                  
                  <SurveyFolders
                    folders={surveyData?.folders || []}
                    openFolders={openFolders}
                    onToggleFolder={toggleFolder}
                    onCreateFolder={handleCreateFolder}
                    onCreateSurvey={createSurvey}
                    onDeleteSurvey={deleteSurvey}
                    onDeleteFolder={deleteFolder}
                    onUpdateOrder={updateSurveyOrder}
                  />

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
          </SidebarContent>
        </div>

        <div className="w-full">
          <UserProfile />
        </div>
      </Sidebar>

      <CreateFolderDialog
        isOpen={openDialog === "createFolder"}
        onClose={() => setOpenDialog(null)}
        onCreateFolder={handleCreateFolder}
      />
    </>
  );
}
