
import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Survey } from '@/types/survey-organization';
import { DraggableSurveyItem } from './SurveyItem';

interface DraggableSurveyListProps {
  surveys: Survey[];
  onDeleteSurvey: (id: string) => void;
  onUpdateOrder: (activeId: string, overId: string) => void;
  folderId?: string;
  isCollapsed?: boolean;
}

export function DraggableSurveyList({
  surveys,
  onDeleteSurvey,
  onUpdateOrder,
  folderId,
  isCollapsed = false
}: DraggableSurveyListProps) {
  return (
    <SortableContext items={surveys.map(survey => survey.id)} strategy={verticalListSortingStrategy}>
      <div className="space-y-1" data-folder-id={folderId || "unorganized"}>
        {surveys.map((survey) => (
          <DraggableSurveyItem
            key={survey.id}
            survey={survey}
            onDelete={() => onDeleteSurvey(survey.id)}
            onUpdateOrder={onUpdateOrder}
            folderId={folderId}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>
    </SortableContext>
  );
}
