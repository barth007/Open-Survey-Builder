import React, { useMemo } from 'react';
import { Calculator, EyeOff, GripVertical, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Question, QuestionBlockType } from '@/types/survey';
import {
  EDITOR_BLOCKS,
  convertQuestionToBlock,
  getQuestionBlockGroup,
  getQuestionBlockLabel,
  getNormalizedBlockType,
  isBlockAvailable,
  isChoiceBlock,
  isContentBlock,
  isScaleBlock,
  isTextInputBlock,
} from '@/features/survey-editor/lib/editor-blocks';
import { useQuestionCardLogic } from '@/features/survey-editor/hooks/useQuestionCardLogic';
import QuestionCardMedia from './QuestionCardMedia';
import QuestionConditionalLogic from './QuestionConditionalLogic';

interface QuestionCardProps {
  question: Question;
  questions: Question[];
  onQuestionChange: (updatedQuestion: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onDuplicateQuestion?: (question: Question) => Question;
  isDragging?: boolean;
}

const BLOCK_GROUPS = ['Input', 'Choice', 'Rating & Ranking', 'Advanced', 'Structure', 'Media'] as const;

const hiddenDescriptionBlocks = new Set<QuestionBlockType>(['divider']);

const buildOptionLabel = (index: number): string => String.fromCharCode(65 + index);

const ContentPreview: React.FC<{ question: Question; blockType: QuestionBlockType }> = ({ question, blockType }) => {
  switch (blockType) {
    case 'heading':
      return <div className="text-4xl font-semibold tracking-tight text-foreground/90">{question.text || 'Section heading'}</div>;
    case 'label':
      return <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">{question.text || 'SECTION LABEL'}</div>;
    case 'textBlock':
      return <div className="max-w-2xl text-base leading-7 text-muted-foreground">{question.text || 'Add supporting context for this part of the form.'}</div>;
    case 'divider':
      return <div className="h-px w-full bg-border/80" />;
    case 'pageBreak':
      return (
        <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          Page break
        </div>
      );
    case 'image':
    case 'video':
    case 'audio':
      return (
        <div className="rounded-[24px] border border-dashed border-border/70 bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
          Add media below to show it inline in the form.
        </div>
      );
    case 'embed':
      return (
        <div className="rounded-[24px] border border-dashed border-border/70 bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
          Embedded content will appear here when an embed URL is added.
        </div>
      );
    default:
      return null;
  }
};

const UnsupportedResponsePreview: React.FC<{ label: string; description: string }> = ({ label, description }) => (
  <div className="rounded-[24px] border border-border/70 bg-muted/20 px-4 py-4">
    <div className="text-sm font-medium text-foreground/80">{label}</div>
    <div className="mt-1 text-sm leading-6 text-muted-foreground">{description}</div>
  </div>
);

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questions,
  onQuestionChange,
  onDeleteQuestion,
  onDuplicateQuestion,
  isDragging = false,
}) => {
  const {
    handleTextChange,
    handleDescriptionChange,
    handleRequiredChange,
    addOption,
    deleteOption,
    updateOptionText,
    handleMediaUpload,
    removeQuestionMedia,
  } = useQuestionCardLogic(question, questions, onQuestionChange, onDeleteQuestion, onDuplicateQuestion);

  const blockLabel = getQuestionBlockLabel(question);
  const blockGroup = getQuestionBlockGroup(question);
  const normalizedBlockType = getNormalizedBlockType(question);
  const isContent = isContentBlock(question);
  const isScale = isScaleBlock(question);
  const isTextInput = isTextInputBlock(question);
  const showOptions = isChoiceBlock(question) && question.type !== 'matrix';
  const isMatrix = question.type === 'matrix';
  const isAdvancedPlaceholder =
    question.type === 'fileUpload' ||
    question.type === 'signature' ||
    question.type === 'payment' ||
    question.type === 'recaptcha';
  const isHiddenField = question.type === 'hiddenField';
  const isCalculatedField = question.type === 'calculatedField';
  const isSystemBlock = isHiddenField || isCalculatedField;

  const groupedBlockOptions = useMemo(
    () =>
      BLOCK_GROUPS.map((group) => ({
        group,
        items: EDITOR_BLOCKS.filter((block) => block.group === group && block.id !== 'welcome' && block.id !== 'thanks'),
      })).filter((entry) => entry.items.length > 0),
    [],
  );

  const handleBlockTypeChange = (nextBlockType: string) => {
    onQuestionChange(convertQuestionToBlock(question, nextBlockType as QuestionBlockType));
  };

  const handlePlaceholderChange = (placeholder: string) => {
    onQuestionChange({ ...question, placeholder });
  };

  const handleEmbedUrlChange = (embedUrl: string) => {
    onQuestionChange({ ...question, embedUrl });
  };

  const handleFieldKeyChange = (fieldKey: string) => {
    onQuestionChange({ ...question, fieldKey });
  };

  const handleFieldDefaultValueChange = (fieldDefaultValue: string) => {
    onQuestionChange({ ...question, fieldDefaultValue });
  };

  const handleFieldNameChange = (fieldName: string) => {
    onQuestionChange({ ...question, fieldName });
  };

  const handleFieldValueTypeChange = (fieldValueType: 'number' | 'text') => {
    onQuestionChange({ ...question, fieldValueType, fieldInitialValue: fieldValueType === 'number' ? 0 : '' });
  };

  const handleFieldInitialValueChange = (raw: string) => {
    const fieldInitialValue = question.fieldValueType === 'number' ? (parseFloat(raw) || 0) : raw;
    onQuestionChange({ ...question, fieldInitialValue });
  };

  const handleMatrixRowChange = (optionId: string, text: string) => {
    onQuestionChange({
      ...question,
      options: question.options.map((option) => (option.id === optionId ? { ...option, text } : option)),
    });
  };

  const handleMatrixColumnChange = (optionId: string, text: string) => {
    onQuestionChange({
      ...question,
      matrixColumns: (question.matrixColumns || []).map((option) => (option.id === optionId ? { ...option, text } : option)),
    });
  };

  const addMatrixRow = () => {
    onQuestionChange({
      ...question,
      options: [...question.options, { id: crypto.randomUUID(), text: `Statement ${question.options.length + 1}` }],
    });
  };

  const addMatrixColumn = () => {
    onQuestionChange({
      ...question,
      matrixColumns: [...(question.matrixColumns || []), { id: crypto.randomUUID(), text: `Value ${(question.matrixColumns || []).length + 1}` }],
    });
  };

  const updateScaleLabel = (field: 'scaleLeftLabel' | 'scaleRightLabel', value: string) => {
    onQuestionChange({ ...question, [field]: value });
  };

  const renderResponsePreview = () => {
    if (isContent) {
      return <ContentPreview question={question} blockType={normalizedBlockType} />;
    }

    if (isTextInput) {
      if (question.inputType === 'textarea') {
        return (
          <Textarea
            disabled
            rows={4}
            placeholder={question.placeholder || 'Type your answer here...'}
            className="min-h-[120px] rounded-[24px] border-border/70 bg-muted/15 px-5 py-4 text-base shadow-none"
          />
        );
      }

      return (
        <Input
          disabled
          type={question.inputType === 'textarea' ? 'text' : question.inputType}
          placeholder={question.placeholder || 'Type your answer here...'}
          className="h-14 rounded-[24px] border-border/70 bg-muted/15 px-5 text-base shadow-none"
        />
      );
    }

    if (showOptions) {
      return (
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <div key={option.id} className="flex items-center gap-3 rounded-[22px] border border-border/70 bg-muted/15 px-4 py-3">
              {question.type === 'checkboxes' ? (
                <Checkbox disabled />
              ) : (
                <div className="flex h-5 w-5 items-center justify-center rounded-full border border-border/80 text-[11px] font-medium text-muted-foreground">
                  {buildOptionLabel(index)}
                </div>
              )}
              <span className="text-sm text-foreground/80">{option.text || `Option ${index + 1}`}</span>
            </div>
          ))}
        </div>
      );
    }

    if (isScale) {
      return (
        <div className="space-y-3 rounded-[24px] border border-border/70 bg-muted/15 px-5 py-5">
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${question.options.length}, minmax(0, 1fr))` }}>
            {question.options.map((option, index) => (
              <div key={option.id} className="flex flex-col items-center gap-2 rounded-[18px] border border-border/70 bg-background px-2 py-3 text-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/35 text-xs font-semibold">{index + 1}</div>
                <span className="text-[11px] leading-4 text-muted-foreground">{option.text}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (isMatrix) {
      const matrixColumns = question.matrixColumns || [];
      const matrixGridStyle = {
        gridTemplateColumns: `minmax(220px, 1.4fr) repeat(${Math.max(matrixColumns.length, 1)}, minmax(0, 1fr))`,
      };

      return (
        <div className="overflow-hidden rounded-[24px] border border-border/70 bg-muted/15">
          <div className="grid border-b border-border/70 bg-background/80 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground" style={matrixGridStyle}>
            <span>Statement</span>
            {matrixColumns.map((column) => (
              <span key={column.id} className="text-center">
                {column.text}
              </span>
            ))}
          </div>
          {question.options.map((row) => (
            <div key={row.id} className="grid items-center border-b border-border/50 px-4 py-4 last:border-b-0" style={matrixGridStyle}>
              <span className="text-sm text-foreground/80">{row.text}</span>
              {matrixColumns.map((column) => (
                <div key={column.id} className="flex justify-center">
                  <div className="h-5 w-5 rounded-full border border-border/80 bg-background" />
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    }

    if (question.type === 'ranking') {
      return (
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <div key={option.id} className="flex items-center gap-3 rounded-[22px] border border-border/70 bg-muted/15 px-4 py-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-background text-xs font-semibold text-muted-foreground">
                {index + 1}
              </div>
              <span className="text-sm text-foreground/80">{option.text}</span>
              <GripVertical className="ml-auto h-4 w-4 text-muted-foreground/60" />
            </div>
          ))}
        </div>
      );
    }

    if (isAdvancedPlaceholder) {
      return (
        <UnsupportedResponsePreview
          label={blockLabel}
          description={question.placeholder || 'This block is available in the editor and can be styled here before respondent-side support is fully wired in.'}
        />
      );
    }

    return null;
  };

  // System blocks (hidden field, calculated field) get a dedicated compact card
  if (isSystemBlock) {
    const Icon = isHiddenField ? EyeOff : Calculator;
    const label = isHiddenField ? 'Hidden field' : 'Calculated field';
    const description = isHiddenField
      ? 'Invisible to respondents. Value is read from the URL parameter matching the field key.'
      : 'Invisible to respondents. Holds a running value you can update via conditional logic.';

    return (
      <div
        className={cn(
          'rounded-[32px] border border-dashed border-border/70 bg-muted/[0.04] px-8 py-6 transition-all duration-200',
          isDragging && 'rotate-[0.5deg] scale-[1.01] shadow-[0_24px_80px_rgba(15,15,15,0.1)]',
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted/40 text-muted-foreground">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground/80">{label}</div>
              <div className="text-[11px] text-muted-foreground/60">{description}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onDuplicateQuestion && (
              <Button variant="ghost" size="sm" onClick={() => onDuplicateQuestion(question)} className="rounded-full text-muted-foreground hover:text-foreground">
                Duplicate
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => onDeleteQuestion(question.id)} className="rounded-full text-muted-foreground hover:text-destructive">
              Delete
            </Button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {isHiddenField && (
            <>
              <div className="space-y-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Field key</div>
                <Input
                  value={question.fieldKey || ''}
                  onChange={(e) => handleFieldKeyChange(e.target.value)}
                  placeholder="utm_source"
                  className="h-11 rounded-2xl border-border/70 bg-background shadow-none"
                />
                <p className="text-[11px] text-muted-foreground/60">Used in URL: <code className="font-mono">?{question.fieldKey || 'field_key'}=value</code></p>
              </div>
              <div className="space-y-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Default value</div>
                <Input
                  value={question.fieldDefaultValue || ''}
                  onChange={(e) => handleFieldDefaultValueChange(e.target.value)}
                  placeholder="(empty)"
                  className="h-11 rounded-2xl border-border/70 bg-background shadow-none"
                />
                <p className="text-[11px] text-muted-foreground/60">Used when the URL parameter is absent</p>
              </div>
            </>
          )}

          {isCalculatedField && (
            <>
              <div className="space-y-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Field name</div>
                <Input
                  value={question.fieldName || ''}
                  onChange={(e) => handleFieldNameChange(e.target.value)}
                  placeholder="score"
                  className="h-11 rounded-2xl border-border/70 bg-background shadow-none"
                />
              </div>
              <div className="space-y-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Type</div>
                <Select value={question.fieldValueType || 'number'} onValueChange={handleFieldValueTypeChange}>
                  <SelectTrigger className="h-11 rounded-2xl border-border/70 bg-background shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-[20px] border-border/70 p-2">
                    <SelectItem value="number" className="rounded-xl">Number</SelectItem>
                    <SelectItem value="text" className="rounded-xl">Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Initial value</div>
                <Input
                  type={question.fieldValueType === 'number' ? 'number' : 'text'}
                  value={String(question.fieldInitialValue ?? (question.fieldValueType === 'number' ? 0 : ''))}
                  onChange={(e) => handleFieldInitialValueChange(e.target.value)}
                  placeholder={question.fieldValueType === 'number' ? '0' : ''}
                  className="h-11 rounded-2xl border-border/70 bg-background shadow-none"
                />
                <p className="text-[11px] text-muted-foreground/60">Starting value before any logic runs</p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-[32px] border border-border/70 bg-background px-8 py-7 shadow-[0_10px_40px_rgba(15,15,15,0.05)] transition-all duration-200',
        isDragging && 'rotate-[0.5deg] scale-[1.01] shadow-[0_24px_80px_rgba(15,15,15,0.1)]',
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-border/70 bg-muted/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {blockGroup}
          </span>
          <TooltipProvider delayDuration={120}>
            <Select value={normalizedBlockType} onValueChange={handleBlockTypeChange}>
              <SelectTrigger className="h-9 w-[220px] rounded-full border-border/70 bg-background px-4 text-sm font-medium shadow-none">
                <span className="truncate">{blockLabel}</span>
              </SelectTrigger>
              <SelectContent className="rounded-[24px] border-border/70 p-2">
                {groupedBlockOptions.map((entry) => (
                  <SelectGroup key={entry.group}>
                    <SelectLabel className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      {entry.group}
                    </SelectLabel>
                    {entry.items.map((block) => {
                      const available = isBlockAvailable(block);

                      if (available) {
                        return (
                          <SelectItem key={block.id} value={block.id} className="rounded-2xl px-3 py-2">
                            {block.label}
                          </SelectItem>
                        );
                      }

                      return (
                        <Tooltip key={block.id}>
                          <TooltipTrigger asChild>
                            <div className="flex cursor-not-allowed items-center justify-between rounded-2xl px-3 py-2 text-sm text-muted-foreground/50">
                              <span>{block.label}</span>
                              <span className="rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em]">
                                Unavailable
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs leading-5">
                            {block.unavailableReason}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </TooltipProvider>
        </div>

        {!isContent && (
          <label className="flex items-center gap-3 rounded-full border border-border/70 bg-muted/15 px-4 py-2 text-sm text-muted-foreground">
            <Checkbox checked={question.isRequired} onCheckedChange={(checked) => handleRequiredChange(Boolean(checked))} />
            Required
          </label>
        )}
      </div>

      <div className="mt-6 space-y-6">
        <div className="space-y-3">
          <Textarea
            value={question.text}
            onChange={(event) => handleTextChange(event.target.value)}
            placeholder={isContent ? 'Write content...' : 'Untitled field'}
            rows={1}
            className={cn(
              'min-h-0 resize-none border-0 bg-transparent px-0 py-0 text-3xl font-semibold tracking-tight shadow-none focus-visible:ring-0',
              normalizedBlockType === 'label' && 'text-[11px] uppercase tracking-[0.28em] text-muted-foreground',
              normalizedBlockType === 'textBlock' && 'text-lg font-normal leading-8 text-muted-foreground',
              normalizedBlockType === 'divider' && 'sr-only',
            )}
          />

          {!hiddenDescriptionBlocks.has(normalizedBlockType) && !isContent && (
            <Textarea
              value={question.description || ''}
              onChange={(event) => handleDescriptionChange(event.target.value)}
              placeholder="Add a hint or context for respondents..."
              rows={1}
              className="min-h-0 resize-none border-0 bg-transparent px-0 py-0 text-base leading-7 text-muted-foreground shadow-none focus-visible:ring-0"
            />
          )}
        </div>

        {renderResponsePreview()}

        {isTextInput && (
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Placeholder</div>
              <Input
                value={question.placeholder || ''}
                onChange={(event) => handlePlaceholderChange(event.target.value)}
                placeholder="Type your answer here..."
                className="h-11 rounded-2xl border-border/70 bg-muted/15 shadow-none"
              />
            </div>
            {(normalizedBlockType === 'date' || normalizedBlockType === 'time') && (
              <div className="space-y-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Input type</div>
                <div className="flex h-11 items-center rounded-2xl border border-border/70 bg-muted/15 px-4 text-sm text-muted-foreground">
                  {question.inputType === 'date' ? 'Date picker' : 'Time picker'}
                </div>
              </div>
            )}
          </div>
        )}

        {showOptions && (
          <div className="space-y-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Options</div>
            {question.options.map((option, index) => (
              <div key={option.id} className="flex items-center gap-3 rounded-[22px] border border-border/70 bg-muted/15 px-4 py-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-background text-[11px] font-semibold text-muted-foreground">
                  {question.type === 'checkboxes' ? <Plus className="h-3.5 w-3.5" /> : buildOptionLabel(index)}
                </div>
                <Input
                  value={option.text}
                  onChange={(event) => updateOptionText(option.id, event.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="h-auto border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteOption(option.id)}
                  className="rounded-full text-muted-foreground hover:text-foreground"
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => addOption(`Option ${question.options.length + 1}`)}
              className="rounded-full border-border/70 bg-background px-4"
            >
              Add option
            </Button>
          </div>
        )}

        {isMatrix && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Rows</div>
              {question.options.map((option) => (
                <Input
                  key={option.id}
                  value={option.text}
                  onChange={(event) => handleMatrixRowChange(option.id, event.target.value)}
                  className="h-11 rounded-2xl border-border/70 bg-muted/15 shadow-none"
                />
              ))}
              <Button type="button" variant="outline" onClick={addMatrixRow} className="rounded-full border-border/70 bg-background px-4">
                Add row
              </Button>
            </div>
            <div className="space-y-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Columns</div>
              {(question.matrixColumns || []).map((column) => (
                <Input
                  key={column.id}
                  value={column.text}
                  onChange={(event) => handleMatrixColumnChange(column.id, event.target.value)}
                  className="h-11 rounded-2xl border-border/70 bg-muted/15 shadow-none"
                />
              ))}
              <Button type="button" variant="outline" onClick={addMatrixColumn} className="rounded-full border-border/70 bg-background px-4">
                Add column
              </Button>
            </div>
          </div>
        )}

        {isScale && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Left label</div>
              <Input
                value={question.scaleLeftLabel || ''}
                onChange={(event) => updateScaleLabel('scaleLeftLabel', event.target.value)}
                placeholder="Low"
                className="h-11 rounded-2xl border-border/70 bg-muted/15 shadow-none"
              />
            </div>
            <div className="space-y-2">
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Right label</div>
              <Input
                value={question.scaleRightLabel || ''}
                onChange={(event) => updateScaleLabel('scaleRightLabel', event.target.value)}
                placeholder="High"
                className="h-11 rounded-2xl border-border/70 bg-muted/15 shadow-none"
              />
            </div>
          </div>
        )}

        {(normalizedBlockType === 'image' || normalizedBlockType === 'video') && (
          <QuestionCardMedia
            media={question.media}
            onMediaUpload={handleMediaUpload}
            onMediaRemove={removeQuestionMedia}
          />
        )}

        {(normalizedBlockType === 'audio' || normalizedBlockType === 'embed' || normalizedBlockType === 'payment') && (
          <div className="space-y-2">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {normalizedBlockType === 'payment' ? 'Checkout URL' : 'Source URL'}
            </div>
            <Input
              value={question.embedUrl || ''}
              onChange={(event) => handleEmbedUrlChange(event.target.value)}
              placeholder="https://..."
              className="h-11 rounded-2xl border-border/70 bg-muted/15 shadow-none"
            />
          </div>
        )}

        {!isContent && (
          <QuestionConditionalLogic
            question={question}
            questions={questions}
            onQuestionChange={onQuestionChange}
          />
        )}
      </div>
    </div>
  );
};

export default QuestionCard;
