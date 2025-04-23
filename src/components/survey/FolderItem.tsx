
import React from 'react';
import { Folder, FolderOpen, Plus } from 'lucide-react';
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

interface FolderItemProps {
  id: string;
  name: string;
  surveys: Survey[];
  isOpen: boolean;
  onToggle: (id: string) => void;
  onCreateSurvey: (folderId: string) => void;
  onDeleteSurvey: (surveyId: string, e: React.MouseEvent) => void;
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
  onDragEnd,
  sensors,
}: FolderItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton 
        onClick={() => onToggle(id)}
        className="w-full justify-start gap-2 group"
      >
        {isOpen ? <FolderOpen /> : <Folder />}
        <span>{name}</span>
      </SidebarMenuButton>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarMenuAction
              showOnHover
              onClick={() => onCreateSurvey(id)}
              className="right-8"
            >
              <Plus className="h-4 w-4" />
            </SidebarMenuAction>
          </TooltipTrigger>
          <TooltipContent>
            <p>Create Survey</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

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
