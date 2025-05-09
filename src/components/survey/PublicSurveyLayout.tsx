
import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Globe, ArrowLeft } from 'lucide-react';

interface PublicSurveyLayoutProps {
  children: ReactNode;
  surveyTitle: string;
  isPreviewMode?: boolean;
}

export const PublicSurveyLayout: React.FC<PublicSurveyLayoutProps> = ({ 
  children, 
  surveyTitle,
  isPreviewMode = false 
}) => {

  return (
    <div className="flex flex-col min-h-screen">
      {/* Simple header instead of sidebar */}
      <header className="border-b border-border p-4 bg-background">
        <div className="container max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">{surveyTitle}</h1>
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
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};
