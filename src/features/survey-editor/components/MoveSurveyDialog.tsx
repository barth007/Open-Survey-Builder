
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FolderOpen } from "lucide-react";
import { useMutateSurvey } from '@/hooks/survey/useMutateSurvey';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from "@/components/ui/sonner";

interface MoveSurveyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  surveyId: string;
  currentFolderId?: string;
  folders: { id: string; name: string }[];
}

export function MoveSurveyDialog({
  isOpen,
  onClose,
  surveyId,
  currentFolderId,
  folders
}: MoveSurveyDialogProps) {
  const [selectedFolderId, setSelectedFolderId] = React.useState<string | undefined>(undefined);
  const { updateSurvey } = useMutateSurvey();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (isOpen) {
      setSelectedFolderId(undefined);
    }
  }, [isOpen]);

  const handleMove = async () => {
    try {
      // If "No folder" is selected, pass null to remove from current folder
      const folderId = selectedFolderId === 'none' ? null : selectedFolderId;
      
      // Don't make API call if the folder hasn't changed
      if (folderId === currentFolderId) {
        onClose();
        return;
      }
      
      await updateSurvey({
        surveyId,
        updates: {
          folderId
        },
        includeAssociations: true,
      });
      
      // Invalidate the surveys list to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      
      toast.success("Survey moved successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to move survey");
      console.error("Error moving survey:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move Survey</DialogTitle>
          <DialogDescription>
            Select a destination folder for this survey.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup value={selectedFolderId} onValueChange={setSelectedFolderId}>
            <div className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value="none" id="none" />
              <Label htmlFor="none" className="cursor-pointer">No folder (Unorganized)</Label>
            </div>
            
            {folders.map((folder) => (
              <div key={folder.id} className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value={folder.id} id={folder.id} />
                <Label htmlFor={folder.id} className="cursor-pointer flex items-center">
                  <FolderOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                  {folder.name}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleMove} 
            disabled={!selectedFolderId}
          >
            Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
