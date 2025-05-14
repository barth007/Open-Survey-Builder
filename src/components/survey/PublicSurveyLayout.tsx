
import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Globe, ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface PublicSurveyLayoutProps {
  children: ReactNode;
  surveyTitle: string;
  isPreviewMode?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
}

export const PublicSurveyLayout: React.FC<PublicSurveyLayoutProps> = ({ 
  children, 
  surveyTitle,
  isPreviewMode = false,
  showBackButton = false,
  onBack
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Simple header instead of sidebar */}
      <header className="border-b border-border p-3 md:p-4 bg-background">
        <div className="container max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 md:gap-2">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size={isMobile ? "sm" : "icon"}
                  onClick={onBack}
                  className="mr-1 md:mr-2"
                >
                  <ArrowLeft size={isMobile ? 16 : 18} />
                </Button>
              )}
              <h1 className={`font-semibold break-words ${isMobile ? 'text-base' : 'text-lg'} max-w-[200px] sm:max-w-xs md:max-w-md truncate`}>
                {surveyTitle}
              </h1>
            </div>
          </div>
          
          {/* Preview mode banner as a small indicator */}
          {isPreviewMode && (
            <div className="mt-2 p-2 bg-amber-50 rounded-md border border-amber-200">
              <p className="text-xs text-amber-800 font-medium">Preview Mode</p>
              <p className="text-xs text-amber-700">Responses won't be recorded</p>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-3 md:px-0">
        {children}
      </main>
    </div>
  );
};
