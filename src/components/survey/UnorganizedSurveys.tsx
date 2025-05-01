
import React from 'react';
import { Plus } from 'lucide-react';
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
    <div className="mb-4">
      <div className="text-sm font-medium mb-2 flex justify-between items-center">
        <span>Other Surveys {surveys.length > 0 && `(${surveys.length})`}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onCreateSurvey}
                className="hover:bg-gray-100 rounded-md p-1"
              >
                <Plus className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create Survey</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="space-y-1 list-none">
        <DraggableSurveyList
          surveys={surveys}
          onDeleteSurvey={onDeleteSurvey}
          onUpdateOrder={onUpdateOrder}
        />
      </div>
    </div>
  );
}
