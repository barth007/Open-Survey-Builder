
import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Globe, ArrowLeft } from 'lucide-react';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from '@/components/ui/navigation-menu';
import { Separator } from '@/components/ui/separator';

interface PublicSidebarLayoutProps {
  children: ReactNode;
  surveyTitle: string;
  isPreviewMode?: boolean;
}

export const PublicSidebarLayout: React.FC<PublicSidebarLayoutProps> = ({ 
  children, 
  surveyTitle,
  isPreviewMode = false 
}) => {
  // Function to go back to the previous page
  const handleBackClick = () => {
    window.history.back();
  };

  return (
    <div className="flex min-h-screen">
      {/* Simplified sidebar */}
      <div className="hidden md:flex w-64 flex-col border-r border-border bg-sidebar">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Form Tapestry</h1>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start mb-4"
            onClick={handleBackClick}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <Separator className="my-4" />
          
          <div className="mt-2">
            <h2 className="text-sm font-medium mb-1">Survey</h2>
            <p className="text-xs text-muted-foreground line-clamp-2" title={surveyTitle}>
              {surveyTitle || "Untitled Survey"}
            </p>
          </div>
          
          {isPreviewMode && (
            <div className="mt-4 p-2 bg-amber-50 rounded-md border border-amber-200">
              <p className="text-xs text-amber-800 font-medium">Preview Mode</p>
              <p className="text-xs text-amber-700">Responses won't be recorded</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden w-full border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Form Tapestry</h1>
          </div>
          
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBackClick}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};
