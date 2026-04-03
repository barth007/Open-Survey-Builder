
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SurveyFolder } from '@/types/survey-organization';
import { CreateFolderDialog } from './CreateFolderDialog';
import { FolderItem } from './FolderItem';

interface SurveyFoldersProps {
  folders: SurveyFolder[];
  openFolders: Set<string>;
  onToggleFolder: (id: string) => void;
  onCreateFolder: (name: string) => Promise<void>;
  onCreateSurvey: (params: { name: string; folderId?: string }) => Promise<unknown>;
  onDeleteSurvey: (id: string) => void;
  onDeleteFolder: (id: string) => void;
  onRenameFolder?: (id: string, name: string) => void;
  onUpdateOrder: (activeId: string, overId?: string, targetFolderId?: string | null) => void;
  isCollapsed?: boolean;
  foldersList?: { id: string; name: string }[];
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
  foldersList = []
}: SurveyFoldersProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <SidebarGroup className="px-3">
      <SidebarGroupLabel className="mb-1 flex h-8 items-center justify-between px-1.5 py-0">
        {!isCollapsed && (
          <span className="px-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Workspace
          </span>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsCreateDialogOpen(true)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/[0.18] hover:text-foreground"
              >
                <Plus className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-primary text-primary-foreground font-medium">
              <p>Create Folder</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </SidebarGroupLabel>
      <SidebarGroupContent className="list-none space-y-1">
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
