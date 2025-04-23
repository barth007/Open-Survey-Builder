
import React from 'react';
import { Link } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2 } from 'lucide-react';
import { Survey } from '@/types/survey-organization';
import { SidebarMenuItem, SidebarMenuButton, SidebarMenuAction } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DraggableSurveyItemProps {
  survey: Survey;
  onDelete: (e: React.MouseEvent) => void;
}

export function DraggableSurveyItem({ survey, onDelete }: DraggableSurveyItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: survey.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1,
  };

  return (
    <SidebarMenuItem ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <SidebarMenuButton asChild>
        <Link to={`/survey/${survey.id}`} className="w-full justify-start">
          {survey.name}
        </Link>
      </SidebarMenuButton>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarMenuAction
              showOnHover
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </SidebarMenuAction>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete Survey</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </SidebarMenuItem>
  );
}
