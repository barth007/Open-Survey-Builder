
import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, closestCenter } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { BiSearch } from 'react-icons/bi';
import { SurveyItem } from '@/types/survey-organization';
import { Sidebar, SidebarContent, SidebarGroup, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { SurveyFolders } from './SurveyFolders';
import { UnorganizedSurveys } from './UnorganizedSurveys';
import { useSurveyData } from '@/hooks/useSurveyData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/sonner';
import { Skeleton } from '@/components/ui/skeleton';

export function SurveySidebar() {
  const { surveyData, isLoading, createFolder, createSurvey, deleteFolder, deleteSurvey, updateSurveyOrder } = useSurveyData();
  const [searchTerm, setSearchTerm] = useState('');
  const [openFolders, setOpenFolders] = useState(new Set<string>());
  const { collapsed } = useSidebar();
  const queryClient = useQueryClient();

  // Extract all folders into a format that can be passed to children components
  const foldersList = surveyData?.folders?.map(folder => ({
    id: folder.id,
    name: folder.name
  })) || [];

  const toggleFolder = (id: string) => {
    const newOpenFolders = new Set(openFolders);
    if (newOpenFolders.has(id)) {
      newOpenFolders.delete(id);
    } else {
      newOpenFolders.add(id);
    }
    setOpenFolders(newOpenFolders);
  };

  const handleCreateFolder = async (name: string) => {
    try {
      const folder = await createFolder(name);
      if (folder) {
        setOpenFolders(prev => new Set([...prev, folder.id]));
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleCreateSurvey = async (params: { name: string; folderId?: string }) => {
    try {
      await createSurvey(params);
      // If this is for a folder, make sure that folder is open
      if (params.folderId) {
        setOpenFolders(prev => new Set([...prev, params.folderId!]));
      }
    } catch (error) {
      console.error('Error creating survey:', error);
    }
  };

  const handleRenameFolder = async (folderId: string, newName: string) => {
    try {
      // Add this function to useMutateFolder if needed
      // For now, we'll simulate by invalidating the queries
      // In a real implementation, you would call a backend method
      
      // In a real implementation:
      // await updateFolder({ folderId, updates: { name: newName } });
      
      // For now, just invalidate to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast.success("Folder renamed successfully");
    } catch (error) {
      toast.error("Failed to rename folder");
      console.error("Error renaming folder:", error);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      updateSurveyOrder(String(active.id), String(over.id));
    }
  };
  
  if (isLoading) {
    return (
      <Sidebar className={cn(collapsed ? "w-14" : "w-64")} collapsible>
        <SidebarTrigger className="absolute right-2 top-2" />
        <SidebarContent className="pt-6">
          <div className="space-y-4 px-2">
            {!collapsed && (
              <Skeleton className="h-9 w-full" />
            )}
            <div className="space-y-2">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <DndContext
      modifiers={[restrictToVerticalAxis]}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <Sidebar className={cn(collapsed ? "w-14" : "w-64")} collapsible>
        <SidebarTrigger className="absolute right-2 top-2" />
        <SidebarContent className="pt-6">
          {!collapsed && (
            <div className="flex items-center mb-4 mx-2">
              <Input
                placeholder="Search surveys..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9"
                containerClassName="flex-1"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2"
                  onClick={() => setSearchTerm('')}
                >
                  Clear
                </Button>
              )}
            </div>
          )}

          <SidebarGroup defaultOpen>
            <SortableContext items={[]} strategy={verticalListSortingStrategy}>
              <SurveyFolders
                folders={surveyData?.folders || []}
                openFolders={openFolders}
                onToggleFolder={toggleFolder}
                onCreateFolder={handleCreateFolder}
                onCreateSurvey={handleCreateSurvey}
                onDeleteSurvey={deleteSurvey}
                onDeleteFolder={deleteFolder}
                onUpdateOrder={updateSurveyOrder}
                onRenameFolder={handleRenameFolder}
                isCollapsed={collapsed}
                folders={foldersList}
              />
              <UnorganizedSurveys
                surveys={surveyData?.unorganizedSurveys || []}
                onCreateSurvey={() => handleCreateSurvey({ name: 'New Survey' })}
                onDeleteSurvey={deleteSurvey}
                onUpdateOrder={updateSurveyOrder}
                isCollapsed={collapsed}
                folders={foldersList}
              />
            </SortableContext>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </DndContext>
  );
}
