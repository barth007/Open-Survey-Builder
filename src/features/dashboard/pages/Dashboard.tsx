
import React from 'react';
import { useSurveyData } from '@/hooks/useSurveyData';
import { SurveyNavigationHeader } from '@/features/survey-editor/components/SurveyNavigationHeader';;
import { SurveySidebar } from '@/components/survey/SurveySidebar';

import { FolderCard } from '@/components/dashboard/FolderCard';
import { SurveyCard } from '@/components/dashboard/SurveyCard';
import { useActiveUsers } from '@/hooks/useActiveUsers';
import { Loader2 } from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';

const Dashboard = () => {
  const { surveyData, isLoading, error } = useSurveyData();
  const { activeUsers } = useActiveUsers(undefined);

  if (isLoading) {
    return (
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full">
          <SurveySidebar />
          <div className="flex-1 flex flex-col">
            <SurveyNavigationHeader activeUsers={activeUsers} />
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full">
          <SurveySidebar />
          <div className="flex-1 flex flex-col">
            <SurveyNavigationHeader activeUsers={activeUsers} />
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-8 max-w-md text-destructive">
                <h2 className="text-2xl font-semibold mb-4">Error Loading Dashboard</h2>
                <p>{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full">
        <SurveySidebar />
        <div className="flex-1 flex flex-col bg-background">
          <SurveyNavigationHeader activeUsers={activeUsers} />
          <main className="flex-1 p-6 pt-20 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Folder Cards */}
                {surveyData?.folders.map((folder) => (
                  <FolderCard key={folder.id} folder={folder} />
                ))}
                
                {/* Unorganized Survey Cards */}
                {surveyData?.unorganizedSurveys.map((survey) => (
                  <SurveyCard key={survey.id} survey={survey} />
                ))}
              </div>

              {/* Empty state */}
              {(!surveyData?.folders.length && !surveyData?.unorganizedSurveys.length) && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No surveys yet</h3>
                  <p className="text-muted-foreground">Create your first survey to get started.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
