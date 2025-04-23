
import React from 'react';
import { Link } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2 } from 'lucide-react';
import { Survey } from '@/types/survey-organization';
import { SidebarMenuItem, SidebarMenuButton, SidebarMenuAction } from "@/components/ui/sidebar";

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
  } = useSortable({ id: survey.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <SidebarMenuItem ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <SidebarMenuButton asChild>
        <Link to={`/survey/${survey.id}`} className="w-full justify-start">
          {survey.name}
        </Link>
      </SidebarMenuButton>
      
      <SidebarMenuAction
        showOnHover
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
      </SidebarMenuAction>
    </SidebarMenuItem>
  );
}
