
import React from 'react';
import { DndContext, DragOverEvent, DragEndEvent, closestCenter, pointerWithin } from '@dnd-kit/core';
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
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [activeData, setActiveData] = React.useState<any>(null);
  const [overFolderId, setOverFolderId] = React.useState<string | null>(null);

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

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
    setActiveData(event.active.data.current);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!active || !over) return;
    
    // Find what we're dragging over
    const overId = over.id.toString();
    
    // Find elements by their data attributes
    const folderElements = document.querySelectorAll('[data-folder-id]');
    
    for (const element of folderElements) {
      const folderId = element.getAttribute('data-folder-id');
      const rect = element.getBoundingClientRect();
      const overRect = over.rect;
      
      // Check if the pointer position is inside this element's rectangle
      if (folderId && 
          event.over && 
          overRect && 
          isPointInRect(
            // Use the client coordinates (left, top) instead of x, y
            { x: overRect.left, y: overRect.top },
            { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom }
          )) {
        // If it's a folder and not already open, open it
        if (folderId !== 'unorganized' && !openFolders.has(folderId)) {
          setOpenFolders(prev => new Set([...prev, folderId]));
        }
        setOverFolderId(folderId === 'unorganized' ? null : folderId);
        break;
      }
    }
  };

  // Helper function to check if a point is inside a rectangle
  const isPointInRect = (
    point: { x: number; y: number }, 
    rect: { left: number; top: number; right: number; bottom: number }
  ) => {
    return (
      point.x >= rect.left &&
      point.x <= rect.right &&
      point.y >= rect.top &&
      point.y <= rect.bottom
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    setActiveData(null);
    setOverFolderId(null);
    
    if (!over) return;
    
    // Handle the update based on where it was dropped
    if (overFolderId !== undefined) {
      updateSurveyOrder(active.id.toString(), over.id.toString());
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setActiveData(null);
    setOverFolderId(null);
  };

  const handleDeleteSurvey = async (id: string) => {
    try {
      await deleteSurvey(id);
      toast("Survey deleted successfully");
    } catch (error: any) {
      toast("Failed to delete survey: " + (error.message || "Unknown error"));
    }
  };

  const handleDeleteFolder = async (id: string) => {
    try {
      await deleteFolder(id);
      toast("Folder deleted successfully");
    } catch (error: any) {
      toast("Failed to delete folder: " + (error.message || "Unknown error"));
    }
  };

  return (
    <>
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
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
                      onDeleteSurvey={handleDeleteSurvey}
                      onDeleteFolder={handleDeleteFolder}
                      onUpdateOrder={updateSurveyOrder}
                      isCollapsed={!open}
                    />

                    {/* Unorganized Surveys */}
                    <UnorganizedSurveys
                      surveys={surveyData?.unorganizedSurveys || []}
                      onCreateSurvey={handleCreateSurvey}
                      onDeleteSurvey={handleDeleteSurvey}
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
      </DndContext>

      {/* Create Folder Dialog */}
      <CreateFolderDialog
        isOpen={openDialog === "createFolder"}
        onClose={() => setOpenDialog(null)}
        onCreateFolder={handleCreateFolder}
      />
    </>
  );
}
