
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2 } from 'lucide-react';
import { Survey } from '@/types/survey-organization';
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useMutateSurvey } from '@/hooks/survey/useMutateSurvey';

interface DraggableSurveyItemProps {
  survey: Survey;
  onDelete: () => void;
  onUpdateOrder: (activeId: string, overId: string) => void;
  folderId?: string;
}

export function DraggableSurveyItem({ survey, onDelete, onUpdateOrder, folderId }: DraggableSurveyItemProps) {
  const { id: currentSurveyId } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(survey.name);
  const navigate = useNavigate();
  const { updateSurvey } = useMutateSurvey();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: survey.id,
    data: { survey, folderId }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleEdit = async () => {
    setIsEditing(false);
    if (name !== survey.name) {
      try {
        await updateSurvey({
          surveyId: survey.id,
          updates: { name }
        });
      } catch (error) {
        setName(survey.name);
      }
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "flex items-center w-full group",
        currentSurveyId === survey.id && "bg-accent text-accent-foreground rounded-md"
      )}
    >
      <SidebarMenuItem className="flex-1">
        <SidebarMenuButton
          asChild
          className="w-full"
          onClick={() => !isEditing && navigate(`/survey/${survey.id}`)}
          onDoubleClick={() => setIsEditing(true)}
        >
          {isEditing ? (
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEdit();
                if (e.key === 'Escape') {
                  setName(survey.name);
                  setIsEditing(false);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="h-8"
              autoFocus
            />
          ) : (
            <span className="truncate">{name}</span>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-sidebar-accent rounded-md mr-1"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete Survey</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
