
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, MouseSensor, useSensor, useSensors, closestCenter, DragOverlay, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useToast } from "@/hooks/use-toast";
import { Sidebar, SidebarHeader, SidebarContent } from "@/components/ui/sidebar";
import { useSurveyData } from '@/hooks/useSurveyData';
import { CreateFolderDialog } from './CreateFolderDialog';
import { FoldersSection } from './FoldersSection';
import { UnorganizedSurveysSection } from './UnorganizedSurveysSection';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Survey } from '@/types/survey-organization';

export function SurveySidebar() {
  const [openFolders, setOpenFolders] = React.useState<Set<string>>(new Set());
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeDragSurvey, setActiveDragSurvey] = useState<Survey | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { surveyData, isLoading, error, createSurvey, createFolder, deleteSurvey, deleteFolder, updateSurveyOrder } = useSurveyData();
  
  // Configure mouse sensor with a delay to avoid accidental drags
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });
  const sensors = useSensors(mouseSensor);

  // Show error dialog if there's a query error
  React.useEffect(() => {
    if (error) {
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred loading survey data.");
      setErrorDialogOpen(true);
    }
  }, [error]);

  const toggleFolder = (folderId: string) => {
    setOpenFolders((current) => {
      const newSet = new Set(current);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleDeleteSurvey = async (surveyId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await deleteSurvey(surveyId);
      toast({
        title: "Success",
        description: "Survey deleted successfully",
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to delete survey";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  const handleCreateFolder = async (name: string) => {
    try {
      await createFolder(name);
      toast({
        title: "Success",
        description: "Folder created successfully",
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to create folder";
      
      // Show error dialog for database-related issues
      if (errorMsg.includes("table") || errorMsg.includes("database")) {
        setErrorMessage(errorMsg);
        setErrorDialogOpen(true);
      } else {
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
      }
    }
  };

  const handleCreateSurvey = async (folderId?: string) => {
    try {
      const newSurvey = await createSurvey({
        name: "New Survey",
        folderId
      });
      
      if (newSurvey && newSurvey.id) {
        toast({
          title: "Success",
          description: "Survey created successfully",
        });
        navigate(`/survey/${newSurvey.id}`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "An unexpected error occurred";
      
      // Show error dialog for database-related issues
      if (errorMsg.includes("table") || errorMsg.includes("database")) {
        setErrorMessage(errorMsg);
        setErrorDialogOpen(true);
      } else {
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
      }
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    // Find the survey being dragged
    const activeSurvey = findSurveyById(active.id as string);
    if (activeSurvey) {
      setActiveDragSurvey(activeSurvey);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveDragSurvey(null);
    
    if (over && active.id !== over.id) {
      updateSurveyOrder(active.id.toString(), over.id.toString());
    }
  };

  // Helper function to find a survey by ID across all folders and unorganized surveys
  const findSurveyById = (id: string): Survey | null => {
    if (!surveyData) return null;
    
    // Check unorganized surveys first
    const unorganizedMatch = surveyData.unorganizedSurveys.find(s => s.id === id);
    if (unorganizedMatch) return unorganizedMatch;
    
    // Then check in folders
    for (const folder of surveyData.folders) {
      const folderMatch = folder.surveys.find(s => s.id === id);
      if (folderMatch) return folderMatch;
    }
    
    return null;
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <h2 className="text-lg font-semibold">Survey Builder</h2>
      </SidebarHeader>
      <SidebarContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <FoldersSection
            folders={surveyData?.folders || []}
            openFolders={openFolders}
            onToggleFolder={toggleFolder}
            onOpenCreateDialog={() => setIsFolderDialogOpen(true)}
            onCreateSurvey={handleCreateSurvey}
            onDeleteSurvey={handleDeleteSurvey}
            onDeleteFolder={deleteFolder}
          />
          <UnorganizedSurveysSection
            surveys={surveyData?.unorganizedSurveys || []}
            onCreateSurvey={() => handleCreateSurvey()}
            onDeleteSurvey={handleDeleteSurvey}
          />
          {/* We can add a DragOverlay here for future visual enhancements */}
        </DndContext>
      </SidebarContent>
      
      <CreateFolderDialog
        isOpen={isFolderDialogOpen}
        onClose={() => setIsFolderDialogOpen(false)}
        onCreateFolder={handleCreateFolder}
      />

      <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Database Error</AlertDialogTitle>
            <AlertDialogDescription>
              {errorMessage}
              <div className="mt-4">
                The required database tables do not exist in your Supabase project. Please make sure 
                to set up the required tables before using this feature.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorDialogOpen(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  );
}
