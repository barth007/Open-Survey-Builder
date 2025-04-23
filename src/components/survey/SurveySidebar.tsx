
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Folder, FolderOpen, Plus, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { CreateFolderDialog } from './CreateFolderDialog';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { DndContext, closestCenter, MouseSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

import { useSurveyData } from '@/hooks/useSurveyData';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DraggableSurveyItem } from './DraggableSurveyItem';

export function SurveySidebar() {
  const [openFolders, setOpenFolders] = React.useState<Set<string>>(new Set());
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { surveyData, isLoading, createSurvey, createFolder, deleteSurvey, deleteFolder, updateSurveyOrder } = useSurveyData();
  
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
        <SidebarGroup>
          <SidebarGroupLabel className="flex justify-between items-center">
            <span>Folders</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setIsFolderDialogOpen(true)}
                    className="hover:bg-sidebar-accent rounded-md p-1"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create Folder</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {surveyData?.folders.map((folder) => (
                <SidebarMenuItem key={folder.id}>
                  <SidebarMenuButton 
                    onClick={() => toggleFolder(folder.id)}
                    className="w-full justify-start gap-2 group"
                  >
                    {openFolders.has(folder.id) ? <FolderOpen /> : <Folder />}
                    <span>{folder.name}</span>
                  </SidebarMenuButton>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuAction
                          showOnHover
                          onClick={() => handleCreateSurvey(folder.id)}
                          className="right-8"
                        >
                          <Plus className="h-4 w-4" />
                        </SidebarMenuAction>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Create Survey</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {openFolders.has(folder.id) && folder.surveys.length > 0 && (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                      modifiers={[restrictToVerticalAxis]}
                    >
                      <SortableContext
                        items={folder.surveys}
                        strategy={verticalListSortingStrategy}
                      >
                        {folder.surveys.map((survey) => (
                          <DraggableSurveyItem
                            key={survey.id}
                            survey={survey}
                            onDelete={(e) => handleDeleteSurvey(survey.id, e)}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="flex justify-between items-center">
            <span>Other Surveys</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleCreateSurvey()}
                    className="hover:bg-sidebar-accent rounded-md p-1"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create Survey</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext
                items={surveyData?.unorganizedSurveys || []}
                strategy={verticalListSortingStrategy}
              >
                <SidebarMenu>
                  {surveyData?.unorganizedSurveys.map((survey) => (
                    <DraggableSurveyItem
                      key={survey.id}
                      survey={survey}
                      onDelete={(e) => handleDeleteSurvey(survey.id, e)}
                    />
                  ))}
                </SidebarMenu>
              </SortableContext>
            </DndContext>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <CreateFolderDialog
        isOpen={isFolderDialogOpen}
        onClose={() => setIsFolderDialogOpen(false)}
        onCreateFolder={handleCreateFolder}
      />
    </Sidebar>
  );
}
