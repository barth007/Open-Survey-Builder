
import React from 'react';
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CollapsedAnalysisPanelProps {
  onToggleVisibility: () => void;
}

export const CollapsedAnalysisPanel: React.FC<CollapsedAnalysisPanelProps> = ({ onToggleVisibility }) => {
  return (
    <div className="h-full flex items-center justify-center">
      <Button 
        variant="ghost" 
        onClick={onToggleVisibility}
        className="p-2 h-auto"
        title="Show analysis panel"
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>
    </div>
  );
};
