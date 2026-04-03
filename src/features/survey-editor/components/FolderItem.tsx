
import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Folder, FolderOpen, Plus, Trash2, Pencil, GripVertical } from 'lucide-react';
import { SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SurveyFolder } from '@/types/survey-organization';
import { DraggableSurveyList } from './DraggableSurveyList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FolderItemProps {
  folder: SurveyFolder;
  isOpen: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onCreateSurvey: (name: string) => void;
  onDeleteSurvey: (id: string) => void;
  onUpdateOrder: (activeId: string, overId?: string, targetFolderId?: string | null) => void;
  onRenameFolder?: (id: string, name: string) => void;
  isCollapsed?: boolean;
  folders?: { id: string; name: string }[];
}

export function FolderItem({
  folder,
  isOpen,
  onToggle,
  onDelete,
  onCreateSurvey,
  onDeleteSurvey,
  onUpdateOrder,
  onRenameFolder,
  isCollapsed = false,
  folders = []
}: FolderItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [folderName, setFolderName] = useState(folder.name);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { setOpen } = useSidebar();
  const { isOver, setNodeRef } = useDroppable({
    id: `folder-drop:${folder.id}`,
    data: {
      type: 'survey-list',
      folderId: folder.id,
    },
  });

  const handleFolderClick = () => {
    if (isCollapsed) {
      setOpen(true);
    }
    onToggle();
  };

  const handleCreateSurveyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onCreateSurvey("New Survey");
  };

  const handleRename = () => {
    setIsEditing(true);
  };

  const handleSaveRename = () => {
    if (folderName !== folder.name && onRenameFolder) {
      onRenameFolder(folder.id, folderName);
    }
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      className={cn("mb-1 rounded-xl transition-colors", isOver && "bg-muted/[0.12]")}
      data-folder-id={folder.id}
    >
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            className="flex items-center w-full relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Drag Handle - only visible on hover and positioned properly */}
            <div
              className={cn(
                "absolute left-0 top-0 bottom-0 w-4 flex items-center justify-center cursor-grab active:cursor-grabbing z-10 transition-opacity",
                isHovered ? "opacity-50 hover:opacity-100" : "opacity-0"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-3 w-3" />
            </div>

            <SidebarMenuItem className="ml-4 flex-1 min-w-0 list-none group/item">
              <SidebarMenuButton
                onClick={handleFolderClick}
                className={cn(
                  "min-w-0 flex-1 justify-center md:justify-start gap-3 h-10 px-3 rounded-xl transition-all duration-200 font-medium",
                  isOpen ? "bg-primary/5 text-primary shadow-sm" : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                )}
              >
                {isEditing ? (
                  <Input
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    onBlur={handleSaveRename}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRename();
                      if (e.key === 'Escape') {
                        setFolderName(folder.name);
                        setIsEditing(false);
                      }
                    }}
                    className="h-8"
                    autoFocus
                  />
                ) : (
                  <>
                    {isOpen ?
                      <FolderOpen className={cn("h-4 w-4 flex-shrink-0 transition-colors", isOpen ? "text-primary" : "text-muted-foreground/60")} /> :
                      <Folder className="h-4 w-4 flex-shrink-0 text-muted-foreground/60 group-hover/item:text-primary/70 transition-colors" />
                    }
                    {!isCollapsed && <span className="min-w-0 flex-1 truncate">{folder.name}</span>}
                  </>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>

            {!isCollapsed && !isEditing && (
              <div className={cn(
                "flex gap-1 mr-1 transition-opacity z-10",
                isHovered ? "opacity-100" : "opacity-0"
              )}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleCreateSurveyClick}
                        className="p-1.5 h-7 w-7 hover:bg-primary/10 hover:text-primary rounded-lg transition-all"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-primary text-primary-foreground font-medium">
                      <p>Create Survey</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent className="w-48">
          <ContextMenuItem onClick={handleRename}>
            <Pencil className="mr-2 h-4 w-4" />
            Rename
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-red-600 focus:text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete folder "{folder.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              The folder will be removed. Any surveys inside it will become unorganized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={onDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isOpen && (
        <div className="pl-4">
          <DraggableSurveyList
            surveys={folder.surveys}
            onDeleteSurvey={onDeleteSurvey}
            onUpdateOrder={onUpdateOrder}
            folderId={folder.id}
            isCollapsed={isCollapsed}
            folders={folders}
          />
        </div>
      )}
    </div>
  );
}
