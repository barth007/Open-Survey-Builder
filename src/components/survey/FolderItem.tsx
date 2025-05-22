
import React, { useState } from 'react';
import { Folder, FolderOpen, Plus, Trash2 } from 'lucide-react';
import { SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SurveyFolder } from '@/types/survey-organization';
import { DraggableSurveyList } from './DraggableSurveyList';
import { Button } from '@/components/ui/button';

interface FolderItemProps {
  folder: SurveyFolder;
  isOpen: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onCreateSurvey: (name: string) => void;
  onDeleteSurvey: (id: string) => void;
  onUpdateOrder: (activeId: string, overId: string) => void;
  isCollapsed?: boolean;
}

export function FolderItem({
  folder,
  isOpen,
  onToggle,
  onDelete,
  onCreateSurvey,
  onDeleteSurvey,
  onUpdateOrder,
  isCollapsed = false
}: FolderItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { setOpen } = useSidebar();
  
  const handleFolderClick = () => {
    // If sidebar is collapsed, open it first
    if (isCollapsed) {
      setOpen(true);
    }
    onToggle();
  };

  return (
    <div 
      className="mb-1"
      data-folder-id={folder.id}
    >
      <div 
        className="flex items-center w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <SidebarMenuItem className="flex-1">
          <SidebarMenuButton onClick={handleFolderClick} className="flex-1 justify-center md:justify-start gap-2">
            {isOpen ? 
              <FolderOpen className="h-4 w-4 flex-shrink-0" /> : 
              <Folder className="h-4 w-4 flex-shrink-0" />
            }
            {!isCollapsed && <span>{folder.name}</span>}
          </SidebarMenuButton>
        </SidebarMenuItem>

        {!isCollapsed && (
          <div className={`flex gap-1 mr-1 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCreateSurvey("New Survey");
                    }}
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

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    className="p-1 h-6 w-6 hover:bg-accent rounded-md"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete Folder</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="pl-4">
          <DraggableSurveyList
            surveys={folder.surveys}
            onDeleteSurvey={onDeleteSurvey}
            onUpdateOrder={onUpdateOrder}
            folderId={folder.id}
            isCollapsed={isCollapsed}
          />
        </div>
      )}
    </div>
  );
}
