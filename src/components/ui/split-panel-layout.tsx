
import React, { useState } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SplitPanelLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  leftPanelTitle?: string;
  rightPanelTitle?: string;
  defaultLeftPanelSize?: number;
  minLeftPanelSize?: number;
}

export function SplitPanelLayout({
  leftPanel,
  rightPanel,
  leftPanelTitle,
  rightPanelTitle,
  defaultLeftPanelSize = 40,
  minLeftPanelSize = 30,
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
      <div className="flex justify-center items-center h-64 bg-pebble p-4">
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
    <ResizablePanelGroup
      direction="horizontal"
      className="min-h-[calc(100vh-200px)] max-w-full overflow-hidden"
    >
      {leftPanelCollapsed ? (
        <div className="w-12 border-r border-gray-200 flex items-center justify-center">
          <Button 
            variant="ghost" 
            onClick={toggleLeftPanel} 
            className="p-2 h-auto"
            title={leftPanelTitle || "Show left panel"}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </div>
      ) : (
        <>
          <ResizablePanel
            defaultSize={defaultLeftPanelSize}
            minSize={minLeftPanelSize}
            maxSize={isMobile ? 100 : 60}
            className="min-w-[300px] md:min-w-[520px] md:max-w-[520px]"
          >
            <div className="h-full flex flex-col">
              <div className="flex justify-end px-4 py-2 border-b">
                <Button 
                  variant="ghost" 
                  onClick={toggleLeftPanel} 
                  className="p-1 h-8 w-8"
                  title={`Hide ${leftPanelTitle || "left panel"}`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
              <ScrollArea className="flex-grow h-[calc(100vh-260px)]">
                <div className="p-4">
                  {leftPanel}
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>
          {!isMobile && <ResizableHandle withHandle />}
        </>
      )}
      
      {rightPanelCollapsed ? (
        <div className="w-12 border-l border-gray-200 flex items-center justify-center">
          <Button 
            variant="ghost" 
            onClick={toggleRightPanel} 
            className="p-2 h-auto"
            title={rightPanelTitle || "Show right panel"}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
        </div>
      ) : (
        <ResizablePanel defaultSize={100 - defaultLeftPanelSize} minSize={minLeftPanelSize} className="bg-white/50">
          <div className="h-full flex flex-col">
            <div className="flex justify-between px-4 py-2 border-b">
              {isMobile && (
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
              <Button 
                variant="ghost" 
                onClick={toggleRightPanel} 
                className="p-1 h-8 w-8"
                title={`Hide ${rightPanelTitle || "right panel"}`}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="flex-grow h-[calc(100vh-260px)]">
              <div className="p-4 bg-pebble/30">
                {rightPanel}
              </div>
            </ScrollArea>
          </div>
        </ResizablePanel>
      )}
    </ResizablePanelGroup>
  );
}
