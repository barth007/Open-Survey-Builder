
import React, { useState } from 'react';
import { Search, Trash2, UserX } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

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
  responseCount
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFilter();
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
      <div className="flex items-center gap-2">
        <UserX className="h-4 w-4" />
        <Label className="font-medium">Filter by Participant</Label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="participant-id" className="text-sm">
            Participant ID
          </Label>
          <Input
            id="participant-id"
            placeholder="Enter participant ID..."
            value={participantId}
            onChange={(e) => setParticipantId(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="participant-email" className="text-sm">
            Participant Email
          </Label>
          <Input
            id="participant-email"
            type="email"
            placeholder="Enter participant email..."
            value={participantEmail}
            onChange={(e) => setParticipantEmail(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={handleFilter}
          disabled={!participantId.trim() && !participantEmail.trim()}
          size="sm"
          className="flex items-center gap-2"
        >
          <Search className="h-4 w-4" />
          Filter Responses
        </Button>

        {filteredParticipant && (
          <Button
            onClick={handleClear}
            variant="outline"
            size="sm"
          >
            Clear Filter
          </Button>
        )}
      </div>

      {filteredParticipant && (
        <div className="flex items-center justify-between p-3 bg-background border rounded">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              Filtered: {filteredParticipant.id || filteredParticipant.email}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {responseCount} response{responseCount !== 1 ? 's' : ''} found
            </span>
          </div>

          {responseCount > 0 && (
            <Button
              onClick={handleDelete}
              variant="destructive"
              size="sm"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Responses
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
