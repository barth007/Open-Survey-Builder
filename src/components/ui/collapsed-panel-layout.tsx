
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { PanelNavigationButton } from "@/components/ui/panel-navigation-button";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CollapsedPanelLayoutProps {
  leftPanelCollapsed: boolean;
  middlePanelCollapsed: boolean;
  rightPanelCollapsed: boolean;
  leftPanel: React.ReactNode;
  middlePanel: React.ReactNode;
  rightPanel: React.ReactNode;
  leftPanelTitle?: string;
  middlePanelTitle?: string;
  rightPanelTitle?: string;
  onToggleLeftPanel: () => void;
  onToggleMiddlePanel: () => void;
  onToggleRightPanel: () => void;
}

export function CollapsedPanelLayout({
  leftPanelCollapsed,
  middlePanelCollapsed,
  rightPanelCollapsed,
  leftPanel,
  middlePanel,
  rightPanel,
  leftPanelTitle,
  middlePanelTitle,
  rightPanelTitle,
  onToggleLeftPanel,
  onToggleMiddlePanel,
  onToggleRightPanel
}: CollapsedPanelLayoutProps) {
  // If all panels are collapsed, show controls to expand them
  if (leftPanelCollapsed && middlePanelCollapsed && rightPanelCollapsed) {
    return (
      <div className="flex justify-center items-center bg-gray-50 h-full w-full">
        <div className="flex gap-4 flex-col sm:flex-row">
          <Button onClick={onToggleLeftPanel} variant="outline" className="flex gap-2">
            <ChevronRight size={18} />
            <span className="whitespace-nowrap overflow-hidden text-ellipsis">
              {leftPanelTitle || "Show Navigation"}
            </span>
          </Button>
          <Button onClick={onToggleMiddlePanel} variant="outline" className="flex gap-2">
            <ChevronRight size={18} />
            <span className="whitespace-nowrap overflow-hidden text-ellipsis">
              {middlePanelTitle || "Show Editor"}
            </span>
          </Button>
          <Button onClick={onToggleRightPanel} variant="outline" className="flex gap-2">
            <ChevronRight size={18} />
            <span className="whitespace-nowrap overflow-hidden text-ellipsis">
              {rightPanelTitle || "Show Preview"}
            </span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full h-full">
      {/* Left Panel (Navigation) */}
      {leftPanelCollapsed ? (
        <div className="w-10 border-r border-gray-200 flex items-start bg-white">
          <div className="sticky top-0 z-30 bg-white h-11 w-10 flex items-center justify-center border-b">
            <PanelNavigationButton 
              collapsed={leftPanelCollapsed}
              onClick={onToggleLeftPanel}
              direction="right"
              title={`Show ${leftPanelTitle || "navigation"}`}
            />
          </div>
        </div>
      ) : (
        <div className="w-1/4 border-r border-gray-200 flex-shrink-0 overflow-hidden bg-white">
          <div className="h-full flex flex-col">
            <div className="flex justify-between px-4 py-2.5 border-b sticky top-0 z-30 bg-white h-11 items-center">
              <div className="font-medium text-sm text-ellipsis overflow-hidden whitespace-nowrap">
                {leftPanelTitle}
              </div>
              <PanelNavigationButton 
                collapsed={leftPanelCollapsed}
                onClick={onToggleLeftPanel}
                direction="left"
                title={`Hide ${leftPanelTitle || "navigation"}`}
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
        </div>
      )}
      
      {/* Middle Panel (Editor) */}
      {middlePanelCollapsed ? (
        <div className="w-10 border-r border-gray-200 flex items-start bg-white">
          <div className="sticky top-0 z-30 bg-white h-11 w-10 flex items-center justify-center border-b">
            <PanelNavigationButton 
              collapsed={middlePanelCollapsed}
              onClick={onToggleMiddlePanel}
              direction="right"
              title={`Show ${middlePanelTitle || "editor"}`}
            />
          </div>
        </div>
      ) : (
        <div className="w-2/5 border-r border-gray-200 flex-shrink-0 overflow-hidden bg-white">
          <div className="h-full flex flex-col">
            <div className="flex justify-between px-4 py-2.5 border-b sticky top-0 z-30 bg-white h-11 items-center">
              <div className="font-medium text-sm text-ellipsis overflow-hidden whitespace-nowrap">
                {middlePanelTitle}
              </div>
              <PanelNavigationButton 
                collapsed={middlePanelCollapsed}
                onClick={onToggleMiddlePanel}
                direction="right"
                title={`Hide ${middlePanelTitle || "editor"}`}
              />
            </div>
            <div className="flex-grow overflow-auto">
              <ScrollArea className="h-full">
                <div className="px-4 py-4">
                  {middlePanel || (
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
        </div>
      )}
      
      {/* Right Panel (Preview) */}
      {rightPanelCollapsed ? (
        <div className="w-10 border-l border-gray-200 flex items-start bg-white">
          <div className="sticky top-0 z-30 bg-white h-11 w-10 flex items-center justify-center border-b">
            <PanelNavigationButton 
              collapsed={rightPanelCollapsed}
              onClick={onToggleRightPanel}
              direction="left"
              title={`Show ${rightPanelTitle || "preview"}`}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 min-w-0 bg-white overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="flex justify-between px-4 py-2.5 border-b sticky top-0 z-30 bg-white h-11 items-center">
              <div className="font-medium text-sm text-ellipsis overflow-hidden whitespace-nowrap">
                {rightPanelTitle}
              </div>
              <PanelNavigationButton 
                collapsed={rightPanelCollapsed}
                onClick={onToggleRightPanel}
                direction="right"
                title={`Hide ${rightPanelTitle || "preview"}`}
              />
            </div>
            <div className="flex-grow bg-gray-50 overflow-auto">
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
        </div>
      )}
    </div>
  );
}
