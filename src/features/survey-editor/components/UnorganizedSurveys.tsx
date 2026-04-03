
import React from 'react';
import { Plus } from 'lucide-react';
import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Survey } from '@/types/survey-organization';
import { DraggableSurveyList } from './DraggableSurveyList';
import { Button } from '@/components/ui/button';

interface UnorganizedSurveysProps {
  surveys: Survey[];
  onCreateSurvey: () => void;
  onDeleteSurvey: (id: string) => void;
  onUpdateOrder: (activeId: string, overId?: string, targetFolderId?: string | null) => void;
  isCollapsed?: boolean;
  folders?: { id: string; name: string }[];
}

export function UnorganizedSurveys({
  surveys,
  onCreateSurvey,
  onDeleteSurvey,
  onUpdateOrder,
  isCollapsed = false,
  folders = []
}: UnorganizedSurveysProps) {
  const handleCreateSurveyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onCreateSurvey();
  };

  return (
    <SidebarGroup className="mt-3 px-3">
      <SidebarGroupLabel className="mb-1 flex h-8 items-center justify-between px-1.5 py-0">
        {!isCollapsed && (
          <span className="px-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Projects {surveys.length > 0 && `(${surveys.length})`}
          </span>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCreateSurveyClick}
                className="h-7 w-7 rounded-lg text-muted-foreground transition-colors hover:bg-muted/[0.18] hover:text-foreground"
                data-create-survey-btn
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-primary text-primary-foreground font-medium">
              <p>Create Survey</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </SidebarGroupLabel>
      <SidebarGroupContent className="list-none space-y-1">
        <DraggableSurveyList
          surveys={surveys}
          onDeleteSurvey={onDeleteSurvey}
          onUpdateOrder={onUpdateOrder}
          isCollapsed={isCollapsed}
          folders={folders}
        />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
