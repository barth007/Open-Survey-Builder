
import React from 'react';
import { Plus } from 'lucide-react';
import { Survey } from '@/types/survey-organization';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableSurveyItem } from './DraggableSurveyItem';

interface UnorganizedSurveysSectionProps {
  surveys: Survey[];
  onCreateSurvey: () => void;
  onDeleteSurvey: (surveyId: string, e: React.MouseEvent) => void;
}

export function UnorganizedSurveysSection({
  surveys,
  onCreateSurvey,
  onDeleteSurvey,
}: UnorganizedSurveysSectionProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex justify-between items-center">
        <span>Other Surveys</span>
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
      <SidebarGroupContent>
        <SortableContext
          items={surveys}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1" data-folder-id={null}>
            {surveys.map((survey) => (
              <DraggableSurveyItem
                key={survey.id}
                survey={survey}
                onDelete={(e) => onDeleteSurvey(survey.id, e)}
              />
            ))}
          </div>
        </SortableContext>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
