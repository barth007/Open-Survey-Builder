
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2 } from 'lucide-react';
import { Survey } from '@/types/survey-organization';
import { SidebarMenuItem, SidebarMenuButton, SidebarMenuAction } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface DraggableSurveyItemProps {
  survey: Survey;
  onDelete: (e: React.MouseEvent) => void;
}

export function DraggableSurveyItem({ survey, onDelete }: DraggableSurveyItemProps) {
  const { id: currentSurveyId } = useParams();
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

  const isSelected = currentSurveyId === survey.id;

  return (
    <SidebarMenuItem ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <SidebarMenuButton asChild>
        <Link 
          to={`/survey/${survey.id}`} 
          className={cn(
            "w-full justify-start",
            isSelected && "bg-accent text-accent-foreground font-medium"
          )}
        >
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
