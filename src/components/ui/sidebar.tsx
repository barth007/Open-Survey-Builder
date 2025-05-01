
import React from "react";

export const SidebarGroup: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  className, 
  children,
  ...props 
}) => (
  <div className={`mb-4 ${className || ""}`} {...props}>
    {children}
  </div>
);

export const SidebarGroupLabel: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  className, 
  children,
  ...props 
}) => (
  <div className={`text-sm font-medium mb-2 ${className || ""}`} {...props}>
    {children}
  </div>
);

export const SidebarGroupContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  className, 
  children,
  ...props 
}) => (
  <div className={`space-y-1 ${className || ""}`} {...props}>
    {children}
  </div>
);

export const SidebarMenuItem: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  className, 
  children,
  ...props 
}) => (
  <div className={`rounded-md ${className || ""}`} {...props}>
    {children}
  </div>
);

export const SidebarMenuButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  asChild?: boolean 
}> = ({ 
  className, 
  children,
  asChild = false,
  ...props 
}) => {
  if (asChild) {
    return React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child as React.ReactElement<any>, {
          className: `flex items-center w-full px-2 py-1 text-sm rounded-md hover:bg-gray-100 ${className || ""}`
        });
      }
      return child;
    });
  }
  
  return (
    <button 
      className={`flex items-center w-full px-2 py-1 text-sm rounded-md hover:bg-gray-100 ${className || ""}`} 
      {...props}
    >
      {children}
    </button>
  );
};
