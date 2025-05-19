
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

interface SplitPanelLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  leftPanelTitle?: string;
  rightPanelTitle?: string;
  defaultLayout?: number[]; // Default size distribution [left, right] in percentage
  minSizes?: number[]; // Minimum sizes for panels [left, right] in percentage
}

export function SplitPanelLayout({
  leftPanel,
  rightPanel,
  leftPanelTitle,
  rightPanelTitle,
  defaultLayout = [50, 50], // Default to 50/50 split
  minSizes = [30, 30], // Minimum 30% for each panel
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

  // Navigation buttons that remain at consistent height when panel is collapsed
  const NavigationButton = ({ 
    collapsed, 
    onClick, 
    direction, 
    title 
  }: { 
    collapsed: boolean, 
    onClick: () => void, 
    direction: "left" | "right", 
    title?: string 
  }) => (
    <Button 
      variant="ghost" 
      onClick={onClick} 
      className="p-1 h-10 w-10 flex items-center justify-center"
      title={title || `Show ${direction === "left" ? "right" : "left"} panel`}
    >
      {direction === "left" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
    </Button>
  );

  // If one panel is collapsed, render a simplified layout
  if (leftPanelCollapsed || rightPanelCollapsed) {
    return (
      <div className="flex h-[calc(100vh-200px)] w-full">
        {leftPanelCollapsed ? (
          <div className="w-10 border-r border-gray-200 flex items-start">
            <div className="sticky top-0 z-30 bg-white h-12 w-10 flex items-center justify-center">
              <NavigationButton 
                collapsed={leftPanelCollapsed} 
                onClick={toggleLeftPanel} 
                direction="right" 
                title={`Show ${leftPanelTitle || "left panel"}`} 
              />
            </div>
          </div>
        ) : (
          <div className="w-full border-r border-gray-200 flex-shrink-0">
            <div className="h-full flex flex-col">
              <div className="flex justify-between px-4 py-2 border-b sticky top-0 z-30 bg-white h-12 items-center">
                <div className="font-medium">{leftPanelTitle}</div>
                <NavigationButton 
                  collapsed={leftPanelCollapsed} 
                  onClick={toggleLeftPanel} 
                  direction="left" 
                  title={`Hide ${leftPanelTitle || "left panel"}`} 
                />
              </div>
              <div className="flex-grow h-[calc(100vh-260px)] overflow-auto">
                <ScrollArea className="h-full">
                  <div className="px-4 py-4">
                    {leftPanel}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        )}
        
        {rightPanelCollapsed ? (
          <div className="w-10 border-l border-gray-200 flex items-start">
            <div className="sticky top-0 z-30 bg-white h-12 w-10 flex items-center justify-center">
              <NavigationButton 
                collapsed={rightPanelCollapsed} 
                onClick={toggleRightPanel} 
                direction="left" 
                title={`Show ${rightPanelTitle || "right panel"}`} 
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 min-w-0 bg-white">
            <div className="h-full flex flex-col">
              <div className="flex justify-between px-4 py-2 border-b sticky top-0 z-30 bg-white h-12 items-center">
                <div className="font-medium">{rightPanelTitle}</div>
                <NavigationButton 
                  collapsed={rightPanelCollapsed} 
                  onClick={toggleRightPanel} 
                  direction="right" 
                  title={`Hide ${rightPanelTitle || "right panel"}`} 
                />
              </div>
              <div className="flex-grow h-[calc(100vh-260px)] bg-pebble/30 overflow-auto">
                <ScrollArea className="h-full">
                  <div className="px-4 py-4">
                    {rightPanel}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default: both panels visible with resizing capability
  return (
    <div className="h-[calc(100vh-200px)] w-full">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          minSize={minSizes[0]}
          className="border-r border-gray-200"
        >
          <div className="h-full flex flex-col">
            <div className="flex justify-between px-4 py-2 border-b sticky top-0 z-30 bg-white h-12 items-center">
              <div className="font-medium">{leftPanelTitle}</div>
              <NavigationButton 
                collapsed={false} 
                onClick={toggleLeftPanel} 
                direction="left" 
                title={`Hide ${leftPanelTitle || "left panel"}`} 
              />
            </div>
            <div className="flex-grow overflow-auto">
              <ScrollArea className="h-full">
                <div className="px-4 py-4">
                  {leftPanel}
                </div>
              </ScrollArea>
            </div>
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel
          defaultSize={defaultLayout[1]}
          minSize={minSizes[1]}
          className="bg-white"
        >
          <div className="h-full flex flex-col">
            <div className="flex justify-between px-4 py-2 border-b sticky top-0 z-30 bg-white h-12 items-center">
              <div className="font-medium">{rightPanelTitle}</div>
              <NavigationButton 
                collapsed={false} 
                onClick={toggleRightPanel} 
                direction="right" 
                title={`Hide ${rightPanelTitle || "right panel"}`} 
              />
            </div>
            <div className="flex-grow bg-pebble/30 overflow-auto">
              <ScrollArea className="h-full">
                <div className="px-4 py-4">
                  {rightPanel}
                </div>
              </ScrollArea>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
