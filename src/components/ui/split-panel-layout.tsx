
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
  
  // Calculate dynamic height based on viewport
  const calculateHeight = () => {
    const viewportHeight = window.innerHeight;
    // Use a percentage of viewport height instead of fixed pixel value
    return `calc(${Math.max(60, Math.min(90, viewportHeight * 0.7))}vh - 4rem)`;
  };
  
  const [panelHeight, setPanelHeight] = useState(calculateHeight());

  // Update height on resize
  useEffect(() => {
    const handleResize = () => {
      setPanelHeight(calculateHeight());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <div className="w-full" style={{ height: panelHeight, minHeight: "400px" }}>
      <ResizablePanelGroup direction="horizontal" className="h-full min-h-[400px] w-full">
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          minSize={15}
          className="border-r border-gray-200"
        >
          <div className="h-full flex flex-col">
            <div className="flex justify-between px-4 py-2 border-b sticky top-0 z-30 bg-white h-12 items-center">
              <div className="font-medium">{leftPanelTitle}</div>
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
                    <div className="flex items-center justify-center h-40 text-gray-400">
                      No content available
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
            <div className="flex justify-between px-4 py-2 border-b sticky top-0 z-30 bg-white h-12 items-center">
              <div className="font-medium">{rightPanelTitle}</div>
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
                    <div className="flex items-center justify-center h-40 text-gray-400">
                      No content available
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
