import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Sidebar, SidebarContent, SidebarGroup, useSidebar } from '@/components/ui/sidebar';
import { SurveyFolders } from './SurveyFolders';
import { UnorganizedSurveys } from './UnorganizedSurveys';
import { useSurveyData } from '@/hooks/useSurveyData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import UserProfile from '@/components/UserProfile';
import { Sparkles, Search, Plus } from 'lucide-react';
import {
  filterSurveyOrganization,
  hasSurveyOrganizationMatches,
  parseSurveyListId,
} from '@/features/survey-editor/lib/sidebar-organization';

export function SurveySidebar() {
  const { surveyData, isLoading, createFolder, createSurvey, deleteFolder, deleteSurvey, updateSurveyOrder, updateFolder } = useSurveyData();
  const [searchTerm, setSearchTerm] = useState('');
  const [openFolders, setOpenFolders] = useState(new Set<string>());
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  );

  const sidebarStyle = {
    '--sidebar-width': '15.5rem',
    '--sidebar-width-icon': '4rem',
  } as React.CSSProperties;
  const isSearchActive = searchTerm.trim().length > 0;
  const visibleSurveyData = useMemo(() => {
    if (!surveyData) {
      return {
        folders: [],
        unorganizedSurveys: [],
      };
    }

    return filterSurveyOrganization(surveyData, searchTerm);
  }, [searchTerm, surveyData]);
  const visibleOpenFolders = isSearchActive
    ? new Set(visibleSurveyData.folders.map((folder) => folder.id))
    : openFolders;
  const hasMatches = hasSurveyOrganizationMatches(visibleSurveyData);

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
      if (folder) setOpenFolders(prev => new Set([...prev, folder.id]));
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleCreateSurvey = async (params: { name: string; folderId?: string }) => {
    try {
      const newSurvey = await createSurvey(params);
      if (params.folderId) setOpenFolders(prev => new Set([...prev, params.folderId!]));
      navigate(`/survey/${newSurvey.id}`);
    } catch (error) {
      console.error('Error creating survey:', error);
    }
  };

  const handleRenameFolder = async (folderId: string, newName: string) => {
    try {
      await updateFolder({ folderId, name: newName });
    } catch (error) {
      console.error("Error renaming folder:", error);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    const activeFolderId = active.data.current?.folderId ?? null;
    const overType = over.data.current?.type;
    const targetFolderId = overType === 'survey' || overType === 'survey-list'
      ? over.data.current?.folderId ?? null
      : parseSurveyListId(String(over.id));
    const overSurveyId = overType === 'survey' ? String(over.id) : undefined;

    if (String(active.id) === overSurveyId && activeFolderId === targetFolderId) {
      return;
    }

    updateSurveyOrder(String(active.id), overSurveyId, targetFolderId);
  };

  if (isLoading) {
    return (
      <Sidebar
        style={sidebarStyle}
        className="flex h-full flex-col border-r border-border/60 bg-background/95 supports-[backdrop-filter]:bg-background/88"
        collapsible="icon"
      >
        <div className={cn("flex h-14 items-center border-b border-border/60 px-4", collapsed && "justify-center px-0")}>
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-border/70 bg-muted/[0.14]">
            <Sparkles size={16} className="text-foreground/80" />
          </div>
          {!collapsed && <Skeleton className="ml-3 h-4 w-24" />}
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="flex h-full flex-col gap-4 overflow-y-auto overflow-x-hidden px-4 py-4">
            {!collapsed && (
              <div className="space-y-3">
                <Skeleton className="h-9 w-full rounded-xl" />
                <Skeleton className="h-9 w-full rounded-xl" />
              </div>
            )}
            <div className="space-y-2">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 border-t border-border/60">
          <UserProfile compact={collapsed} />
        </div>
      </Sidebar>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToVerticalAxis]}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <Sidebar
        style={sidebarStyle}
        className="flex h-full flex-col border-r border-border/60 bg-background/95 supports-[backdrop-filter]:bg-background/88"
        collapsible="icon"
      >
        <div className={cn(
          "flex h-14 items-center gap-3 border-b border-border/60 px-4",
          collapsed && "justify-center px-0"
        )}>
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-border/70 bg-muted/[0.14]">
            <Sparkles size={16} className="text-foreground/80" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-tight text-foreground">
                Surveys
              </p>
              <p className="text-[11px] text-muted-foreground">
                Workspace
              </p>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="space-y-3 border-b border-border/60 px-4 py-4">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Search size={14} />
              </div>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search surveys"
                className="h-9 rounded-xl border-border/70 bg-muted/[0.14] pl-9 text-sm shadow-none placeholder:text-muted-foreground focus-visible:border-border/70 focus-visible:ring-0"
              />
            </div>

            <Button
              onClick={() => handleCreateSurvey({ name: 'Untitled Survey' })}
              className="h-9 w-full rounded-xl bg-foreground text-sm font-medium text-background shadow-none hover:bg-foreground/92"
            >
              <Plus size={14} />
              <span>New survey</span>
            </Button>
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          <SidebarContent>
            <SidebarGroup className="p-0">
              <div className="flex h-full flex-col overflow-y-auto overflow-x-hidden py-3">
                {!collapsed && isSearchActive && !hasMatches && (
                  <div className="px-5 py-4 text-sm text-muted-foreground">
                    No surveys found for "{searchTerm.trim()}".
                  </div>
                )}

                {(!isSearchActive || visibleSurveyData.folders.length > 0) && (
                  <SurveyFolders
                    folders={visibleSurveyData.folders}
                    openFolders={visibleOpenFolders}
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
                )}
                {(!isSearchActive || visibleSurveyData.unorganizedSurveys.length > 0) && (
                  <UnorganizedSurveys
                    surveys={visibleSurveyData.unorganizedSurveys}
                    onCreateSurvey={() => handleCreateSurvey({ name: 'Untitled Survey' })}
                    onDeleteSurvey={deleteSurvey}
                    onUpdateOrder={updateSurveyOrder}
                    isCollapsed={collapsed}
                    folders={foldersList}
                  />
                )}
              </div>
            </SidebarGroup>
          </SidebarContent>
        </div>

        <div className="flex-shrink-0 border-t border-border/60">
          <UserProfile compact={collapsed} />
        </div>
      </Sidebar>
    </DndContext>
  );
}
