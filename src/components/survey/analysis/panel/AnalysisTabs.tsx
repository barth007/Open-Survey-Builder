
import React from 'react';
import { Tag, Filter, Scale, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type TabType = 'tagging' | 'statistics' | 'scale' | 'outliers';

interface AnalysisTabsProps {
  activeTab: TabType;
  setActiveTab: React.Dispatch<React.SetStateAction<TabType>>;
  isLikert: boolean;
}

export const AnalysisTabs: React.FC<AnalysisTabsProps> = ({ 
  activeTab, 
  setActiveTab,
  isLikert
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4 border-b pb-4">
      <Button 
        variant={activeTab === 'tagging' ? 'default' : 'outline'} 
        size="sm"
        onClick={() => setActiveTab('tagging')}
        className="flex-grow md:flex-grow-0"
      >
        <Tag className="mr-1 h-4 w-4" /> Tagging
      </Button>
      <Button 
        variant={activeTab === 'statistics' ? 'default' : 'outline'}
        size="sm" 
        onClick={() => setActiveTab('statistics')}
        className="flex-grow md:flex-grow-0"
      >
        <Filter className="mr-1 h-4 w-4" /> Statistics
      </Button>
      {isLikert && (
        <>
          <Button 
            variant={activeTab === 'scale' ? 'default' : 'outline'}
            size="sm" 
            onClick={() => setActiveTab('scale')}
            className="flex-grow md:flex-grow-0"
          >
            <Scale className="mr-1 h-4 w-4" /> Scale Mapping
          </Button>
          <Button 
            variant={activeTab === 'outliers' ? 'default' : 'outline'}
            size="sm" 
            onClick={() => setActiveTab('outliers')}
            className="flex-grow md:flex-grow-0"
          >
            <AlertTriangle className="mr-1 h-4 w-4" /> Outliers
          </Button>
        </>
      )}
    </div>
  );
};
