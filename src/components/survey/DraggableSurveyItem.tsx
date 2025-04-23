
import React, { useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2 } from 'lucide-react';
import { Survey } from '@/types/survey-organization';
import { SidebarMenuItem, SidebarMenuButton, SidebarMenuAction } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useMutateSurvey } from '@/hooks/survey/useMutateSurvey';

interface DraggableSurveyItemProps {
  survey: Survey;
  onDelete: (e: React.MouseEvent) => void;
}

export function DraggableSurveyItem({ survey, onDelete }: DraggableSurveyItemProps) {
  const { id: currentSurveyId } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(survey.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const { updateSurvey } = useMutateSurvey();

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

  return (
    <SidebarMenuItem 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={cn(
        isSelected ? "bg-accent/80 text-accent-foreground" : ""
      )}
    >
      <SidebarMenuButton asChild>
        {isEditing ? (
          <Input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="h-8 w-full bg-background"
            onClick={(e) => e.preventDefault()}
          />
        ) : (
          <Link 
            to={`/survey/${survey.id}`} 
            className={cn(
              "w-full justify-start",
              isSelected && "font-bold"
            )}
            onDoubleClick={handleDoubleClick}
          >
            {name}
          </Link>
        )}
      </SidebarMenuButton>
      
      {/* Move TooltipProvider outside of the SidebarMenuItem */}
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
