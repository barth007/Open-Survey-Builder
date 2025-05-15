
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SplitPanelLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  leftPanelTitle?: string;
  rightPanelTitle?: string;
}

export function SplitPanelLayout({
  leftPanel,
  rightPanel,
  leftPanelTitle,
  rightPanelTitle,
}: SplitPanelLayoutProps) {
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const isMobile = useIsMobile();

  // On mobile, we only show one panel at a time, defaulting to the left panel
  React.useEffect(() => {
    if (isMobile) {
      // On mobile, default to showing just the left panel
      setRightPanelCollapsed(true);
      setLeftPanelCollapsed(false);
    } else {
      // On desktop, show both panels
      setRightPanelCollapsed(false);
      setLeftPanelCollapsed(false);
    }
  }, [isMobile]);

  // Toggle left panel visibility
  const toggleLeftPanel = () => {
    if (isMobile) {
      // On mobile, if we're showing the left panel and we hide it, show the right panel
      if (!leftPanelCollapsed && rightPanelCollapsed) {
        setLeftPanelCollapsed(true);
        setRightPanelCollapsed(false);
      } else {
        setLeftPanelCollapsed(!leftPanelCollapsed);
      }
    } else {
      setLeftPanelCollapsed(!leftPanelCollapsed);
    }
  };

  // Toggle right panel visibility
  const toggleRightPanel = () => {
    if (isMobile) {
      // On mobile, if we're showing the right panel and we hide it, show the left panel
      if (!rightPanelCollapsed && leftPanelCollapsed) {
        setRightPanelCollapsed(true);
        setLeftPanelCollapsed(false);
      } else {
        setRightPanelCollapsed(!rightPanelCollapsed);
      }
    } else {
      setRightPanelCollapsed(!rightPanelCollapsed);
    }
  };

  // Navigation buttons when one panel is collapsed
  const navigationButtons = (
    <div className="flex items-center justify-between w-full sticky top-0 z-10 bg-white border-b">
      {leftPanelCollapsed && (
        <Button 
          variant="ghost" 
          onClick={toggleLeftPanel} 
          className="p-1 h-8 w-8"
          title={leftPanelTitle || "Show left panel"}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
      <div className="flex-grow"></div>
      {rightPanelCollapsed && (
        <Button 
          variant="ghost" 
          onClick={toggleRightPanel} 
          className="p-1 h-8 w-8"
          title={rightPanelTitle || "Show right panel"}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
    </div>
  );

  // If both panels are collapsed, show controls to expand them
  if (leftPanelCollapsed && rightPanelCollapsed) {
    return (
      <div className="flex justify-center items-center h-64 bg-pebble">
        <div className="flex gap-4">
          <Button onClick={toggleLeftPanel} variant="outline" className="flex gap-2">
            <ChevronRight size={18} />
            {leftPanelTitle || "Show Left Panel"}
          </Button>
          <Button onClick={toggleRightPanel} variant="outline" className="flex gap-2">
            {rightPanelTitle || "Show Right Panel"}
            <ChevronLeft size={18} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] w-full overflow-hidden">
      {leftPanelCollapsed ? (
        <div className="w-10 border-r border-gray-200 flex items-start">
          {navigationButtons}
        </div>
      ) : (
        <div className="w-[520px] min-w-[520px] max-w-[520px] border-r border-gray-200">
          <div className="h-full flex flex-col">
            <div className="flex justify-between px-2 py-2 border-b sticky top-0 z-10 bg-white">
              <div className="font-medium">{leftPanelTitle}</div>
              <Button 
                variant="ghost" 
                onClick={toggleLeftPanel} 
                className="p-1 h-6 w-6"
                title={`Hide ${leftPanelTitle || "left panel"}`}
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
            </div>
            <div className="overflow-y-auto flex-grow h-[calc(100vh-260px)]">
              {leftPanel}
            </div>
          </div>
        </div>
      )}
      
      {rightPanelCollapsed ? (
        <div className="w-10 border-l border-gray-200 flex items-start">
          {navigationButtons}
        </div>
      ) : (
        <div className="flex-1 bg-white/50">
          <div className="h-full flex flex-col">
            <div className="flex justify-between px-2 py-2 border-b sticky top-0 z-10 bg-white">
              <div className="font-medium">{rightPanelTitle}</div>
              <Button 
                variant="ghost" 
                onClick={toggleRightPanel} 
                className="p-1 h-6 w-6"
                title={`Hide ${rightPanelTitle || "right panel"}`}
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
            <div className="overflow-y-auto flex-grow h-[calc(100vh-260px)] bg-pebble/30">
              <div className="p-4">
                {rightPanel}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
