import * as ResizablePrimitive from "react-resizable-panels"
import { cn } from "@/lib/utils"
import React from "react"

// We're keeping the panel group but making it non-resizable
const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn(
      "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
      className
    )}
    {...props}
  />
)

// Keep the panel component but remove resize functionality
const ResizablePanel = ResizablePrimitive.Panel

// Fix the ResizableHandle component to properly handle props
const ResizableHandle = ({
  className
}: {
  className?: string
  withHandle?: boolean
}) => {
  // Create a simple div with the right styling instead of using ResizablePrimitive component
  return (
    <div
      className={cn(
        "relative flex w-px items-center justify-center bg-border",
        className
      )}
    />
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
