
import React, { useState } from 'react';
import { Folder, FolderOpen, Plus, Trash2, Pencil } from 'lucide-react';
import { SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SurveyFolder } from '@/types/survey-organization';
import { DraggableSurveyList } from './DraggableSurveyList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";

interface FolderItemProps {
  folder: SurveyFolder;
  isOpen: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onCreateSurvey: (name: string) => void;
  onDeleteSurvey: (id: string) => void;
  onUpdateOrder: (activeId: string, overId: string) => void;
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
  const { setOpen } = useSidebar();
  
  const handleFolderClick = () => {
    // If sidebar is collapsed, open it first
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
      className="mb-1"
      data-folder-id={folder.id}
    >
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div 
            className="flex items-center w-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <SidebarMenuItem className="flex-1">
              <SidebarMenuButton 
                onClick={handleFolderClick} 
                className="flex-1 justify-center md:justify-start gap-2"
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
                      <FolderOpen className="h-4 w-4 flex-shrink-0" /> : 
                      <Folder className="h-4 w-4 flex-shrink-0" />
                    }
                    {!isCollapsed && <span>{folder.name}</span>}
                  </>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>

            {!isCollapsed && !isEditing && (
              <div className={`flex gap-1 mr-1 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleCreateSurveyClick}
                        className="p-1 h-6 w-6 hover:bg-accent rounded-md"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
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
          <ContextMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

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
