
import React from 'react';
import { Link } from 'react-router-dom';
import { Folder, FolderOpen } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import type { Survey, SurveyFolder } from '@/types/survey-organization';

// Mock data - replace with real data later
const MOCK_DATA: { folders: SurveyFolder[]; unorganizedSurveys: Survey[] } = {
  folders: [
    {
      id: '1',
      name: 'Customer Feedback',
      createdAt: new Date(),
      surveys: [
        { id: '1', name: 'Product Satisfaction', createdAt: new Date(), folderId: '1' },
        { id: '2', name: 'Website Usability', createdAt: new Date(), folderId: '1' },
      ],
    },
    {
      id: '2',
      name: 'Employee Surveys',
      createdAt: new Date(),
      surveys: [
        { id: '3', name: 'Work Environment', createdAt: new Date(), folderId: '2' },
      ],
    },
  ],
  unorganizedSurveys: [
    { id: '4', name: 'General Feedback', createdAt: new Date() },
  ],
};

export function SurveySidebar() {
  const [openFolders, setOpenFolders] = React.useState<Set<string>>(new Set());

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

  return (
    <Sidebar>
      <SidebarContent>
        {/* Folders Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Folders</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MOCK_DATA.folders.map((folder) => (
                <SidebarMenuItem key={folder.id}>
                  <SidebarMenuButton 
                    onClick={() => toggleFolder(folder.id)}
                    className="w-full justify-start gap-2"
                  >
                    {openFolders.has(folder.id) ? <FolderOpen /> : <Folder />}
                    <span>{folder.name}</span>
                  </SidebarMenuButton>
                  {openFolders.has(folder.id) && folder.surveys.map((survey) => (
                    <SidebarMenuItem key={survey.id} className="pl-8">
                      <SidebarMenuButton asChild>
                        <Link to={`/survey/${survey.id}`} className="w-full justify-start">
                          {survey.name}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Unorganized Surveys Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Other Surveys</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MOCK_DATA.unorganizedSurveys.map((survey) => (
                <SidebarMenuItem key={survey.id}>
                  <SidebarMenuButton asChild>
                    <Link to={`/survey/${survey.id}`} className="w-full justify-start">
                      {survey.name}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
