
import React from 'react';
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";

interface AnalysisPanelHeaderProps {
  onToggleVisibility?: () => void;
}

export const AnalysisPanelHeader: React.FC<AnalysisPanelHeaderProps> = ({ onToggleVisibility }) => {
  return (
    <CardHeader className="border-b border-ice">
      <div className="flex justify-between items-center">
        <CardTitle className="text-lg">Analysis Panel</CardTitle>
        {onToggleVisibility && (
          <Button 
            variant="ghost" 
            onClick={onToggleVisibility}
            className="p-1 h-auto"
            title="Hide analysis panel"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}
      </div>
    </CardHeader>
  );
};
