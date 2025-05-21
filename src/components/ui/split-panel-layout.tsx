import React, { useState } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { CollapsedPanelLayout } from "@/components/ui/collapsed-panel-layout";

interface SplitPanelLayoutProps {
  leftPanel?: React.ReactNode;
  middlePanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
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
  defaultLayout = [20, 40, 40],
  minSizes = ["15%", "30%", "25%"]
}: SplitPanelLayoutProps) {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [middleCollapsed, setMiddleCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  if (leftCollapsed || middleCollapsed || rightCollapsed) {
    return (
      <CollapsedPanelLayout
        leftPanelCollapsed={leftCollapsed}
        middlePanelCollapsed={middleCollapsed}
        rightPanelCollapsed={rightCollapsed}
        leftPanel={leftPanel}
        middlePanel={middlePanel}
        rightPanel={rightPanel}
        leftPanelTitle={leftPanelTitle}
        middlePanelTitle={middlePanelTitle}
        rightPanelTitle={rightPanelTitle}
        onToggleLeftPanel={() => setLeftCollapsed(!leftCollapsed)}
        onToggleMiddlePanel={() => setMiddleCollapsed(!middleCollapsed)}
        onToggleRightPanel={() => setRightCollapsed(!rightCollapsed)}
      />
    );
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="w-full h-full">
      {leftPanel && (
        <>
          <ResizablePanel defaultSize={defaultLayout[0]} minSize={10} className="bg-white">
            <PanelContainer title={leftPanelTitle} onCollapse={() => setLeftCollapsed(true)}>
              {leftPanel}
            </PanelContainer>
          </ResizablePanel>
          <ResizableHandle withHandle />
        </>
      )}

      {middlePanel && (
        <>
          <ResizablePanel defaultSize={defaultLayout[1]} minSize={30} className="bg-white">
            <PanelContainer title={middlePanelTitle} onCollapse={() => setMiddleCollapsed(true)}>
              {middlePanel}
            </PanelContainer>
          </ResizablePanel>
          {rightPanel && <ResizableHandle withHandle />}
        </>
      )}

      {rightPanel && (
        <ResizablePanel defaultSize={defaultLayout[2]} minSize={25} className="bg-gray-50">
          <PanelContainer title={rightPanelTitle} onCollapse={() => setRightCollapsed(true)} bg="bg-gray-50">
            {rightPanel}
          </PanelContainer>
        </ResizablePanel>
      )}
    </ResizablePanelGroup>
  );
}

const PanelContainer: React.FC<{
  title?: string;
  onCollapse: () => void;
  children: React.ReactNode;
  bg?: string;
}> = ({ title, onCollapse, children, bg = "bg-white" }) => (
  <div className="h-full flex flex-col">
    <div className={`flex justify-between px-4 py-2.5 border-b sticky top-0 z-30 ${bg} h-11 items-center`}>
      <div className="font-medium text-sm">{title}</div>
      <button
        onClick={onCollapse}
        className="p-1 h-7 w-7 flex items-center justify-center hover:bg-muted rounded-full transition-all duration-200"
        title={`Hide ${title}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
          className="h-4 w-4">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
    </div>
    <div className={`flex-grow overflow-auto p-4 ${bg}`}>{children}</div>
  </div>
);
