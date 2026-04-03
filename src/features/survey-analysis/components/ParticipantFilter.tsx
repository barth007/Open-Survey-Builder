import React, { useState } from 'react';
import { Search, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ParticipantFilterProps {
  onFilterChange: (participantId: string, participantEmail: string) => void;
  onDeleteRequest: (participantId: string, participantEmail: string) => void;
  filteredParticipant: { id: string; email: string } | null;
  responseCount: number;
}

export const ParticipantFilter: React.FC<ParticipantFilterProps> = ({
  onFilterChange,
  onDeleteRequest,
  filteredParticipant,
  responseCount,
}) => {
  const [participantId, setParticipantId] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');

  const handleFilter = () => {
    if (participantId.trim() || participantEmail.trim()) {
      onFilterChange(participantId.trim(), participantEmail.trim());
    }
  };

  const handleClear = () => {
    setParticipantId('');
    setParticipantEmail('');
    onFilterChange('', '');
  };

  const handleDelete = () => {
    if (filteredParticipant) {
      onDeleteRequest(filteredParticipant.id, filteredParticipant.email);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleFilter();
    }
  };

  const filteredLabel = filteredParticipant?.email || filteredParticipant?.id || '';

  return (
    <div className="rounded-[24px] border border-border/70 bg-muted/[0.12] px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">
            Participant filter
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Limit results to one participant when you need a focused review.
          </p>
        </div>

        {filteredParticipant && (
          <div className="rounded-full border border-border/70 bg-background px-3 py-1 text-[11px] font-medium text-muted-foreground">
            {responseCount} match{responseCount === 1 ? '' : 'es'}
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div>
          <p className="mb-2 text-[11px] font-medium text-muted-foreground">
            Participant ID
          </p>
          <Input
            placeholder="Enter a participant id"
            value={participantId}
            onChange={(event) => setParticipantId(event.target.value)}
            onKeyDown={handleKeyDown}
            className="h-11 rounded-full border-border/70 bg-background px-4 text-sm shadow-none focus-visible:ring-1"
          />
        </div>

        <div>
          <p className="mb-2 text-[11px] font-medium text-muted-foreground">
            Participant email
          </p>
          <Input
            type="email"
            placeholder="Enter an email"
            value={participantEmail}
            onChange={(event) => setParticipantEmail(event.target.value)}
            onKeyDown={handleKeyDown}
            className="h-11 rounded-full border-border/70 bg-background px-4 text-sm shadow-none focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          onClick={handleFilter}
          disabled={!participantId.trim() && !participantEmail.trim()}
          className="h-10 rounded-full bg-[#111111] px-4 text-sm font-medium text-white hover:bg-[#111111]/95"
        >
          <Search className="mr-2 h-4 w-4" />
          Filter submissions
        </Button>

        {filteredParticipant && (
          <Button
            onClick={handleClear}
            variant="outline"
            className="h-10 rounded-full border-border/70 px-4 text-sm font-medium"
          >
            Clear filter
          </Button>
        )}

        {filteredParticipant && responseCount > 0 && (
          <Button
            onClick={handleDelete}
            variant="outline"
            className="h-10 rounded-full border-destructive/20 px-4 text-sm font-medium text-destructive hover:bg-destructive/5 hover:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete matches
          </Button>
        )}
      </div>

      {filteredParticipant && (
        <p className="mt-3 text-sm text-muted-foreground">
          Filtering results for <span className="font-medium text-foreground">{filteredLabel}</span>.
        </p>
      )}
    </div>
  );
};
