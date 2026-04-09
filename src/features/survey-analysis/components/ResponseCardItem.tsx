import React from 'react';
import { Archive, BarChart3, FileText, PieChart as PieChartIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

import { ResponseChartRenderer } from './ResponseChartRenderer';

interface ResponseData {
  answer: string;
  count: number;
  percentage?: number;
}

interface ResponseGroup {
  questionId: string;
  question: string;
  responses: ResponseData[];
  likert: boolean;
  questionType: string;
  isOrphaned?: boolean;
}

interface ResponseCardItemProps {
  item: ResponseGroup;
  chartType: 'bar' | 'pie';
  onChartTypeChange: (questionId: string, type: 'bar' | 'pie') => void;
  isSelected?: boolean;
  onClick?: () => void;
}

const getQuestionTypeLabel = (questionType: string, isOrphaned: boolean): string => {
  if (isOrphaned) return 'Archived';
  if (questionType === 'multipleChoice') return 'Multiple choice';
  if (questionType === 'checkboxes') return 'Checkboxes';
  if (questionType === 'likert5') return 'Likert 5';
  if (questionType === 'likert7') return 'Likert 7';
  if (questionType === 'likert10') return 'Likert 10';
  return questionType;
};

export const ResponseCardItem: React.FC<ResponseCardItemProps> = ({
  item,
  chartType,
  onChartTypeChange,
  isSelected,
  onClick,
}) => {
  const supportsCharts = ['multipleChoice', 'checkboxes', 'likert5', 'likert7', 'likert10'].includes(item.questionType);
  const isOrphaned = item.isOrphaned;
  const totalCount = item.responses.reduce((sum, response) => sum + response.count, 0);

  return (
    <Card
      onClick={onClick}
      className={cn(
        'overflow-hidden rounded-[32px] border border-border/70 bg-background shadow-[0_14px_36px_rgba(15,15,15,0.04)] cursor-pointer transition-all duration-200',
        isSelected && 'ring-2 ring-blue-500 border-blue-200',
        isOrphaned && 'border-orange-200 bg-orange-50/50',
      )}
    >
      <CardHeader className="border-b border-border/60 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  'rounded-full border-border/70 bg-muted/[0.18] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground',
                  isOrphaned && 'border-orange-200 bg-orange-100 text-orange-700',
                )}
              >
                {getQuestionTypeLabel(item.questionType, Boolean(isOrphaned))}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {totalCount} response{totalCount === 1 ? '' : 's'}
              </span>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-muted/[0.18]">
                {isOrphaned ? (
                  <Archive className="h-4 w-4 text-orange-600" />
                ) : item.questionType === 'text' ? (
                  <FileText className="h-4 w-4 text-foreground/70" />
                ) : (
                  <BarChart3 className="h-4 w-4 text-foreground/70" />
                )}
              </div>
              <CardTitle className={cn('pt-0.5 text-xl font-semibold tracking-tight text-foreground sm:text-2xl', isOrphaned && 'text-orange-700')}>
                {item.question}
              </CardTitle>
            </div>
          </div>

          {supportsCharts && !isOrphaned && (
            <ToggleGroup
              type="single"
              value={chartType}
              onValueChange={(value) => {
                if (value) {
                  onChartTypeChange(item.questionId, value as 'bar' | 'pie');
                }
              }}
              className="rounded-full border border-border/70 bg-muted/[0.18] p-1"
            >
              <ToggleGroupItem
                value="bar"
                className="h-8 w-8 rounded-full data-[state=on]:bg-background data-[state=on]:shadow-sm"
              >
                <BarChart3 className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="pie"
                className="h-8 w-8 rounded-full data-[state=on]:bg-background data-[state=on]:shadow-sm"
              >
                <PieChartIcon className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5 px-5 py-5 sm:px-6">
        {supportsCharts && !isOrphaned ? (
          <div className="overflow-hidden rounded-[26px] border border-border/70 bg-muted/[0.14] p-4">
            <ResponseChartRenderer
              chartType={chartType}
              data={item.responses}
              isLikert={item.likert}
            />
          </div>
        ) : (
          <div className="rounded-[26px] border border-dashed border-border/70 bg-muted/[0.14] px-6 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-3xl border border-border/70 bg-background">
              {isOrphaned ? (
                <Archive className="h-5 w-5 text-orange-600" />
              ) : (
                <FileText className="h-5 w-5 text-muted-foreground/70" />
              )}
            </div>
            <p className={cn('mt-4 text-sm leading-6 text-muted-foreground', isOrphaned && 'text-orange-700')}>
              {isOrphaned
                ? 'These answers belong to a question that is no longer part of the current survey.'
                : 'Text answers are listed below in the form they were submitted.'}
            </p>
          </div>
        )}

        <div className="overflow-hidden rounded-[26px] border border-border/70 bg-background">
          <Table>
            <TableHeader className="bg-muted/[0.18]">
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Answer
                </TableHead>
                <TableHead className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Count
                </TableHead>
                <TableHead className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Share
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {item.responses.slice(0, 10).map((response, index) => (
                <TableRow key={`${response.answer}-${index}`} className="border-border/60">
                  <TableCell className="px-5 py-4 text-sm leading-6 text-foreground">
                    <div className="whitespace-normal break-words">
                      {response.answer}
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-right text-sm font-medium text-foreground">
                    {response.count}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-right">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full border border-border/70 bg-muted/[0.18] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground',
                        isOrphaned && 'border-orange-200 bg-orange-100 text-orange-700',
                      )}
                    >
                      {response.percentage}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}

              {item.responses.length > 10 && (
                <TableRow className="border-border/60 bg-muted/[0.14]">
                  <TableCell colSpan={3} className="px-5 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    + {item.responses.length - 10} more answer variations
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
