
import React from 'react';
import { Question } from '@/types/survey';
import QuestionCard from '@/components/QuestionCard';
import AddQuestionButton from '@/components/AddQuestionButton';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableQuestionCard } from './SortableQuestionCard';

interface QuestionSectionProps {
  questions: Question[];
  onQuestionChange: (updatedQuestion: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onDuplicateQuestion?: (question: Question) => Question;
  onAddQuestion: () => Question;
}

export const QuestionSection: React.FC<QuestionSectionProps> = ({
  questions,
  onQuestionChange,
  onDeleteQuestion,
  onDuplicateQuestion,
  onAddQuestion
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex(q => q.id === active.id);
      const newIndex = questions.findIndex(q => q.id === over.id);
      
      const newQuestions = arrayMove(questions, oldIndex, newIndex);
      
      // Update each question's position
      newQuestions.forEach((question, index) => {
        onQuestionChange({ ...question });
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Questions</h3>
        <AddQuestionButton onClick={onAddQuestion} />
      </div>
      
      {questions.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
            {questions.map((question) => (
              <SortableQuestionCard
                key={question.id}
                question={question}
                questions={questions}
                onQuestionChange={onQuestionChange}
                onDeleteQuestion={onDeleteQuestion}
                onDuplicateQuestion={onDuplicateQuestion}
              />
            ))}
          </SortableContext>
        </DndContext>
      ) : (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="mb-4">No questions added yet</p>
          <AddQuestionButton onClick={onAddQuestion} />
        </div>
      )}
    </div>
  );
};
