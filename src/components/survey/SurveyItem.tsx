
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { Trash2 } from 'lucide-react';
import { Survey } from '@/types/survey-organization';
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useMutateSurvey } from '@/hooks/survey/useMutateSurvey';
import { useQueryClient } from '@tanstack/react-query';

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
  const queryClient = useQueryClient();
  
  // Listen for updates to this survey in the cache
  useEffect(() => {
    setName(survey.name);
  }, [survey.name]);
  
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

  // Create our own style object without relying on CSS.Transform
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleEdit = async () => {
    setIsEditing(false);
    if (name !== survey.name) {
      try {
        await updateSurvey({
          surveyId: survey.id,
          updates: { 
            // Using title instead of name since that's the property in Survey type
            title: name 
          }
        });
        
        // Immediately update survey data in cache
        queryClient.setQueriesData({ queryKey: ['survey', survey.id] }, (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            title: name
          };
        });
        
        // Also invalidate the surveys list
        queryClient.invalidateQueries({ queryKey: ['surveys'] });
        
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
