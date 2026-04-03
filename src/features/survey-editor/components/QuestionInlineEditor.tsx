import React, { useCallback } from 'react';
import { Calculator, EyeOff, GripVertical, Link2, Trash2, Volume2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { Question, QuestionBlockType } from '@/types/survey';
import {
  getNormalizedBlockType,
  isChoiceBlock,
  isContentBlock,
  isScaleBlock,
  isTextInputBlock,
} from '@/features/survey-editor/lib/editor-blocks';
import { useQuestionMedia } from '@/features/survey-editor/hooks/useQuestionMedia';

interface QuestionInlineEditorProps {
  question: Question;
  isActive: boolean;
  isDragging?: boolean;
  onActivate?: (element: HTMLElement) => void;
  onSelect?: () => void;
  onQuestionChange: (updated: Question) => void;
}

// ── Read-only previews ───────────────────────────────────────────────────────

const buildBadge = (index: number, badgeType: 'off' | 'letters' | 'numbers' = 'letters'): string | null => {
  if (badgeType === 'off') return null;
  if (badgeType === 'numbers') return String(index + 1);
  return String.fromCharCode(65 + index);
};

const ChoicePreview: React.FC<{ question: Question }> = ({ question }) => {
  const blockType = getNormalizedBlockType(question);
  const badge = question.badgeType ?? 'letters';

  if (blockType === 'dropdown') {
    return (
      <select
        disabled
        className="mt-4 h-12 w-full rounded-2xl border border-border/60 bg-muted/10 px-4 text-sm text-foreground/70 shadow-none outline-none"
      >
        <option>Select an option</option>
        {question.options.map((option) => (
          <option key={option.id}>{option.text || 'Option'}</option>
        ))}
      </select>
    );
  }

  if (blockType === 'multiSelect') {
    return (
      <select
        disabled
        multiple
        className="mt-4 min-h-[144px] w-full rounded-2xl border border-border/60 bg-muted/10 px-4 py-3 text-sm text-foreground/70 shadow-none outline-none"
      >
        {question.options.map((option) => (
          <option key={option.id}>{option.text || 'Option'}</option>
        ))}
      </select>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      {question.options.map((option, index) => (
        <div
          key={option.id}
          className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/15 px-4 py-3"
        >
          {question.type === 'checkboxes' ? (
            <Checkbox disabled className="shrink-0" />
          ) : (
            badge !== 'off' && (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-background text-[11px] font-semibold text-muted-foreground border border-border/60">
                {buildBadge(index, badge)}
              </div>
            )
          )}
          <span className="text-sm text-foreground/80">{option.text || `Option ${index + 1}`}</span>
        </div>
      ))}
      {question.allowOther && (
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border/60 bg-muted/10 px-4 py-3">
          {question.type !== 'checkboxes' && badge !== 'off' && (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-background text-[11px] font-semibold text-muted-foreground border border-border/60">
              {buildBadge(question.options.length, badge)}
            </div>
          )}
          <span className="text-sm italic text-muted-foreground/60">Other…</span>
        </div>
      )}
    </div>
  );
};

const ScalePreview: React.FC<{ question: Question }> = ({ question }) => {
  const start = question.scaleStart ?? 0;
  const end = question.scaleEnd ?? (question.options.length > 0 ? question.options.length - 1 : 10);
  const step = question.scaleStep ?? 1;
  const ticks: number[] = [];
  for (let v = start; v <= end; v += step) ticks.push(v);
  const display = ticks.length > 12 ? ticks.filter((_, i) => i % Math.ceil(ticks.length / 12) === 0) : ticks;

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap gap-2">
        {display.map((v) => (
          <div
            key={v}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/15 text-sm font-medium text-foreground/70"
          >
            {v}
          </div>
        ))}
      </div>
      {(question.scaleLeftLabel || question.scaleCenterLabel || question.scaleRightLabel) && (
        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground/70">
          <div className="text-left">{question.scaleLeftLabel || ''}</div>
          <div className="text-center">{question.scaleCenterLabel || ''}</div>
          <div className="text-right">{question.scaleRightLabel || ''}</div>
        </div>
      )}
    </div>
  );
};

const TextInputPreview: React.FC<{ question: Question }> = ({ question }) => {
  if (question.inputType === 'textarea') {
    return (
      <Textarea
        disabled
        rows={3}
        placeholder={question.placeholder || 'Type your answer here…'}
        className="mt-4 min-h-0 rounded-2xl border-border/60 bg-muted/10 shadow-none"
      />
    );
  }
  return (
    <Input
      disabled
      placeholder={question.placeholder || 'Type your answer here…'}
      className="mt-4 h-12 rounded-2xl border-border/60 bg-muted/10 shadow-none"
    />
  );
};

const ContentEditor: React.FC<{
  question: Question;
  blockType: QuestionBlockType;
  onChange: (text: string) => void;
}> = ({ question, blockType, onChange }) => {
  if (blockType === 'divider') {
    return <div className="mt-4 h-px w-full bg-border/70" />;
  }

  if (blockType === 'pageBreak') {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-border/60 bg-muted/10 px-4 py-3 text-sm text-muted-foreground">
        Page break — respondents move to the next page
      </div>
    );
  }

  const sharedProps = {
    value: question.text,
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value),
    onClick: (e: React.MouseEvent) => e.stopPropagation(),
    rows: 1,
  };

  switch (blockType) {
    case 'title':
      return (
        <Textarea
          {...sharedProps}
          placeholder="Page title"
          className="min-h-0 w-full resize-none border-0 bg-transparent px-0 py-0 text-5xl font-bold tracking-tight text-foreground/90 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/30"
        />
      );
    case 'heading1':
    case 'heading':
      return (
        <Textarea
          {...sharedProps}
          placeholder="Section heading"
          className="min-h-0 w-full resize-none border-0 bg-transparent px-0 py-0 text-4xl font-semibold tracking-tight text-foreground/90 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/30"
        />
      );
    case 'heading2':
      return (
        <Textarea
          {...sharedProps}
          placeholder="Subsection heading"
          className="min-h-0 w-full resize-none border-0 bg-transparent px-0 py-0 text-2xl font-semibold text-foreground/80 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/30"
        />
      );
    case 'heading3':
      return (
        <Textarea
          {...sharedProps}
          placeholder="Minor heading"
          className="min-h-0 w-full resize-none border-0 bg-transparent px-0 py-0 text-xl font-semibold text-foreground/70 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/30"
        />
      );
    case 'label':
      return (
        <Textarea
          {...sharedProps}
          placeholder="SECTION LABEL"
          className="min-h-0 w-full resize-none border-0 bg-transparent px-0 py-0 text-[11px] font-bold uppercase tracking-[0.28em] text-muted-foreground shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40"
        />
      );
    case 'textBlock':
      return (
        <Textarea
          value={question.text}
          onChange={(e) => onChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          rows={3}
          placeholder="Add supporting context for this part of the form."
          className="min-h-0 w-full resize-none border-0 bg-transparent px-0 py-0 text-base leading-7 text-muted-foreground shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/30"
        />
      );
    default:
      return null;
  }
};

const MediaBlockPreview: React.FC<{ question: Question; blockType: QuestionBlockType }> = ({
  question,
  blockType,
}) => {
  if ((blockType === 'image' || blockType === 'video') && question.media?.url) {
    return (
      <div className="mt-4 overflow-hidden rounded-3xl border border-border/60 bg-muted/[0.04]">
        {question.media.type === 'image' ? (
          <img
            src={question.media.url}
            alt={question.text || 'Uploaded media'}
            className="max-h-80 w-full object-contain bg-muted/[0.06]"
          />
        ) : (
          <video
            src={question.media.url}
            controls
            className="max-h-80 w-full bg-black/80"
          />
        )}
      </div>
    );
  }

  if (blockType === 'audio' && question.embedUrl) {
    return (
      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/10 px-4 py-4 text-sm text-foreground/75">
        <Volume2 className="h-4 w-4 text-muted-foreground" />
        <span className="truncate">{question.embedUrl}</span>
      </div>
    );
  }

  if ((blockType === 'embed' || blockType === 'payment') && question.embedUrl) {
    return (
      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/10 px-4 py-4 text-sm text-foreground/75">
        <Link2 className="h-4 w-4 text-muted-foreground" />
        <span className="truncate">{question.embedUrl}</span>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-dashed border-border/60 bg-muted/10 px-4 py-4 text-sm text-muted-foreground/60">
      {blockType === 'payment'
        ? 'Add a checkout URL inline.'
        : blockType === 'embed'
          ? 'Add an embed URL inline.'
          : blockType === 'audio'
            ? 'Add an audio URL inline.'
            : 'Upload media inline.'}
    </div>
  );
};

const MatrixPreview: React.FC<{ question: Question }> = ({ question }) => {
  const cols = question.matrixColumns ?? [];
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-border/60">
      <div
        className="grid border-b border-border/60 bg-muted/10 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
        style={{ gridTemplateColumns: `minmax(160px,1.4fr) repeat(${Math.max(cols.length, 1)}, minmax(0,1fr))` }}
      >
        <span>Statement</span>
        {cols.map((c) => <span key={c.id} className="text-center">{c.text}</span>)}
      </div>
      {question.options.slice(0, 3).map((row) => (
        <div
          key={row.id}
          className="grid items-center border-b border-border/40 px-4 py-3 last:border-b-0"
          style={{ gridTemplateColumns: `minmax(160px,1.4fr) repeat(${Math.max(cols.length, 1)}, minmax(0,1fr))` }}
        >
          <span className="text-sm text-foreground/80">{row.text}</span>
          {cols.map((c) => (
            <div key={c.id} className="flex justify-center">
              <div className="h-4 w-4 rounded-full border border-border/70 bg-background" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const RankingPreview: React.FC<{ question: Question }> = ({ question }) => (
  <div className="mt-4 space-y-2">
    {question.options.map((option, index) => (
      <div key={option.id} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/15 px-4 py-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-background text-[11px] font-semibold text-muted-foreground border border-border/60">
          {index + 1}
        </div>
        <span className="flex-1 text-sm text-foreground/80">{option.text}</span>
        <GripVertical className="h-4 w-4 text-muted-foreground/40" />
      </div>
    ))}
  </div>
);

// ── System block (hidden / calculated) ──────────────────────────────────────

const SystemBlockCard: React.FC<{
  question: Question;
  isDragging: boolean;
  onSelect?: () => void;
}> = ({ question, isDragging, onSelect }) => {
  const isHiddenField = question.type === 'hiddenField';
  const Icon = isHiddenField ? EyeOff : Calculator;
  const label = isHiddenField ? 'Hidden field' : 'Calculated field';
  const description = isHiddenField
    ? `Key: ${question.fieldKey || 'not set'}${question.fieldDefaultValue ? ` · Default: ${question.fieldDefaultValue}` : ''}`
    : `${question.fieldName || 'unnamed'} (${question.fieldValueType ?? 'number'})`;

  return (
    <div
      onMouseDownCapture={() => onSelect?.()}
      className={cn(
        'rounded-3xl border border-dashed bg-muted/[0.04] px-6 py-4 transition-all duration-150 cursor-default',
        'border-border/60 hover:border-border',
        isDragging && 'opacity-50',
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted/40 text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground/80">{label}</div>
          <div className="text-[11px] text-muted-foreground/60">{description}</div>
        </div>
      </div>
    </div>
  );
};

// ── Main component ───────────────────────────────────────────────────────────

const QuestionInlineEditor: React.FC<QuestionInlineEditorProps> = ({
  question,
  isActive: _isActive,
  isDragging = false,
  onSelect,
  onQuestionChange,
}) => {
  const blockType = getNormalizedBlockType(question);
  const isContent = isContentBlock(question);
  const isSystem = question.type === 'hiddenField' || question.type === 'calculatedField';
  const { handleMediaUpload, removeQuestionMedia } = useQuestionMedia(question, onQuestionChange);

  const handleTextChange = useCallback(
    (text: string) => onQuestionChange({ ...question, text }),
    [question, onQuestionChange],
  );

  const handleDescriptionChange = useCallback(
    (description: string) => onQuestionChange({ ...question, description }),
    [question, onQuestionChange],
  );

  const handleEmbedUrlChange = useCallback(
    (embedUrl: string) => onQuestionChange({ ...question, embedUrl }),
    [question, onQuestionChange],
  );

  if (isSystem) {
    return (
      <SystemBlockCard
        question={question}
        isDragging={isDragging}
        onSelect={onSelect}
      />
    );
  }

  const showOptions = isChoiceBlock(question) && question.type !== 'matrix';
  const showScale = isScaleBlock(question);
  const showTextInput = isTextInputBlock(question);
  const showMatrix = question.type === 'matrix';
  const showRanking = question.type === 'ranking';
  const showAdvanced =
    question.type === 'fileUpload' ||
    question.type === 'signature' ||
    question.type === 'payment' ||
    question.type === 'recaptcha';

  return (
    <div
      onMouseDownCapture={() => onSelect?.()}
      onFocusCapture={() => onSelect?.()}
      className={cn(
        'group/inline relative rounded-[32px] border border-border/70 bg-background px-8 py-7 shadow-[0_10px_40px_rgba(15,15,15,0.05)] transition-all duration-200',
        'hover:border-border/90 hover:shadow-[0_14px_48px_rgba(15,15,15,0.08)]',
        question.isVisible === false && 'opacity-40',
        isDragging && 'opacity-60',
      )}
    >
      {/* Content blocks render as inline-editable canvas content */}
      {isContent ? (
        <>
          {(blockType === 'title' ||
            blockType === 'heading' ||
            blockType === 'heading1' ||
            blockType === 'heading2' ||
            blockType === 'heading3' ||
            blockType === 'label' ||
            blockType === 'textBlock' ||
            blockType === 'divider' ||
            blockType === 'pageBreak') ? (
            <ContentEditor
              question={question}
              blockType={blockType}
              onChange={handleTextChange}
            />
          ) : (
            <>
              <Textarea
                value={question.text}
                onChange={(e) => handleTextChange(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="Block caption"
                rows={1}
                className="min-h-0 w-full resize-none border-0 bg-transparent px-0 py-0 text-xl font-semibold tracking-tight shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/30"
              />
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {(blockType === 'image' || blockType === 'video') && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = blockType === 'image'
                          ? 'image/png,image/jpeg,image/jpg,image/webp,image/gif'
                          : 'video/mp4,video/webm,video/ogg';
                        input.onchange = () => {
                          const file = input.files?.[0];
                          if (file) {
                            handleMediaUpload(file, blockType === 'image' ? 'image' : 'video');
                          }
                        };
                        input.click();
                      }}
                    >
                      {question.media ? 'Replace media' : `Upload ${blockType}`}
                    </Button>
                    {question.media && (
                      <Button
                        type="button"
                        variant="ghost"
                        className="gap-2 rounded-full text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeQuestionMedia();
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    )}
                  </>
                )}
                {(blockType === 'audio' || blockType === 'embed' || blockType === 'payment') && (
                  <Input
                    value={question.embedUrl || ''}
                    onChange={(e) => handleEmbedUrlChange(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder={blockType === 'payment' ? 'https://checkout.example.com' : 'https://example.com/media'}
                    className="h-10 max-w-xl rounded-2xl border-border/60 bg-muted/10 shadow-none"
                  />
                )}
              </div>
              <MediaBlockPreview question={question} blockType={blockType} />
            </>
          )}
        </>
      ) : (
        <>
          {/* Title */}
          <Textarea
            value={question.text}
            onChange={(e) => handleTextChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder="Untitled question"
            rows={1}
            className="min-h-0 w-full resize-none border-0 bg-transparent px-0 py-0 text-2xl font-semibold tracking-tight shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/30"
          />

          {/* Description */}
          <Textarea
            value={question.description ?? ''}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder="Add a hint or description…"
            rows={1}
            className="mt-1 min-h-0 w-full resize-none border-0 bg-transparent px-0 py-0 text-sm leading-6 text-muted-foreground shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/25"
          />

          {/* Response preview */}
          {showOptions && <ChoicePreview question={question} />}
          {showScale && <ScalePreview question={question} />}
          {showTextInput && <TextInputPreview question={question} />}
          {showMatrix && <MatrixPreview question={question} />}
          {showRanking && <RankingPreview question={question} />}
          {showAdvanced && (
            <div className="mt-4 rounded-2xl border border-dashed border-border/60 bg-muted/10 px-4 py-4 text-sm text-muted-foreground/60">
              {question.placeholder || 'This block type will be rendered for respondents.'}
            </div>
          )}
        </>
      )}

      {/* Hidden indicator */}
      {question.isVisible === false && (
        <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          <EyeOff className="h-3 w-3" />
          Hidden
        </div>
      )}
    </div>
  );
};

export default QuestionInlineEditor;
