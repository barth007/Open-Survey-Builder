import React from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { Question } from '@/types/survey';
import { EditorInsertGuide } from './EditorInsertGuide';
import { SortableQuestionCard } from './SortableQuestionCard';

interface QuestionSectionProps {
  questions: Question[];
  activeQuestionId: string | null;
  logicQuestionId?: string | null;
  onSelectQuestion: (questionId: string) => void;
  onActivateQuestion: (questionId: string, element: HTMLElement) => void;
  updateQuestion: (updatedQuestion: Question) => void;
  onUpdateQuestions: (updatedQuestions: Question[]) => void;
  onDeleteQuestion: (id: string) => void;
  onDuplicateQuestion?: (question: Question) => Question;
  onOpenInserter: (insertIndex?: number, rect?: DOMRect) => void;
  onCloseLogic?: () => void;
}

export const QuestionSection: React.FC<QuestionSectionProps> = ({
  questions,
  activeQuestionId,
  logicQuestionId = null,
  onSelectQuestion,
  onActivateQuestion,
  updateQuestion,
  onUpdateQuestions,
  onDeleteQuestion,
  onDuplicateQuestion,
  onOpenInserter,
  onCloseLogic,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);
      onUpdateQuestions(arrayMove(questions, oldIndex, newIndex));
    }
  };

  return (
    <div className="animate-fade-in-up px-1" onClick={(e) => e.stopPropagation()}>
      {questions.length === 0 ? (
        <EditorInsertGuide
          prominent
          label="Add your first block"
          description="Insert a question, content, or media block between the start page and the completion page."
          onInsert={(rect) => onOpenInserter(0, rect)}
        />
      ) : (
        <div className="space-y-1">
          <EditorInsertGuide
            label="Insert block here"
            onInsert={(rect) => onOpenInserter(0, rect)}
          />

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1">
                {questions.map((question, index) => (
                  <SortableQuestionCard
                    key={question.id}
                    question={question}
                    questions={questions}
                    isActive={question.id === activeQuestionId}
                    logicOpen={question.id === logicQuestionId}
                    onSelectQuestion={onSelectQuestion}
                    onActivateQuestion={onActivateQuestion}
                    onQuestionChange={updateQuestion}
                    onDeleteQuestion={onDeleteQuestion}
                    onDuplicateQuestion={onDuplicateQuestion}
                    onAddQuestionBelow={(rect) => onOpenInserter(index + 1, rect)}
                    onCloseLogic={onCloseLogic}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <EditorInsertGuide
            label="Insert block here"
            onInsert={(rect) => onOpenInserter(questions.length, rect)}
          />
        </div>
      )}
    </div>
  );
};
