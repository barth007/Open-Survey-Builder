
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
      <Sidebar className={cn("flex flex-col h-full", collapsed ? "w-14" : "w-64")} collapsible>
        {/* Header */}
        <div className="flex-shrink-0 p-2 border-b">
          {!collapsed && <Skeleton className="h-9 w-full" />}
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-2">
            <div className="space-y-2">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex-shrink-0 border-t">
          <UserProfile compact={collapsed} />
        </div>
      </Sidebar>
    );
  }

  return (
    <DndContext
      modifiers={[restrictToVerticalAxis]}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <Sidebar className={cn("flex flex-col h-full", collapsed ? "w-14" : "w-64")} collapsible>
        {/* Header - Fixed search bar */}
        {!collapsed && (
          <div className="flex-shrink-0 p-2 border-b">
            <div className="flex items-center">
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
          </div>
        )}
        
        {/* Content - Scrollable area with improved scrollbar hiding */}
        <div className="flex-1 overflow-hidden">
          <SidebarContent className="h-full">
            <SidebarGroup defaultOpen className="h-full">
              <div className="h-full overflow-y-auto scrollbar-hover">
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
              </div>
            </SidebarGroup>
          </SidebarContent>
        </div>

        {/* Footer - Fixed user profile */}
        <div className="flex-shrink-0 border-t">
          <UserProfile compact={collapsed} />
        </div>
      </Sidebar>
    </DndContext>
  );
}
