import React, { useState } from 'react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Sidebar, SidebarContent, SidebarGroup, useSidebar } from '@/components/ui/sidebar';
import { SurveyFolders } from './SurveyFolders';
import { UnorganizedSurveys } from './UnorganizedSurveys';
import { useSurveyData } from '@/hooks/useSurveyData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/sonner';
import { Skeleton } from '@/components/ui/skeleton';
import UserProfile from '@/components/UserProfile'; 

export function SurveySidebar() {
  const { surveyData, isLoading, createFolder, createSurvey, deleteFolder, deleteSurvey, updateSurveyOrder } = useSurveyData();
  const [searchTerm, setSearchTerm] = useState('');
  const [openFolders, setOpenFolders] = useState(new Set<string>());
  const { collapsed } = useSidebar();
  const queryClient = useQueryClient();

  const foldersList = surveyData?.folders?.map(folder => ({
    id: folder.id,
    name: folder.name
  })) || [];

  const toggleFolder = (id: string) => {
    const newOpenFolders = new Set(openFolders);
    newOpenFolders.has(id) ? newOpenFolders.delete(id) : newOpenFolders.add(id);
    setOpenFolders(newOpenFolders);
  };

  const handleCreateFolder = async (name: string) => {
    try {
      const folder = await createFolder(name);
      if (folder) setOpenFolders(prev => new Set([...prev, folder.id]));
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleCreateSurvey = async (params: { name: string; folderId?: string }) => {
    try {
      await createSurvey(params);
      if (params.folderId) setOpenFolders(prev => new Set([...prev, params.folderId!]));
    } catch (error) {
      console.error('Error creating survey:', error);
    }
  };

  const handleRenameFolder = async (folderId: string, newName: string) => {
    try {
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
        <SidebarContent className="pt-6">
          <div className="space-y-4 px-2">
            {!collapsed && <Skeleton className="h-9 w-full" />}
            <div className="space-y-2">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </div>
        </SidebarContent>
        <UserProfile compact={collapsed} />
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
        <SidebarContent className="pt-6 flex-1">
          {!collapsed && (
            <div className="flex items-center mb-4 mx-2">
              <Input
                placeholder="Search surveys..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9"
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
          <SidebarGroup defaultOpen className="flex-1">
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
                foldersList={foldersList}
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

        {/* ✅ Always-visible profile block */}
        <UserProfile compact={collapsed} />
      </Sidebar>
    </DndContext>
  );
}
