
import React, { useState } from 'react';
import { Folder, FolderOpen, Plus, Trash2 } from 'lucide-react';
import { Survey } from '@/types/survey-organization';
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { DraggableSurveyItem } from './DraggableSurveyItem';
import { cn } from '@/lib/utils';

interface FolderItemProps {
  id: string;
  name: string;
  surveys: Survey[];
  isOpen: boolean;
  onToggle: (id: string) => void;
  onCreateSurvey: (folderId: string) => void;
  onDeleteSurvey: (surveyId: string, e: React.MouseEvent) => void;
  onDeleteFolder?: (folderId: string) => void;
  onDragEnd: (event: any) => void;
  sensors: any;
}

export function FolderItem({
  id,
  name,
  surveys,
  isOpen,
  onToggle,
  onCreateSurvey,
  onDeleteSurvey,
  onDeleteFolder,
  onDragEnd,
  sensors,
}: FolderItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <SidebarMenuItem>
      <div 
        className="flex items-center w-full group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <SidebarMenuButton 
          onClick={() => onToggle(id)}
          className="w-full justify-start gap-2"
        >
          {isOpen ? <FolderOpen /> : <Folder />}
          <span>{name}</span>
        </SidebarMenuButton>

        <div className="flex gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarMenuAction
                  className={cn(
                    "transition-opacity",
                    isHovered ? "opacity-100" : "opacity-0"
                  )}
                  onClick={() => onCreateSurvey(id)}
                >
                  <Plus className="h-4 w-4" />
                </SidebarMenuAction>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create Survey</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {onDeleteFolder && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuAction
                    className={cn(
                      "transition-opacity",
                      isHovered ? "opacity-100" : "opacity-0"
                    )}
                    onClick={() => onDeleteFolder(id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </SidebarMenuAction>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete Folder</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {isOpen && surveys.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={surveys}
            strategy={verticalListSortingStrategy}
          >
            {surveys.map((survey) => (
              <DraggableSurveyItem
                key={survey.id}
                survey={survey}
                onDelete={(e) => onDeleteSurvey(survey.id, e)}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </SidebarMenuItem>
  );
}
