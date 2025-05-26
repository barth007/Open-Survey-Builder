
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
    <ResizablePanelGroup direction="horizontal" className="w-full h-full">
      {leftPanel && (
        <>
          <ResizablePanel defaultSize={defaultLayout[0]} minSize={10} className="bg-white">
            <PanelContainer title={leftPanelTitle}>
              {leftPanel}
            </PanelContainer>
          </ResizablePanel>
          <ResizableHandle withHandle />
        </>
      )}

      {middlePanel && (
        <>
          <ResizablePanel defaultSize={defaultLayout[1]} minSize={30} className="bg-white">
            <PanelContainer title={middlePanelTitle}>
              {middlePanel}
            </PanelContainer>
          </ResizablePanel>
          {rightPanel && <ResizableHandle withHandle />}
        </>
      )}

      {rightPanel && (
        <ResizablePanel defaultSize={defaultLayout[2]} minSize={25} className="bg-gray-50">
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
  <div className="h-full flex flex-col">
    <div className={`flex justify-between px-4 py-2 border-b sticky top-0 z-30 ${bg} h-10 items-center flex-shrink-0`}>
      <div className="font-medium text-sm">{title}</div>
    </div>
    <div className={`flex-1 overflow-y-auto px-4 py-2 ${bg}`}>{children}</div>
  </div>
);
