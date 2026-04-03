import * as React from 'react';
import { PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type SidebarState = 'expanded' | 'collapsed';

type SidebarContextValue = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  collapsed: boolean;
  collapsedWidth: number;
  state: SidebarState;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);

  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }

  return context;
}

export function SidebarProvider({
  children,
  collapsible = false,
  collapsedWidth = 64,
  defaultOpen = true,
}: {
  children: React.ReactNode;
  collapsible?: boolean | 'icon';
  collapsedWidth?: number;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const collapsed = Boolean(collapsible) && !open;

  const value = React.useMemo<SidebarContextValue>(() => ({
    open,
    setOpen,
    collapsed,
    collapsedWidth,
    state: collapsed ? 'collapsed' : 'expanded',
  }), [collapsed, collapsedWidth, open]);

  return (
    <SidebarContext.Provider value={value}>
      <div
        data-sidebar-state={value.state}
        className="flex min-h-0 min-w-0 flex-1"
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export const Sidebar = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement> & {
  collapsible?: boolean | 'icon';
}>(({ className, children, ...props }, ref) => {
  const { collapsed, collapsedWidth } = useSidebar();

  return (
    <aside
      ref={ref}
      data-collapsed={collapsed ? 'true' : 'false'}
      className={cn(
        'flex h-full flex-shrink-0 flex-col transition-[width] duration-200 ease-out',
        collapsed ? `w-[${collapsedWidth}px]` : 'w-[var(--sidebar-width,16rem)]',
        className,
      )}
      style={{
        width: collapsed ? collapsedWidth : undefined,
        ...props.style,
      }}
      {...props}
    >
      {children}
    </aside>
  );
});
Sidebar.displayName = 'Sidebar';

export const SidebarInset = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex min-h-0 min-w-0 flex-1 flex-col', className)}
      {...props}
    />
  ),
);
SidebarInset.displayName = 'SidebarInset';

export const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden', className)}
      {...props}
    />
  ),
);
SidebarContent.displayName = 'SidebarContent';

export const SidebarGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col', className)}
      {...props}
    />
  ),
);
SidebarGroup.displayName = 'SidebarGroup';

export const SidebarGroupLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground', className)}
      {...props}
    />
  ),
);
SidebarGroupLabel.displayName = 'SidebarGroupLabel';

export const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col gap-1', className)}
      {...props}
    />
  ),
);
SidebarGroupContent.displayName = 'SidebarGroupContent';

export const SidebarMenu = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col gap-1', className)}
      {...props}
    />
  ),
);
SidebarMenu.displayName = 'SidebarMenu';

export const SidebarMenuItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('list-none', className)}
      {...props}
    />
  ),
);
SidebarMenuItem.displayName = 'SidebarMenuItem';

export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-muted/60',
        className,
      )}
      {...props}
    />
  ),
);
SidebarMenuButton.displayName = 'SidebarMenuButton';

export function SidebarTrigger({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { setOpen } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn('h-8 w-8', className)}
      onClick={() => setOpen((current) => !current)}
      {...props}
    >
      <PanelLeft className="h-4 w-4" />
    </Button>
  );
}

export default Sidebar;
