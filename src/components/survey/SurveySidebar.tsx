import React from 'react';
import { Link } from 'react-router-dom';
import { Folder, FolderOpen, Plus, Trash2 } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { useToast } from "@/hooks/use-toast";
import { useSurveyData } from '@/hooks/useSurveyData';

export function SurveySidebar() {
  const [openFolders, setOpenFolders] = React.useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { surveyData, isLoading, createSurvey, deleteSurvey, deleteFolder } = useSurveyData();

  const toggleFolder = (folderId: string) => {
    setOpenFolders((current) => {
      const newSet = new Set(current);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleDeleteSurvey = async (surveyId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await deleteSurvey(surveyId);
      toast({
        title: "Success",
        description: "Survey deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete survey",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFolder = async (folderId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await deleteFolder(folderId);
      toast({
        title: "Success",
        description: "Folder deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete folder",
        variant: "destructive",
      });
    }
  };

  const handleCreateSurvey = async (folderId?: string) => {
    try {
      await createSurvey({
        name: "New Survey",
        folderId
      });
      toast({
        title: "Success",
        description: "Survey created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create survey",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Sidebar>
      <SidebarContent>
        {/* Folders Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Folders</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {surveyData?.folders.map((folder) => (
                <SidebarMenuItem key={folder.id}>
                  <SidebarMenuButton 
                    onClick={() => toggleFolder(folder.id)}
                    className="w-full justify-start gap-2 group"
                  >
                    {openFolders.has(folder.id) ? <FolderOpen /> : <Folder />}
                    <span>{folder.name}</span>
                  </SidebarMenuButton>
                  
                  {/* Add button for folder */}
                  <SidebarMenuAction
                    showOnHover
                    onClick={() => handleCreateSurvey(folder.id)}
                    className="right-8"
                  >
                    <Plus className="h-4 w-4" />
                  </SidebarMenuAction>

                  {/* Delete button for folder */}
                  <SidebarMenuAction
                    showOnHover
                    onClick={(e) => handleDeleteFolder(folder.id, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </SidebarMenuAction>

                  {openFolders.has(folder.id) && folder.surveys.map((survey) => (
                    <SidebarMenuItem key={survey.id} className="pl-8">
                      <SidebarMenuButton asChild>
                        <Link to={`/survey/${survey.id}`} className="w-full justify-start">
                          {survey.name}
                        </Link>
                      </SidebarMenuButton>
                      
                      {/* Delete button for survey within folder */}
                      <SidebarMenuAction
                        showOnHover
                        onClick={(e) => handleDeleteSurvey(survey.id, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </SidebarMenuAction>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Unorganized Surveys Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex justify-between items-center">
            <span>Other Surveys</span>
            <button
              onClick={() => handleCreateSurvey()}
              className="hover:bg-sidebar-accent rounded-md p-1"
            >
              <Plus className="h-4 w-4" />
            </button>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {surveyData?.unorganizedSurveys.map((survey) => (
                <SidebarMenuItem key={survey.id}>
                  <SidebarMenuButton asChild>
                    <Link to={`/survey/${survey.id}`} className="w-full justify-start">
                      {survey.name}
                    </Link>
                  </SidebarMenuButton>
                  
                  {/* Delete button for unorganized survey */}
                  <SidebarMenuAction
                    showOnHover
                    onClick={(e) => handleDeleteSurvey(survey.id, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </SidebarMenuAction>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
