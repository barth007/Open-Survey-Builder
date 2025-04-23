
import React from 'react';
import { Plus } from 'lucide-react';
import { Survey, SurveyFolder } from '@/types/survey-organization';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FolderItem } from './FolderItem';

interface FoldersSectionProps {
  folders: SurveyFolder[];
  openFolders: Set<string>;
  onToggleFolder: (id: string) => void;
  onOpenCreateDialog: () => void;
  onCreateSurvey: (folderId: string) => void;
  onDeleteSurvey: (surveyId: string, e: React.MouseEvent) => void;
  onDragEnd: (event: any) => void;
  sensors: any;
}

export function FoldersSection({
  folders,
  openFolders,
  onToggleFolder,
  onOpenCreateDialog,
  onCreateSurvey,
  onDeleteSurvey,
  onDragEnd,
  sensors,
}: FoldersSectionProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex justify-between items-center">
        <span>Folders</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onOpenCreateDialog}
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
          {folders.map((folder) => (
            <FolderItem
              key={folder.id}
              id={folder.id}
              name={folder.name}
              surveys={folder.surveys}
              isOpen={openFolders.has(folder.id)}
              onToggle={onToggleFolder}
              onCreateSurvey={onCreateSurvey}
              onDeleteSurvey={onDeleteSurvey}
              onDragEnd={onDragEnd}
              sensors={sensors}
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
