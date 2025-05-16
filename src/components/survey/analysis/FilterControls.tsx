
import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterControlsProps {
  filterText: string;
  setFilterText: (text: string) => void;
  sortBy: "default" | "count" | "alpha";
  setSortBy: (sortBy: "default" | "count" | "alpha") => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  filterText,
  setFilterText,
  sortBy,
  setSortBy
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
      <div className="w-full md:w-1/3">
        <Input
          placeholder="Filter questions..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="w-full"
        />
      </div>
      <div>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default order</SelectItem>
            <SelectItem value="count">By count (highest first)</SelectItem>
            <SelectItem value="alpha">Alphabetically</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
