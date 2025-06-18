
import React from 'react';
import { Tag, Filter, Scale, AlertTriangle, FileText, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

type TabType = 'tagging' | 'statistics' | 'scale' | 'outliers' | 'summary' | 'recordings';

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
  const handleKeyDown = (event: React.KeyboardEvent, tabType: TabType) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setActiveTab(tabType);
    }
  };

  return (
    <div 
      className="flex flex-wrap gap-2 mb-4 border-b pb-4"
      role="tablist"
      aria-label="Analysis tabs"
    >
      <Button 
        variant={activeTab === 'tagging' ? 'default' : 'outline'} 
        size="sm"
        onClick={() => setActiveTab('tagging')}
        onKeyDown={(e) => handleKeyDown(e, 'tagging')}
        className="flex-grow md:flex-grow-0"
        role="tab"
        aria-selected={activeTab === 'tagging'}
        aria-controls="tagging-panel"
        tabIndex={0}
        aria-label="Tagging analysis tab"
      >
        <Tag className="mr-1 h-4 w-4" aria-hidden="true" /> Tagging
      </Button>
      <Button 
        variant={activeTab === 'statistics' ? 'default' : 'outline'}
        size="sm" 
        onClick={() => setActiveTab('statistics')}
        onKeyDown={(e) => handleKeyDown(e, 'statistics')}
        className="flex-grow md:flex-grow-0"
        role="tab"
        aria-selected={activeTab === 'statistics'}
        aria-controls="statistics-panel"
        tabIndex={0}
        aria-label="Statistical analysis tab"
      >
        <Filter className="mr-1 h-4 w-4" aria-hidden="true" /> Statistics
      </Button>
      {isLikert && (
        <>
          <Button 
            variant={activeTab === 'scale' ? 'default' : 'outline'}
            size="sm" 
            onClick={() => setActiveTab('scale')}
            onKeyDown={(e) => handleKeyDown(e, 'scale')}
            className="flex-grow md:flex-grow-0"
            role="tab"
            aria-selected={activeTab === 'scale'}
            aria-controls="scale-panel"
            tabIndex={0}
            aria-label="Scale mapping tab"
          >
            <Scale className="mr-1 h-4 w-4" aria-hidden="true" /> Scale Mapping
          </Button>
          <Button 
            variant={activeTab === 'outliers' ? 'default' : 'outline'}
            size="sm" 
            onClick={() => setActiveTab('outliers')}
            onKeyDown={(e) => handleKeyDown(e, 'outliers')}
            className="flex-grow md:flex-grow-0"
            role="tab"
            aria-selected={activeTab === 'outliers'}
            aria-controls="outliers-panel"
            tabIndex={0}
            aria-label="Outliers detection tab"
          >
            <AlertTriangle className="mr-1 h-4 w-4" aria-hidden="true" /> Outliers
          </Button>
        </>
      )}
      <Button 
        variant={activeTab === 'recordings' ? 'default' : 'outline'}
        size="sm" 
        onClick={() => setActiveTab('recordings')}
        onKeyDown={(e) => handleKeyDown(e, 'recordings')}
        className="flex-grow md:flex-grow-0"
        role="tab"
        aria-selected={activeTab === 'recordings'}
        aria-controls="recordings-panel"
        tabIndex={0}
        aria-label="Recordings tab"
      >
        <Video className="mr-1 h-4 w-4" aria-hidden="true" /> Recordings
      </Button>
      <Button 
        variant={activeTab === 'summary' ? 'default' : 'outline'}
        size="sm" 
        onClick={() => setActiveTab('summary')}
        onKeyDown={(e) => handleKeyDown(e, 'summary')}
        className="flex-grow md:flex-grow-0"
        role="tab"
        aria-selected={activeTab === 'summary'}
        aria-controls="summary-panel"
        tabIndex={0}
        aria-label="Summary insights tab"
      >
        <FileText className="mr-1 h-4 w-4" aria-hidden="true" /> Summary
      </Button>
    </div>
  );
};
