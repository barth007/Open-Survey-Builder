
import React from 'react';
import { Sidebar, SidebarGroup, SidebarContent, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { SurveyFolders } from "@/components/survey/SurveyFolders";
import { UnorganizedSurveys } from "@/components/survey/UnorganizedSurveys";
import { useSurveyData } from "@/hooks/useSurveyData";
import { CreateFolderDialog } from "@/components/survey/CreateFolderDialog";
import UserProfile from '@/components/UserProfile';
import { useAuth } from '@/providers/AuthProvider';
import { Loader, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';

export function SurveySidebar() {
  const [openDialog, setOpenDialog] = React.useState<"createFolder" | "createSurvey" | null>(null);
  const { surveyData, isLoading, createFolder, createSurvey, error, deleteSurvey, deleteFolder, updateSurveyOrder } = useSurveyData();
  const { user } = useAuth();
  const [openFolders, setOpenFolders] = React.useState<Set<string>>(new Set());
  const { open } = useSidebar();

  // If user is not authenticated, don't render the sidebar
  if (!user) {
    return null;
  }

  const handleCreateSurvey = async () => {
    try {
      await createSurvey({ name: "Untitled Survey" });
      toast("New survey created successfully");
    } catch (error) {
      console.error("Error creating survey:", error);
      toast("Failed to create survey. Please try again.");
    }
  };

  const handleCreateFolder = async (name: string) => {
    try {
      console.log("Creating folder:", name);
      await createFolder(name);
      toast(`Folder "${name}" created successfully`);
      setOpenDialog(null);
    } catch (error) {
      console.error("Error creating folder:", error);
      toast("Failed to create folder. Please try again.");
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
      <Sidebar 
        className="border-r border-border flex flex-col h-screen transition-all duration-300" 
        collapsible="icon"
      >
        <div className="flex items-center justify-between p-2">
          {open && <h2 className="text-lg font-semibold tracking-tight">Survey Builder</h2>}
          <SidebarTrigger className="ml-auto" />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <SidebarContent className="flex-1 overflow-auto">
            <SidebarGroup>
              {/* Survey Content */}
              {isLoading ? (
                <div className="flex items-center justify-center h-[100px]">
                  <Loader className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center text-destructive text-center p-4 border border-destructive/20 rounded-md bg-destructive/10">
                  <AlertCircle className="h-5 w-5 mb-2" />
                  <p className="text-sm font-medium">Error loading surveys</p>
                  <p className="text-xs mt-1">{error.message}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <>
                  {/* Folders Section - Always show even if empty */}
                  <SurveyFolders
                    folders={surveyData?.folders || []}
                    openFolders={openFolders}
                    onToggleFolder={toggleFolder}
                    onCreateFolder={handleCreateFolder}
                    onCreateSurvey={createSurvey}
                    onDeleteSurvey={deleteSurvey}
                    onDeleteFolder={deleteFolder}
                    onUpdateOrder={updateSurveyOrder}
                    isCollapsed={!open}
                  />

                  {/* Unorganized Surveys */}
                  <UnorganizedSurveys
                    surveys={surveyData?.unorganizedSurveys || []}
                    onCreateSurvey={handleCreateSurvey}
                    onDeleteSurvey={deleteSurvey}
                    onUpdateOrder={updateSurveyOrder}
                    isCollapsed={!open}
                  />
                </>
              )}
            </SidebarGroup>
          </SidebarContent>
        </div>

        {/* User Profile Section */}
        <div className="w-full">
          <UserProfile compact={!open} />
        </div>
      </Sidebar>

      {/* Create Folder Dialog */}
      <CreateFolderDialog
        isOpen={openDialog === "createFolder"}
        onClose={() => setOpenDialog(null)}
        onCreateFolder={handleCreateFolder}
      />
    </>
  );
}
