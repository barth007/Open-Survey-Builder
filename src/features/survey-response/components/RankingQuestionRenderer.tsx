import React, { useEffect, useMemo } from 'react';
import { ArrowDown, ArrowUp, GripVertical } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { Question, RankingAnswerValue } from '@/types/survey';

interface RankingQuestionRendererProps {
  question: Question;
  value?: RankingAnswerValue;
  onChange: (value: RankingAnswerValue) => void;
}

export const RankingQuestionRenderer: React.FC<RankingQuestionRendererProps> = ({
  question,
  value,
  onChange,
}) => {
  const orderedOptionIds = useMemo(
    () => (value?.orderedOptionIds?.length ? value.orderedOptionIds : question.options.map((option) => option.id)),
    [question.options, value?.orderedOptionIds],
  );

  useEffect(() => {
    if (!value && question.options.length > 0) {
      onChange({
        kind: 'ranking',
        orderedOptionIds: question.options.map((option) => option.id),
      });
    }
  }, [onChange, question.options, value]);

  const moveOption = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= orderedOptionIds.length) {
      return;
    }

    const next = [...orderedOptionIds];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    onChange({ kind: 'ranking', orderedOptionIds: next });
  };

  return (
    <div className="space-y-3">
      {orderedOptionIds.map((optionId, index) => {
        const option = question.options.find((item) => item.id === optionId);

        if (!option) {
          return null;
        }

        return (
          <div key={option.id} className="flex items-center gap-3 rounded-[24px] border border-border/70 bg-muted/10 px-4 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-sm font-semibold text-muted-foreground">
              {index + 1}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-base font-medium text-foreground">{option.text}</div>
            </div>
            <div className="flex items-center gap-1">
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => moveOption(index, index - 1)}>
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => moveOption(index, index + 1)}>
                <ArrowDown className="h-4 w-4" />
              </Button>
              <GripVertical className="h-4 w-4 text-muted-foreground/60" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
