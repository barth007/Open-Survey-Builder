import React from 'react';
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ParticipantFilter } from '@/components/survey/analysis/ParticipantFilter';

interface FilterControlsProps {
  filterText: string;
  setFilterText: (value: string) => void;
  sortBy: "default" | "count" | "alpha";
  setSortBy: (value: "default" | "count" | "alpha") => void;
  showParticipantFilter?: boolean;
  onParticipantFilter?: (participantId: string, participantEmail: string) => void;
  onDeleteRequest?: (participantId: string, participantEmail: string) => void;
  filteredParticipant?: { id: string; email: string } | null;
  participantResponseCount?: number;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  filterText,
  setFilterText,
  sortBy,
  setSortBy,
  showParticipantFilter = false,
  onParticipantFilter,
  onDeleteRequest,
  filteredParticipant,
  participantResponseCount = 0
}) => {
  return (
    <div className="space-y-4">
      {/* Existing filter controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="filter-responses" className="text-sm font-medium mb-2 block">
            Filter by question or answer
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="filter-responses"
              placeholder="Type to filter responses..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="sm:w-48">
          <Label htmlFor="sort-responses" className="text-sm font-medium mb-2 block">
            Sort by
          </Label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger id="sort-responses">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="count">Response count</SelectItem>
              <SelectItem value="alpha">Alphabetical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Participant filter (when enabled) */}
      {showParticipantFilter && onParticipantFilter && onDeleteRequest && (
        <ParticipantFilter
          onFilterChange={onParticipantFilter}
          onDeleteRequest={onDeleteRequest}
          filteredParticipant={filteredParticipant || null}
          responseCount={participantResponseCount}
        />
      )}
    </div>
  );
};
