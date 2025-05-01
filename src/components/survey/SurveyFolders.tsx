
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
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
  onUpdateOrder: (activeId: string, overId: string) => void;
}

export function SurveyFolders({
  folders,
  openFolders,
  onToggleFolder,
  onCreateFolder,
  onCreateSurvey,
  onDeleteSurvey,
  onDeleteFolder,
  onUpdateOrder
}: SurveyFoldersProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="mb-4">
      <div className="text-sm font-medium mb-2 flex justify-between items-center">
        <span>Folders</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsCreateDialogOpen(true)}
                className="hover:bg-gray-100 rounded-md p-1"
              >
                <Plus className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create Folder</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="space-y-1 list-none">
        {folders.map((folder) => (
          <FolderItem
            key={folder.id}
            folder={folder}
            isOpen={openFolders.has(folder.id)}
            onToggle={() => onToggleFolder(folder.id)}
            onDelete={() => onDeleteFolder(folder.id)}
            onCreateSurvey={(name) => onCreateSurvey({ name, folderId: folder.id })}
            onDeleteSurvey={onDeleteSurvey}
            onUpdateOrder={onUpdateOrder}
          />
        ))}
      </div>
      <CreateFolderDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreateFolder={onCreateFolder}
      />
    </div>
  );
}
