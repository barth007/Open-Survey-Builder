
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableSurveyItem } from './SurveyItem';
import { Survey } from '@/types/survey-organization';
import { buildSurveyListId } from '@/features/survey-editor/lib/sidebar-organization';
import { cn } from '@/lib/utils';

interface DraggableSurveyListProps {
  surveys: Survey[];
  onDeleteSurvey: (id: string) => void;
  onUpdateOrder: (activeId: string, overId?: string, targetFolderId?: string | null) => void;
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
  const surveyIds = surveys.map((survey) => survey.id);
  const { isOver, setNodeRef } = useDroppable({
    id: buildSurveyListId(folderId),
    data: {
      type: 'survey-list',
      folderId: folderId ?? null,
    },
  });

  return (
    <SortableContext items={surveyIds} strategy={verticalListSortingStrategy}>
      <div
        ref={setNodeRef}
        className={cn(
          "min-h-8 space-y-1 rounded-xl transition-colors",
          isOver && "bg-muted/[0.12]",
        )}
      >
        {surveys.length === 0 ? (
          <div className="px-2 py-1 text-sm italic text-muted-foreground">
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
    </SortableContext>
  );
}
