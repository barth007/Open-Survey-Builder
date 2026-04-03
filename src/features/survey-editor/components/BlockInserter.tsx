import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BetweenHorizontalStart,
  Calculator,
  Calendar,
  Captions,
  CheckSquare,
  ChevronsUpDown,
  CreditCard,
  EyeOff,
  FileAudio2,
  FileDigit,
  FileSignature,
  FileText,
  Image as ImageIcon,
  Link2,
  List,
  ListChecks,
  Mail,
  MousePointerSquareDashed,
  Phone,
  PlaySquare,
  ShieldCheck,
  Star,
  Type,
  Video,
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  EDITOR_BLOCKS,
  type EditorInsertType,
  type EditorBlockDefinition,
  isBlockAvailable,
} from '@/features/survey-editor/lib/editor-blocks';

interface BlockInserterProps {
  onSelect: (type: EditorInsertType) => void;
  onClose: () => void;
  anchorPosition: { top: number; left: number };
}

const groupOrder: EditorBlockDefinition['group'][] = [
  'Input',
  'Choice',
  'Rating & Ranking',
  'Advanced',
  'Structure',
  'Media',
];

const blockIcons: Record<EditorInsertType, React.ComponentType<{ className?: string }>> = {
  shortText: Type,
  longText: FileText,
  number: FileDigit,
  email: Mail,
  phoneNumber: Phone,
  link: Link2,
  multipleChoice: List,
  dropdown: ChevronsUpDown,
  checkboxes: CheckSquare,
  multiSelect: ListChecks,
  date: Calendar,
  time: Calendar,
  rating: Star,
  linearScale: BetweenHorizontalStart,
  ranking: ListChecks,
  matrix: MousePointerSquareDashed,
  fileUpload: ImageIcon,
  signature: FileSignature,
  hiddenField: EyeOff,
  calculatedField: Calculator,
  payment: CreditCard,
  recaptcha: ShieldCheck,
  heading: Captions,
  title: Captions,
  heading1: Captions,
  heading2: Captions,
  heading3: Captions,
  textBlock: FileText,
  label: Type,
  divider: BetweenHorizontalStart,
  pageBreak: PlaySquare,
  image: ImageIcon,
  video: Video,
  audio: FileAudio2,
  embed: PlaySquare,
  welcome: Captions,
  thanks: Captions,
};

export function BlockInserter({ onSelect, onClose, anchorPosition }: BlockInserterProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredBlocks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return EDITOR_BLOCKS;
    }

    return EDITOR_BLOCKS.filter((block) => {
      const haystack = [block.label, block.description, ...block.keywords].join(' ').toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [query]);

  const groupedBlocks = useMemo(
    () =>
      groupOrder
        .map((group) => ({
          group,
          items: filteredBlocks.filter((block) => block.group === group),
        }))
        .filter((entry) => entry.items.length > 0),
    [filteredBlocks],
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex((previous) => (previous + 1) % Math.max(filteredBlocks.length, 1));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex((previous) => (previous - 1 + filteredBlocks.length) % Math.max(filteredBlocks.length, 1));
      } else if (event.key === 'Enter' && filteredBlocks[selectedIndex] && isBlockAvailable(filteredBlocks[selectedIndex])) {
        event.preventDefault();
        onSelect(filteredBlocks[selectedIndex].id);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredBlocks, onClose, onSelect, selectedIndex]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <TooltipProvider delayDuration={120}>
      <div
        ref={containerRef}
        className="fixed z-[100] w-[24rem] overflow-hidden rounded-[28px] border border-border/60 bg-background/95 shadow-[0_30px_120px_rgba(0,0,0,0.18)] backdrop-blur-xl"
        style={{
          top: Math.min(anchorPosition.top, window.innerHeight - 560),
          left: Math.min(anchorPosition.left, window.innerWidth - 420),
        }}
      >
      <div className="border-b border-border/60 px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Insert block
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Type to search or use arrow keys
            </p>
          </div>
          <div className="rounded-full border border-border/70 bg-muted/40 px-2 py-1 text-[10px] font-medium text-muted-foreground">
            /
          </div>
        </div>
        <Input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search blocks..."
          className="h-11 rounded-2xl border-border/70 bg-muted/25 px-4 text-sm shadow-none focus-visible:ring-1"
        />
      </div>

      <div className="max-h-[28rem] overflow-y-auto px-2 py-2">
        {groupedBlocks.map((entry) => (
          <div key={entry.group} className="pb-2">
            <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/70">
              {entry.group}
            </div>
            <div className="space-y-1">
              {entry.items.map((block) => {
                const absoluteIndex = filteredBlocks.findIndex((item) => item.id === block.id);
                const Icon = blockIcons[block.id];
                const available = isBlockAvailable(block);
                const row = (
                  <button
                    key={block.id}
                    type="button"
                    disabled={!available}
                    onClick={() => available && onSelect(block.id)}
                    onMouseEnter={() => setSelectedIndex(absoluteIndex)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-[22px] px-3 py-3 text-left transition-all',
                      available && absoluteIndex === selectedIndex
                        ? 'bg-[#111111] text-white shadow-[0_12px_30px_rgba(17,17,17,0.18)]'
                        : available
                          ? 'text-foreground hover:bg-muted/55'
                          : 'cursor-not-allowed text-muted-foreground/45 opacity-70',
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border',
                        available && absoluteIndex === selectedIndex
                          ? 'border-white/15 bg-white/10'
                          : 'border-border/70 bg-background',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 truncate text-sm font-semibold">
                        <span className="truncate">{block.label}</span>
                        {!available && (
                          <span className="rounded-full border border-border/70 bg-muted/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em]">
                            Unavailable
                          </span>
                        )}
                      </div>
                      <div
                        className={cn(
                          'truncate text-xs',
                          available && absoluteIndex === selectedIndex ? 'text-white/70' : 'text-muted-foreground',
                        )}
                      >
                        {block.description}
                      </div>
                    </div>
                  </button>
                );

                if (!available && block.unavailableReason) {
                  return (
                    <Tooltip key={block.id}>
                      <TooltipTrigger asChild>
                        <div>{row}</div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs leading-5">
                        {block.unavailableReason}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return row;
              })}
            </div>
          </div>
        ))}

        {filteredBlocks.length === 0 && (
          <div className="px-3 py-10 text-center text-sm text-muted-foreground">
            No blocks matched &ldquo;{query}&rdquo;.
          </div>
        )}
      </div>
      </div>
    </TooltipProvider>
  );
}
