
import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Survey } from '@/types/survey-organization';
import { DraggableSurveyItem } from './SurveyItem';

interface DraggableSurveyListProps {
  surveys: Survey[];
  onDeleteSurvey: (id: string) => void;
  onUpdateOrder: (activeId: string, overId: string) => void;
  folderId?: string;
}

export function DraggableSurveyList({
  surveys,
  onDeleteSurvey,
  onUpdateOrder,
  folderId
}: DraggableSurveyListProps) {
  return (
    <SortableContext items={surveys} strategy={verticalListSortingStrategy}>
      <div className="space-y-1" data-folder-id={folderId || null}>
        {surveys.map((survey) => (
          <DraggableSurveyItem
            key={survey.id}
            survey={survey}
            onDelete={() => onDeleteSurvey(survey.id)}
            onUpdateOrder={onUpdateOrder}
            folderId={folderId}
          />
        ))}
      </div>
    </SortableContext>
  );
}
