
import React from 'react';
import { Plus, FileText } from 'lucide-react';
import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Survey } from '@/types/survey-organization';
import { DraggableSurveyList } from './DraggableSurveyList';
import { Button } from '@/components/ui/button';

interface UnorganizedSurveysProps {
  surveys: Survey[];
  onCreateSurvey: () => void;
  onDeleteSurvey: (id: string) => void;
  onUpdateOrder: (activeId: string, overId: string) => void;
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
    <SidebarGroup>
      <SidebarGroupLabel className="flex justify-between items-center">
        {!isCollapsed && <span>Other Surveys {surveys.length > 0 && `(${surveys.length})`}</span>}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCreateSurveyClick}
                className="hover:bg-accent rounded-md p-1 h-6 w-6"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create Survey</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </SidebarGroupLabel>
      <SidebarGroupContent className="list-none">
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
