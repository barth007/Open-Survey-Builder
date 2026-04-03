import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { buildSubmissionRows } from '@/features/survey-editor/lib/submission-rows';
import type { Survey, SurveyResponse } from '@/types/survey';

import { SubmissionDetailSheet } from './SubmissionDetailSheet';

interface SubmissionsTableViewProps {
  survey: Survey;
  responses: SurveyResponse[];
}

export const SubmissionsTableView: React.FC<SubmissionsTableViewProps> = ({
  survey,
  responses,
}) => {
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'partial'>('all');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

  const submissionRows = useMemo(() => buildSubmissionRows(survey, responses), [survey, responses]);

  const getStatusLabel = (status: 'draft' | 'partial' | 'submitted') => {
    if (status === 'partial') {
      return 'Partial';
    }

    if (status === 'draft') {
      return 'Draft';
    }

    return 'Submitted';
  };

  const getStatusClasses = (status: 'draft' | 'partial' | 'submitted') => {
    if (status === 'partial') {
      return 'border-amber-200 bg-amber-50 text-amber-700';
    }

    if (status === 'draft') {
      return 'border-slate-200 bg-slate-50 text-slate-600';
    }

    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  };

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const searchedRows = normalizedSearch
      ? submissionRows.filter((row) => row.searchText.includes(normalizedSearch))
      : submissionRows;

    const rows = statusFilter === 'all'
      ? searchedRows
      : searchedRows.filter((row) => row.status === statusFilter);

    if (sortOrder === 'oldest') {
      return [...rows].reverse();
    }

    return rows;
  }, [search, sortOrder, statusFilter, submissionRows]);

  const selectedSubmission =
    filteredRows.find((row) => row.id === selectedSubmissionId) ||
    submissionRows.find((row) => row.id === selectedSubmissionId) ||
    null;

  return (
    <>
      <section className="overflow-hidden rounded-[32px] border border-border/70 bg-background shadow-[0_14px_36px_rgba(15,15,15,0.04)]">
        <div className="border-b border-border/60 px-4 py-4 sm:px-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/45" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search participant, email, or answers"
                className="h-12 rounded-full border-border/70 bg-muted/[0.14] pl-11 text-sm shadow-none focus-visible:ring-1"
              />
            </div>

            <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as 'newest' | 'oldest')}>
              <SelectTrigger className="h-12 rounded-full border-border/70 bg-muted/[0.14] px-4 text-sm shadow-none focus:ring-1">
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent className="rounded-[24px] border-border/70 p-2">
                <SelectItem value="newest" className="rounded-2xl">Newest first</SelectItem>
                <SelectItem value="oldest" className="rounded-2xl">Oldest first</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'submitted' | 'partial')}>
              <SelectTrigger className="h-12 rounded-full border-border/70 bg-muted/[0.14] px-4 text-sm shadow-none focus:ring-1">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent className="rounded-[24px] border-border/70 p-2">
                <SelectItem value="all" className="rounded-2xl">All responses</SelectItem>
                <SelectItem value="submitted" className="rounded-2xl">Submitted</SelectItem>
                <SelectItem value="partial" className="rounded-2xl">Partial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="mt-3 text-sm text-muted-foreground">
            {filteredRows.length} of {submissionRows.length} responses
          </p>
        </div>

        {filteredRows.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-lg font-semibold tracking-tight text-foreground">
              No matching submissions
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Adjust the search query to bring rows back into view.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 p-4 md:hidden">
              {filteredRows.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  className="w-full rounded-[24px] border border-border/70 bg-background px-4 py-4 text-left shadow-[0_10px_24px_rgba(15,15,15,0.04)]"
                  onClick={() => setSelectedSubmissionId(row.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words text-sm font-medium text-foreground">
                        {row.participantLabel}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {new Date(row.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <div className={`rounded-full border px-3 py-1 text-[11px] font-medium ${getStatusClasses(row.status)}`}>
                        {getStatusLabel(row.status)}
                      </div>
                      <div className="rounded-full border border-border/70 bg-muted/[0.16] px-3 py-1 text-[11px] font-medium text-muted-foreground">
                        {row.answerCount} answer{row.answerCount === 1 ? '' : 's'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {row.preview.slice(0, 2).map((item) => (
                      <div key={`${row.id}-${item.questionId}`} className="text-sm leading-5 text-muted-foreground">
                        <span className="font-medium text-foreground">{item.questionLabel}:</span>{' '}
                        <span>{item.valueLabel}</span>
                      </div>
                    ))}
                    {row.preview.length > 2 && (
                      <p className="text-xs font-medium text-muted-foreground">
                        + {row.preview.length - 2} more answers
                      </p>
                    )}
                    {row.hasRecording && (
                      <p className="text-xs font-medium text-muted-foreground">
                        Recording linked
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="hidden md:block">
              <Table className="min-w-[760px]">
                <TableHeader className="bg-muted/[0.18]">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Submitted at
                    </TableHead>
                    <TableHead className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Respondent
                    </TableHead>
                    <TableHead className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Answers
                    </TableHead>
                    <TableHead className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Preview
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer border-border/60 hover:bg-muted/[0.12]"
                      onClick={() => setSelectedSubmissionId(row.id)}
                    >
                      <TableCell className="px-5 py-4 text-sm text-muted-foreground">
                        {new Date(row.submittedAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-foreground">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-medium ${getStatusClasses(row.status)}`}>
                          {getStatusLabel(row.status)}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-foreground">
                        <div className="space-y-1">
                          <p className="break-words font-medium">{row.participantLabel}</p>
                          {row.hasRecording && (
                            <p className="text-xs text-muted-foreground">Recording linked</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-foreground">
                        {row.answerCount}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="space-y-1.5">
                          {row.preview.slice(0, 2).map((item) => (
                            <div key={`${row.id}-${item.questionId}`} className="text-sm leading-5 text-muted-foreground">
                              <span className="font-medium text-foreground">{item.questionLabel}:</span>{' '}
                              <span>{item.valueLabel}</span>
                            </div>
                          ))}
                          {row.preview.length > 2 && (
                            <p className="text-xs font-medium text-muted-foreground">
                              + {row.preview.length - 2} more answers
                            </p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </section>

      <SubmissionDetailSheet
        submission={selectedSubmission}
        open={selectedSubmission !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedSubmissionId(null);
          }
        }}
      />
    </>
  );
};
