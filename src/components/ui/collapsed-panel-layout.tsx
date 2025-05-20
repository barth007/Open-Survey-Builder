
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { PanelNavigationButton } from "@/components/ui/panel-navigation-button";

interface CollapsedPanelLayoutProps {
  leftPanelCollapsed: boolean;
  rightPanelCollapsed: boolean;
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  leftPanelTitle?: string;
  rightPanelTitle?: string;
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
}

export function CollapsedPanelLayout({
  leftPanelCollapsed,
  rightPanelCollapsed,
  leftPanel,
  rightPanel,
  leftPanelTitle,
  rightPanelTitle,
  onToggleLeftPanel,
  onToggleRightPanel
}: CollapsedPanelLayoutProps) {
  // If both panels are collapsed, show controls to expand them
  if (leftPanelCollapsed && rightPanelCollapsed) {
    return (
      <div className="flex justify-center items-center h-64 bg-pebble">
        <div className="flex gap-4">
          <Button onClick={onToggleLeftPanel} variant="outline" className="flex gap-2">
            <ChevronRight size={18} />
            {leftPanelTitle || "Show Left Panel"}
          </Button>
          <Button onClick={onToggleRightPanel} variant="outline" className="flex gap-2">
            {rightPanelTitle || "Show Right Panel"}
            <ChevronLeft size={18} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-200px)] w-full">
      {leftPanelCollapsed ? (
        <div className="w-10 border-r border-gray-200 flex items-start">
          <div className="sticky top-0 z-30 bg-white h-12 w-10 flex items-center justify-center">
            <PanelNavigationButton 
              collapsed={leftPanelCollapsed}
              onClick={onToggleLeftPanel}
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
              <PanelNavigationButton 
                collapsed={leftPanelCollapsed}
                onClick={onToggleLeftPanel}
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
            <PanelNavigationButton 
              collapsed={rightPanelCollapsed}
              onClick={onToggleRightPanel}
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
              <PanelNavigationButton 
                collapsed={rightPanelCollapsed}
                onClick={onToggleRightPanel}
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

// Import Button for collapsed panel controls
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
