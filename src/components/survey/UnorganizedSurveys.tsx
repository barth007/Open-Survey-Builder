
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
}

export function UnorganizedSurveys({
  surveys,
  onCreateSurvey,
  onDeleteSurvey,
  onUpdateOrder
}: UnorganizedSurveysProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex justify-between items-center">
        <span>Other Surveys {surveys.length > 0 && `(${surveys.length})`}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onCreateSurvey}
                className="hover:bg-sidebar-accent rounded-md p-1"
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
      <SidebarGroupContent className="list-none"> {/* Add list-none to remove markers */}
        <DraggableSurveyList
          surveys={surveys}
          onDeleteSurvey={onDeleteSurvey}
          onUpdateOrder={onUpdateOrder}
        />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
