import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2 } from 'lucide-react';
import { Survey } from '@/types/survey-organization';
import { SidebarMenuItem, SidebarMenuButton, SidebarMenuAction } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useMutateSurvey } from '@/hooks/survey/useMutateSurvey';

interface DraggableSurveyItemProps {
  survey: Survey;
  onDelete: (e: React.MouseEvent) => void;
  folderId?: string;
}

export function DraggableSurveyItem({ survey, onDelete, folderId }: DraggableSurveyItemProps) {
  const { id: currentSurveyId } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(survey.name);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { updateSurvey } = useMutateSurvey();
  const navigate = useNavigate();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: survey.id,
    data: {
      survey,
      folderId
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1,
  };

  const isSelected = currentSurveyId === survey.id;

  const handleDoubleClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.select();
    }, 0);
  };

  const handleBlur = async () => {
    setIsEditing(false);
    if (name !== survey.name) {
      try {
        await updateSurvey({
          surveyId: survey.id,
          updates: { name }
        });
      } catch (error) {
        setName(survey.name); // Reset on error
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setName(survey.name);
      setIsEditing(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isEditing) {
      navigate(`/survey/${survey.id}`);
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={cn(
        "flex items-center w-full",
        isSelected ? "bg-accent/80 text-accent-foreground rounded-md" : ""
      )}
      data-survey-id={survey.id}
      data-folder-id={folderId || "null"}
    >
      <SidebarMenuItem className="w-full flex-1">
        <SidebarMenuButton asChild className="w-full">
          {isEditing ? (
            <Input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="h-8 w-full bg-background"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div 
              className={cn(
                "w-full cursor-pointer py-2 px-3",
                isSelected ? "font-bold" : ""
              )}
              onClick={handleClick}
              onDoubleClick={handleDoubleClick}
            >
              {name}
            </div>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarMenuAction
              className="mr-1"
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
    </div>
  );
}
