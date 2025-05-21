
import React, { useState, useEffect } from 'react';
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { CollapsedPanelLayout } from "@/components/ui/collapsed-panel-layout";
import { PanelNavigationButton } from "@/components/ui/panel-navigation-button";

interface SplitPanelLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  leftPanelTitle?: string;
  rightPanelTitle?: string;
  defaultLayout?: number[]; // Default size distribution [left, right] in percentage
  minSizes?: number[] | string[]; // Minimum sizes for panels [left, right] in pixels or percentage
}

export function SplitPanelLayout({
  leftPanel,
  rightPanel,
  leftPanelTitle,
  rightPanelTitle,
  defaultLayout = [50, 50], // Default to 50/50 split
  minSizes = ["30%", "30%"], // Use percentage-based minimums for better responsiveness
}: SplitPanelLayoutProps) {
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const isMobile = useIsMobile();
  
  // On mobile, we only show one panel at a time, defaulting to the left panel
  useEffect(() => {
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

  // If one or both panels are collapsed, use the simplified layout
  if (leftPanelCollapsed || rightPanelCollapsed) {
    return (
      <CollapsedPanelLayout
        leftPanelCollapsed={leftPanelCollapsed}
        rightPanelCollapsed={rightPanelCollapsed}
        leftPanel={leftPanel}
        rightPanel={rightPanel}
        leftPanelTitle={leftPanelTitle}
        rightPanelTitle={rightPanelTitle}
        onToggleLeftPanel={toggleLeftPanel}
        onToggleRightPanel={toggleRightPanel}
      />
    );
  }

  // Default: both panels visible with resizing capability
  return (
    <div className="h-full w-full">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full">
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          minSize={15}
          className="border-r border-gray-200 bg-white"
        >
          <div className="h-full flex flex-col">
            <div className="flex justify-between px-4 py-2.5 border-b sticky top-0 z-30 bg-white h-11 items-center">
              <div className="font-medium text-sm">{leftPanelTitle}</div>
              <PanelNavigationButton 
                collapsed={false} 
                onClick={toggleLeftPanel} 
                direction="left" 
                title={`Hide ${leftPanelTitle || "left panel"}`} 
              />
            </div>
            <div className="flex-grow overflow-auto">
              <ScrollArea className="h-full">
                <div className="px-4 py-4">
                  {leftPanel || (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400 p-6 text-center">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-300 mb-2">
                        <path d="M8 10h8m-8 4h4m8-7v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <span>No content available</span>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel
          defaultSize={defaultLayout[1]}
          minSize={15}
          className="bg-white"
        >
          <div className="h-full flex flex-col">
            <div className="flex justify-between px-4 py-2.5 border-b sticky top-0 z-30 bg-white h-11 items-center">
              <div className="font-medium text-sm">{rightPanelTitle}</div>
              <PanelNavigationButton 
                collapsed={false} 
                onClick={toggleRightPanel} 
                direction="right" 
                title={`Hide ${rightPanelTitle || "right panel"}`} 
              />
            </div>
            <div className="flex-grow bg-pebble/30 overflow-auto">
              <ScrollArea className="h-full">
                <div className="px-4 py-4">
                  {rightPanel || (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400 p-6 text-center">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-300 mb-2">
                        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h4m6 0L9 3m6 0v4H9V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>No preview available</span>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
