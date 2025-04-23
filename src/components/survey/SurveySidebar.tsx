
import React from 'react';
import { Sidebar, SidebarHeader, SidebarContent } from "@/components/ui/sidebar";
import { SurveyFolders } from './SurveyFolders';
import { UnorganizedSurveys } from './UnorganizedSurveys';
import { useSurveyData } from '@/hooks/useSurveyData';

export function SurveySidebar() {
  const { surveyData, isLoading, error, createSurvey, createFolder, deleteSurvey, deleteFolder, updateSurveyOrder } = useSurveyData();
  const [openFolders, setOpenFolders] = React.useState<Set<string>>(new Set());

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <h2 className="text-lg font-semibold">Survey Builder</h2>
      </SidebarHeader>
      <SidebarContent>
        <SurveyFolders 
          folders={surveyData?.folders || []}
          openFolders={openFolders}
          onToggleFolder={(id) => {
            setOpenFolders(current => {
              const newSet = new Set(current);
              if (newSet.has(id)) {
                newSet.delete(id);
              } else {
                newSet.add(id);
              }
              return newSet;
            });
          }}
          onCreateFolder={createFolder}
          onCreateSurvey={createSurvey}
          onDeleteSurvey={deleteSurvey}
          onDeleteFolder={deleteFolder}
          onUpdateOrder={updateSurveyOrder}
        />
        <UnorganizedSurveys
          surveys={surveyData?.unorganizedSurveys || []}
          onCreateSurvey={() => createSurvey({ name: "New Survey" })}
          onDeleteSurvey={deleteSurvey}
          onUpdateOrder={updateSurveyOrder}
        />
      </SidebarContent>
    </Sidebar>
  );
}
