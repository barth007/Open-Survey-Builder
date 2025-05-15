import * as ResizablePrimitive from "react-resizable-panels"
import { cn } from "@/lib/utils"

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

// We'll keep this component for backwards compatibility, but it won't be used
const ResizableHandle = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
}) => (
  <div
    className={cn(
      "relative flex w-px items-center justify-center bg-border",
      className
    )}
    {...props}
  />
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
