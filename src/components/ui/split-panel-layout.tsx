
import React, { useState } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { CollapsedPanelLayout } from "@/components/ui/collapsed-panel-layout";

interface SplitPanelLayoutProps {
  leftPanel: React.ReactNode;
  middlePanel: React.ReactNode;
  rightPanel: React.ReactNode;
  leftPanelTitle?: string;
  middlePanelTitle?: string;
  rightPanelTitle?: string;
  defaultLayout?: number[];
  minSizes?: string[];
}

export function SplitPanelLayout({
  leftPanel,
  middlePanel,
  rightPanel,
  leftPanelTitle,
  middlePanelTitle,
  rightPanelTitle,
  defaultLayout = [25, 40, 35],
  minSizes = ["15%", "30%", "25%"]
}: SplitPanelLayoutProps) {
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [middlePanelCollapsed, setMiddlePanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  // If any panels are collapsed, use the CollapsedPanelLayout
  if (leftPanelCollapsed || middlePanelCollapsed || rightPanelCollapsed) {
    return (
      <CollapsedPanelLayout
        leftPanelCollapsed={leftPanelCollapsed}
        middlePanelCollapsed={middlePanelCollapsed}
        rightPanelCollapsed={rightPanelCollapsed}
        leftPanel={leftPanel}
        middlePanel={middlePanel}
        rightPanel={rightPanel}
        leftPanelTitle={leftPanelTitle}
        middlePanelTitle={middlePanelTitle}
        rightPanelTitle={rightPanelTitle}
        onToggleLeftPanel={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
        onToggleMiddlePanel={() => setMiddlePanelCollapsed(!middlePanelCollapsed)}
        onToggleRightPanel={() => setRightPanelCollapsed(!rightPanelCollapsed)}
      />
    );
  }

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-full w-full"
    >
      {/* Left Panel */}
      <ResizablePanel
        defaultSize={defaultLayout[0]}
        minSize={10}
        className="bg-white"
      >
        <div className="h-full flex flex-col">
          <div className="flex justify-between px-4 py-2.5 border-b sticky top-0 z-30 bg-white h-11 items-center">
            <div className="font-medium text-sm">{leftPanelTitle}</div>
            <button
              onClick={() => setLeftPanelCollapsed(true)}
              className="p-1 h-7 w-7 flex items-center justify-center hover:bg-muted rounded-full transition-all duration-200"
              title={`Hide ${leftPanelTitle}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
          </div>
          <div className="flex-grow overflow-auto p-4">
            {leftPanel}
          </div>
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Middle Panel */}
      <ResizablePanel
        defaultSize={defaultLayout[1]}
        minSize={30}
        className="bg-white"
      >
        <div className="h-full flex flex-col">
          <div className="flex justify-between px-4 py-2.5 border-b sticky top-0 z-30 bg-white h-11 items-center">
            <div className="font-medium text-sm">{middlePanelTitle}</div>
            <button
              onClick={() => setMiddlePanelCollapsed(true)}
              className="p-1 h-7 w-7 flex items-center justify-center hover:bg-muted rounded-full transition-all duration-200"
              title={`Hide ${middlePanelTitle}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
          </div>
          <div className="flex-grow overflow-auto p-4">
            {middlePanel}
          </div>
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Right Panel */}
      <ResizablePanel
        defaultSize={defaultLayout[2]}
        minSize={25}
        className="bg-gray-50"
      >
        <div className="h-full flex flex-col">
          <div className="flex justify-between px-4 py-2.5 border-b sticky top-0 z-30 bg-white h-11 items-center">
            <div className="font-medium text-sm">{rightPanelTitle}</div>
            <button
              onClick={() => setRightPanelCollapsed(true)}
              className="p-1 h-7 w-7 flex items-center justify-center hover:bg-muted rounded-full transition-all duration-200"
              title={`Hide ${rightPanelTitle}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
          <div className="flex-grow overflow-auto bg-gray-50 p-4">
            {rightPanel}
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
