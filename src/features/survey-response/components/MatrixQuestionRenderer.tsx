import React from 'react';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { MatrixAnswerValue, Question } from '@/types/survey';

interface MatrixQuestionRendererProps {
  question: Question;
  value?: MatrixAnswerValue;
  onChange: (value: MatrixAnswerValue) => void;
}

export const MatrixQuestionRenderer: React.FC<MatrixQuestionRendererProps> = ({
  question,
  value,
  onChange,
}) => {
  const selections = value?.selections || {};
  const columns = question.matrixColumns || [];

  return (
    <div className="space-y-4">
      <div
        className="grid gap-3 overflow-x-auto rounded-[24px] border border-border/70 bg-muted/10 p-4"
        style={{ gridTemplateColumns: `minmax(220px,1.5fr) repeat(${Math.max(columns.length, 1)}, minmax(88px, 1fr))` }}
      >
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Statement</div>
        {columns.map((column) => (
          <div key={column.id} className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {column.text}
          </div>
        ))}

        {question.options.map((row) => (
          <React.Fragment key={row.id}>
            <div className="flex items-center text-sm font-medium text-foreground">{row.text}</div>
            <RadioGroup
              value={selections[row.id] || ''}
              onValueChange={(selectedColumnId) =>
                onChange({
                  kind: 'matrix',
                  selections: {
                    ...selections,
                    [row.id]: selectedColumnId,
                  },
                })
              }
              className="contents"
            >
              {columns.map((column) => (
                <label
                  key={column.id}
                  htmlFor={`${question.id}-${row.id}-${column.id}`}
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-border/70 bg-background"
                >
                  <RadioGroupItem
                    id={`${question.id}-${row.id}-${column.id}`}
                    value={column.id}
                  />
                </label>
              ))}
            </RadioGroup>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
