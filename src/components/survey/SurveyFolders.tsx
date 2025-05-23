
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SurveyFolder } from '@/types/survey-organization';
import { DraggableSurveyList } from './DraggableSurveyList';
import { CreateFolderDialog } from './CreateFolderDialog';
import { FolderItem } from './FolderItem';

interface SurveyFoldersProps {
  folders: SurveyFolder[];
  openFolders: Set<string>;
  onToggleFolder: (id: string) => void;
  onCreateFolder: (name: string) => Promise<void>;
  onCreateSurvey: (params: { name: string; folderId?: string }) => Promise<any>;
  onDeleteSurvey: (id: string) => void;
  onDeleteFolder: (id: string) => void;
  onRenameFolder?: (id: string, name: string) => void;
  onUpdateOrder: (activeId: string, overId: string) => void;
  isCollapsed?: boolean;
  folders?: { id: string; name: string }[];
}

export function SurveyFolders({
  folders,
  openFolders,
  onToggleFolder,
  onCreateFolder,
  onCreateSurvey,
  onDeleteSurvey,
  onDeleteFolder,
  onRenameFolder,
  onUpdateOrder,
  isCollapsed = false,
  folders: foldersList = []
}: SurveyFoldersProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex justify-between items-center">
        {!isCollapsed && <span>Folders</span>}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsCreateDialogOpen(true)}
                className="hover:bg-sidebar-accent rounded-md p-1 ml-auto"
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
      <SidebarGroupContent className="list-none">
        {folders.map((folder) => (
          <FolderItem
            key={folder.id}
            folder={folder}
            isOpen={openFolders.has(folder.id)}
            onToggle={() => onToggleFolder(folder.id)}
            onDelete={() => onDeleteFolder(folder.id)}
            onRenameFolder={onRenameFolder}
            onCreateSurvey={(name) => onCreateSurvey({ name, folderId: folder.id })}
            onDeleteSurvey={onDeleteSurvey}
            onUpdateOrder={onUpdateOrder}
            isCollapsed={isCollapsed}
            folders={foldersList}
          />
        ))}
      </SidebarGroupContent>
      <CreateFolderDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreateFolder={onCreateFolder}
      />
    </SidebarGroup>
  );
}
