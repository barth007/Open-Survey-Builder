
import React from 'react';
import { Plus } from 'lucide-react';
import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Survey } from '@/types/survey-organization';
import { DraggableSurveyList } from './DraggableSurveyList';

interface UnorganizedSurveysProps {
  surveys: Survey[];
  onCreateSurvey: () => void;
  onDeleteSurvey: (id: string) => void;
  onUpdateOrder: (activeId: string, overId: string) => void;
  isCollapsed?: boolean;
}

export function UnorganizedSurveys({
  surveys,
  onCreateSurvey,
  onDeleteSurvey,
  onUpdateOrder,
  isCollapsed = false
}: UnorganizedSurveysProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex justify-between items-center">
        {!isCollapsed && <span>Other Surveys {surveys.length > 0 && `(${surveys.length})`}</span>}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onCreateSurvey}
                className="hover:bg-sidebar-accent rounded-md p-1 ml-auto"
              >
                <Plus className="h-4 w-4" />
              </button>
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
        />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
