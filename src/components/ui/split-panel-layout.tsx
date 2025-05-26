
import React from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

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
  return (
    <ResizablePanelGroup direction="horizontal" className="w-full h-full overflow-hidden min-w-0">
      {leftPanel && (
        <>
          <ResizablePanel defaultSize={defaultLayout[0]} minSize={Number(minSizes[0].replace('%',''))} className="bg-white overflow-auto min-w-0">
            <PanelContainer title={leftPanelTitle}>
              {leftPanel}
            </PanelContainer>
          </ResizablePanel>
          <ResizableHandle withHandle />
        </>
      )}

      {middlePanel && (
        <>
          <ResizablePanel defaultSize={defaultLayout[1]} minSize={Number(minSizes[1].replace('%',''))} className="bg-white overflow-auto min-w-0">
            <PanelContainer title={middlePanelTitle}>
              {middlePanel}
            </PanelContainer>
          </ResizablePanel>
          {rightPanel && <ResizableHandle withHandle />}
        </>
      )}

      {rightPanel && (
        <ResizablePanel defaultSize={defaultLayout[2]} minSize={Number(minSizes[2].replace('%',''))} className="bg-white overflow-auto min-w-0">
          <PanelContainer title={rightPanelTitle} bg="bg-gray-50">
            {rightPanel}
          </PanelContainer>
        </ResizablePanel>
      )}
    </ResizablePanelGroup>
  );
}

const PanelContainer: React.FC<{
  title?: string;
  children: React.ReactNode;
  bg?: string;
}> = ({ title, children, bg = "bg-white" }) => (
  <div className={`h-full flex flex-col ${bg} overflow-hidden`}>
    <div className={`flex justify-between px-2 py-2 border-b sticky top-0 z-30 ${bg} h-10 items-center flex-shrink-0`}>
      <div className="font-medium text-sm">{title}</div>
    </div>
    <div className={`flex-1 overflow-auto px-1 py-2 ${bg} w-full min-w-0`}>
      {children}
    </div>
  </div>
);
