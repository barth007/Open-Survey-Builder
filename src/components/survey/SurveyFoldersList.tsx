import React, { useState } from 'react';
import { Plus, Folder, FolderOpen, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { SurveyFolder, Survey } from '@/types/survey-organization';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';

interface SurveyFoldersListProps {
  folders: SurveyFolder[];
  unorganizedSurveys: Survey[];
  onCreateFolder: (name: string) => Promise<void>;
  onDeleteFolder: (id: string) => void;
  onDeleteSurvey: (id: string) => void;
  onUpdateOrder: (activeId: string, overId: string) => void;
  onCreateSurvey: (params: { name: string; folderId?: string }) => Promise<any>;
}

export function SurveyFoldersList({
  folders,
  unorganizedSurveys,
  onCreateFolder,
  onDeleteFolder,
  onDeleteSurvey,
  onUpdateOrder,
  onCreateSurvey
}: SurveyFoldersListProps) {
  const [openFolderIds, setOpenFolderIds] = useState<Set<string>>(new Set());
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  
  const toggleFolder = (folderId: string) => {
    setOpenFolderIds(prev => {
      const updated = new Set(prev);
      if (updated.has(folderId)) {
        updated.delete(folderId);
      } else {
        updated.add(folderId);
      }
      return updated;
    });
  };
  
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast("Please enter a folder name");
      return;
    }
    
    try {
      await onCreateFolder(newFolderName);
      setNewFolderName("");
      setIsCreateFolderDialogOpen(false);
      toast("Folder created successfully");
    } catch (error) {
      console.error("Error creating folder:", error);
      toast("Failed to create folder");
    }
  };
  
  const handleCreateSurveyInFolder = async (folderId: string) => {
    try {
      await onCreateSurvey({ name: "New Survey", folderId });
      toast("Survey created successfully");
    } catch (error) {
      console.error("Error creating survey:", error);
      toast("Failed to create survey");
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Folders</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsCreateFolderDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1" /> New Folder
        </Button>
      </div>
      
      {/* Folders list */}
      <div className="space-y-2">
        {folders.map(folder => (
          <div key={folder.id} className="space-y-1">
            <div className="flex items-center justify-between group">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start text-left" 
                onClick={() => toggleFolder(folder.id)}
              >
                {openFolderIds.has(folder.id) ? (
                  <FolderOpen className="h-4 w-4 mr-2" />
                ) : (
                  <Folder className="h-4 w-4 mr-2" />
                )}
                {folder.name}
              </Button>
              
              <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-7 w-7" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateSurveyInFolder(folder.id);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-7 w-7 text-red-500" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFolder(folder.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {openFolderIds.has(folder.id) && folder.surveys.length > 0 && (
              <div className="pl-6 space-y-1">
                {folder.surveys.map(survey => (
                  <div key={survey.id} className="flex items-center justify-between group">
                    <Link 
                      to={`/survey/${survey.id}`}
                      className="text-sm py-1 px-2 rounded-md hover:bg-gray-100 w-full text-left"
                    >
                      {survey.name}
                    </Link>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6 text-red-500 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.preventDefault();
                        onDeleteSurvey(survey.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6">
        <h3 className="font-medium mb-2">Other Surveys</h3>
        <div className="space-y-1">
          {unorganizedSurveys.map(survey => (
            <div key={survey.id} className="flex items-center justify-between group">
              <Link 
                to={`/survey/${survey.id}`}
                className="text-sm py-1 px-2 rounded-md hover:bg-gray-100 w-full text-left"
              >
                {survey.name}
              </Link>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-6 w-6 text-red-500 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.preventDefault();
                  onDeleteSurvey(survey.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Create folder dialog */}
      <Dialog open={isCreateFolderDialogOpen} onOpenChange={setIsCreateFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateFolderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
