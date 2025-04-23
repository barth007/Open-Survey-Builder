
import React from 'react';
import { Folder, FolderOpen, Plus, Trash2 } from 'lucide-react';
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SurveyFolder } from '@/types/survey-organization';
import { DraggableSurveyList } from './DraggableSurveyList';

interface FolderItemProps {
  folder: SurveyFolder;
  isOpen: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onCreateSurvey: (name: string) => void;
  onDeleteSurvey: (id: string) => void;
  onUpdateOrder: (activeId: string, overId: string) => void;
}

export function FolderItem({
  folder,
  isOpen,
  onToggle,
  onDelete,
  onCreateSurvey,
  onDeleteSurvey,
  onUpdateOrder
}: FolderItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="mb-1">
      <div 
        className="flex items-center w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <SidebarMenuItem>
          <SidebarMenuButton onClick={onToggle} className="flex-1 gap-2">
            {isOpen ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />}
            <span>{folder.name}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <div className={`flex gap-1 mr-1 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onCreateSurvey("New Survey")}
                  className="p-1 hover:bg-sidebar-accent rounded-md"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create Survey</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onDelete}
                  className="p-1 hover:bg-sidebar-accent rounded-md"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Folder</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {isOpen && (
        <div className="pl-4">
          <DraggableSurveyList
            surveys={folder.surveys}
            onDeleteSurvey={onDeleteSurvey}
            onUpdateOrder={onUpdateOrder}
            folderId={folder.id}
          />
        </div>
      )}
    </div>
  );
}
