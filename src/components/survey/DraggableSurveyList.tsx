
import React from 'react';
import { DraggableSurveyItem } from './SurveyItem';
import { Survey } from '@/types/survey-organization';

interface DraggableSurveyListProps {
  surveys: Survey[];
  onDeleteSurvey: (id: string) => void;
  onUpdateOrder: (activeId: string, overId: string) => void;
  folderId?: string;
  isCollapsed?: boolean;
  folders?: { id: string; name: string }[];
}

export function DraggableSurveyList({ 
  surveys, 
  onDeleteSurvey, 
  onUpdateOrder, 
  folderId,
  isCollapsed,
  folders = []
}: DraggableSurveyListProps) {
  return (
    <div className="space-y-1">
      {surveys.length === 0 ? (
        <div className="text-sm text-muted-foreground px-2 py-1 italic">
          {!isCollapsed && 'No surveys'}
        </div>
      ) : (
        surveys.map((survey) => (
          <DraggableSurveyItem
            key={survey.id}
            survey={survey}
            onDelete={() => onDeleteSurvey(survey.id)}
            onUpdateOrder={onUpdateOrder}
            folderId={folderId}
            isCollapsed={isCollapsed}
            folders={folders}
          />
        ))
      )}
    </div>
  );
}
