
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, FileText, Pencil, FolderClosed, GripVertical } from 'lucide-react';
import { Survey } from '@/types/survey-organization';
import { SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useMutateSurvey } from '@/hooks/survey/useMutateSurvey';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { MoveSurveyDialog } from './MoveSurveyDialog';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";

interface DraggableSurveyItemProps {
  survey: Survey;
  onDelete: () => void;
  onUpdateOrder: (activeId: string, overId: string) => void;
  folderId?: string;
  isCollapsed?: boolean;
  folders?: { id: string; name: string }[];
}

export function DraggableSurveyItem({ 
  survey, 
  onDelete, 
  onUpdateOrder, 
  folderId,
  isCollapsed = false,
  folders = []
}: DraggableSurveyItemProps) {
  const { id: currentSurveyId } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(survey.name);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
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
          updates: { 
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

  const handleDoubleClick = () => {
    setIsEditing(true);
  };
  
  const handleRename = () => {
    setIsEditing(true);
  };
  
  const handleMoveSurvey = () => {
    setIsMoveDialogOpen(true);
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            ref={setNodeRef}
            style={style}
            className={cn(
              "flex items-center w-full group cursor-pointer relative",
              currentSurveyId === survey.id && "bg-accent text-accent-foreground rounded-md"
            )}
          >
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="absolute left-0 top-0 bottom-0 w-4 flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-50 hover:opacity-100 z-20"
            >
              <GripVertical className="h-3 w-3" />
            </div>

            <SidebarMenuItem className="flex-1 ml-4">
              <SidebarMenuButton
                className="w-full"
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
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem onClick={handleRename}>
            <Pencil className="mr-2 h-4 w-4" />
            Rename
          </ContextMenuItem>
          <ContextMenuItem onClick={handleMoveSurvey}>
            <FolderClosed className="mr-2 h-4 w-4" />
            Move to...
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      
      <MoveSurveyDialog 
        isOpen={isMoveDialogOpen}
        onClose={() => setIsMoveDialogOpen(false)}
        surveyId={survey.id}
        currentFolderId={folderId}
        folders={folders}
      />
    </>
  );
}
