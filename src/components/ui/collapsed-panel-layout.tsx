
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { PanelNavigationButton } from "@/components/ui/panel-navigation-button";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
      <div className="flex justify-center items-center h-64 bg-pebble rounded-md shadow-sm p-6">
        <div className="flex gap-4 flex-col sm:flex-row">
          <Button onClick={onToggleLeftPanel} variant="outline" className="flex gap-2">
            <ChevronRight size={18} />
            <span className="whitespace-nowrap overflow-hidden text-ellipsis">
              {leftPanelTitle || "Show Left Panel"}
            </span>
          </Button>
          <Button onClick={onToggleRightPanel} variant="outline" className="flex gap-2">
            <span className="whitespace-nowrap overflow-hidden text-ellipsis">
              {rightPanelTitle || "Show Right Panel"}
            </span>
            <ChevronLeft size={18} />
          </Button>
        </div>
      </div>
    );
  }

  // Calculate a dynamic height based on viewport
  const panelHeight = "calc(70vh - 4rem)";
  const minHeight = "400px";

  return (
    <div className="flex w-full" style={{ height: panelHeight, minHeight }}>
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
        <div className="w-full border-r border-gray-200 flex-shrink-0 overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="flex justify-between px-4 py-2 border-b sticky top-0 z-30 bg-white h-12 items-center">
              <div className="font-medium text-ellipsis overflow-hidden whitespace-nowrap">
                {leftPanelTitle}
              </div>
              <PanelNavigationButton 
                collapsed={leftPanelCollapsed}
                onClick={onToggleLeftPanel}
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
        <div className="flex-1 min-w-0 bg-white overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="flex justify-between px-4 py-2 border-b sticky top-0 z-30 bg-white h-12 items-center">
              <div className="font-medium text-ellipsis overflow-hidden whitespace-nowrap">
                {rightPanelTitle}
              </div>
              <PanelNavigationButton 
                collapsed={rightPanelCollapsed}
                onClick={onToggleRightPanel}
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
        </div>
      )}
    </div>
  );
}
