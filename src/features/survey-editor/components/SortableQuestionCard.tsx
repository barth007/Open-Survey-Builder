import React, { useCallback, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GitBranch, MoreHorizontal, Plus, GripVertical, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Question } from '@/types/survey';
import QuestionInlineEditor from './QuestionInlineEditor';
import QuestionConditionalLogic from './QuestionConditionalLogic';

interface SortableQuestionCardProps {
  question: Question;
  questions: Question[];
  isActive: boolean;
  logicOpen?: boolean;
  onSelectQuestion: (questionId: string) => void;
  onActivateQuestion: (questionId: string, element: HTMLElement) => void;
  onQuestionChange: (updatedQuestion: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onDuplicateQuestion?: (question: Question) => Question;
  onAddQuestionBelow?: (rect: DOMRect) => void;
  onCloseLogic?: () => void;
}

export const SortableQuestionCard: React.FC<SortableQuestionCardProps> = ({
  question,
  questions,
  isActive,
  logicOpen = false,
  onSelectQuestion,
  onActivateQuestion,
  onQuestionChange,
  onDeleteQuestion,
  onDuplicateQuestion,
  onAddQuestionBelow,
  onCloseLogic,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const railRef = useRef<HTMLDivElement>(null);

  const handleActivate = useCallback((element: HTMLElement) => {
    onActivateQuestion(question.id, element);
  }, [onActivateQuestion, question.id]);

  const openMenuFromRail = useCallback((fallbackElement: HTMLElement) => {
    handleActivate(railRef.current ?? fallbackElement);
  }, [handleActivate]);

  return (
    <div ref={setNodeRef} style={style} className="group/sortable relative">
      {/* Left gutter: block options, add below, drag handle */}
      <div
        ref={railRef}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          openMenuFromRail(e.currentTarget);
        }}
        className={cn(
          'absolute -left-10 top-6 flex flex-col items-center gap-1 transition-opacity duration-200',
          'opacity-100 pointer-events-auto md:opacity-0 md:pointer-events-none',
          'md:group-hover/sortable:opacity-100 md:group-hover/sortable:pointer-events-auto',
          'md:group-focus-within/sortable:opacity-100 md:group-focus-within/sortable:pointer-events-auto',
          (isActive || logicOpen) && 'md:opacity-100 md:pointer-events-auto',
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-xl border border-border/60 bg-background text-muted-foreground/50 shadow-sm hover:text-foreground hover:bg-background"
          onClick={(e) => {
            e.stopPropagation();
            openMenuFromRail(e.currentTarget);
          }}
          title="Block options"
          aria-label="Block options"
        >
          <MoreHorizontal size={13} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-xl border border-border/60 bg-background text-muted-foreground/50 shadow-sm hover:text-foreground hover:bg-background"
          onClick={(e) => {
            e.stopPropagation();
            onAddQuestionBelow?.(e.currentTarget.getBoundingClientRect());
          }}
          title="Add block below"
        >
          <Plus size={13} />
        </Button>
        <div
          {...attributes}
          {...listeners}
          className="flex h-7 w-7 cursor-grab items-center justify-center rounded-xl border border-border/60 bg-background text-muted-foreground/50 shadow-sm hover:text-foreground active:cursor-grabbing"
          title="Drag to reorder"
        >
          <GripVertical size={13} />
        </div>
      </div>

      <QuestionInlineEditor
        question={question}
        isActive={isActive}
        isDragging={isDragging}
        onSelect={() => onSelectQuestion(question.id)}
        onQuestionChange={onQuestionChange}
      />

      {/* Conditional logic — expands inline below this block */}
      {logicOpen && (
        <div className="mt-1 animate-in fade-in slide-in-from-top-2 duration-200" onClick={(e) => e.stopPropagation()}>
          <div className="rounded-2xl border border-border/60 bg-background overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/40 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <GitBranch className="h-3.5 w-3.5 text-muted-foreground/50" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50">
                  Conditional Logic
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onCloseLogic}
                className="h-7 w-7 rounded-lg text-muted-foreground/40 hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="p-5">
              <QuestionConditionalLogic
                question={question}
                questions={questions}
                onQuestionChange={onQuestionChange}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
