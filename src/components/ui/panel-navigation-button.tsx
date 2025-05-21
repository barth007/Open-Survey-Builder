
import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface NavigationButtonProps { 
  collapsed: boolean;
  onClick: () => void; 
  direction: "left" | "right";
  title?: string;
}

export function PanelNavigationButton({
  collapsed, 
  onClick, 
  direction, 
  title
}: NavigationButtonProps) {
  return (
    <Button 
      variant="ghost" 
      onClick={onClick} 
      className="p-1.5 h-8 w-8 flex items-center justify-center hover:bg-muted rounded-full transition-all duration-200"
      title={title || `Show ${direction === "left" ? "right" : "left"} panel`}
    >
      {direction === "left" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
    </Button>
  );
}
