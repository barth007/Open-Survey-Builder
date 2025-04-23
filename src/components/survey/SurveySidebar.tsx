
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MouseSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useToast } from "@/hooks/use-toast";
import { Sidebar, SidebarHeader, SidebarContent } from "@/components/ui/sidebar";
import { useSurveyData } from '@/hooks/useSurveyData';
import { CreateFolderDialog } from './CreateFolderDialog';
import { FoldersSection } from './FoldersSection';
import { UnorganizedSurveysSection } from './UnorganizedSurveysSection';

export function SurveySidebar() {
  const [openFolders, setOpenFolders] = React.useState<Set<string>>(new Set());
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { surveyData, isLoading, createSurvey, createFolder, deleteSurvey, updateSurveyOrder } = useSurveyData();
  
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });
  const sensors = useSensors(mouseSensor);

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
      toast({
        title: "Error",
        description: "Failed to delete survey",
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
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create folder",
        variant: "destructive",
      });
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
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      updateSurveyOrder(active.id, over.id);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <h2 className="text-lg font-semibold">Survey Builder</h2>
      </SidebarHeader>
      <SidebarContent>
        <FoldersSection
          folders={surveyData?.folders || []}
          openFolders={openFolders}
          onToggleFolder={toggleFolder}
          onOpenCreateDialog={() => setIsFolderDialogOpen(true)}
          onCreateSurvey={handleCreateSurvey}
          onDeleteSurvey={handleDeleteSurvey}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        />
        <UnorganizedSurveysSection
          surveys={surveyData?.unorganizedSurveys || []}
          onCreateSurvey={() => handleCreateSurvey()}
          onDeleteSurvey={handleDeleteSurvey}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        />
      </SidebarContent>
      
      <CreateFolderDialog
        isOpen={isFolderDialogOpen}
        onClose={() => setIsFolderDialogOpen(false)}
        onCreateFolder={handleCreateFolder}
      />
    </Sidebar>
  );
}
