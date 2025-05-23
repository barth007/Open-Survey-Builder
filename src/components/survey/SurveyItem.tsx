
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, FileText } from 'lucide-react';
import { Survey } from '@/types/survey-organization';
import { SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useMutateSurvey } from '@/hooks/survey/useMutateSurvey';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

interface DraggableSurveyItemProps {
  survey: Survey;
  onDelete: () => void;
  onUpdateOrder: (activeId: string, overId: string) => void;
  folderId?: string;
  isCollapsed?: boolean;
}

export function DraggableSurveyItem({ 
  survey, 
  onDelete, 
  onUpdateOrder, 
  folderId,
  isCollapsed = false
}: DraggableSurveyItemProps) {
  const { id: currentSurveyId } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(survey.name);
  const navigate = useNavigate();
  const { updateSurvey } = useMutateSurvey();
  const queryClient = useQueryClient();
  const { setOpen } = useSidebar();
  
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

  // Use CSS.Transform instead of creating our own style
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Make sure these handlers match the expected parameter types
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

  const handleSurveyClick = () => {
    // If sidebar is collapsed, open it first
    if (isCollapsed) {
      setOpen(true);
    }
    navigate(`/survey/${survey.id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete();
  };

  // Modified to match the expected signature: () => void
  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        "flex items-center w-full group cursor-pointer",
        currentSurveyId === survey.id && "bg-accent text-accent-foreground rounded-md"
      )}
    >
      <SidebarMenuItem className="flex-1">
        <div
          {...listeners}
          className="absolute inset-0 z-10 cursor-move opacity-0"
          aria-label="Drag handle"
        />
        <SidebarMenuButton
          className="w-full relative z-20"
          onClick={handleSurveyClick}
          onDoubleClick={handleDoubleClick}
        >
          <div className="flex items-center justify-between w-full">
            {isEditing ? (
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleEdit}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEdit();
                  if (e.key === 'Escape') {
                    setName(survey.name);
                    setIsEditing(false);
                  }
                }}
                className="h-8"
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-2 truncate">
                <FileText className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span className="truncate">{name}</span>}
              </div>
            )}
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {!isCollapsed && !isEditing && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDeleteClick}
          className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 mr-1 z-30 relative"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      )}
    </div>
  );
}
