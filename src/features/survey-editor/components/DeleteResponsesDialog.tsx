
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface DeleteResponsesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (softDelete: boolean) => void;
  participantInfo: string;
  responseCount: number;
  isDeleting: boolean;
}

export const DeleteResponsesDialog: React.FC<DeleteResponsesDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  participantInfo,
  responseCount,
  isDeleting
}) => {
  const [softDelete, setSoftDelete] = useState(true);

  const handleConfirm = () => {
    onConfirm(softDelete);
    setSoftDelete(true);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Responses</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div>
              Are you sure you want to delete all responses from{' '}
              <strong>{participantInfo}</strong>?
            </div>
            <div className="text-sm text-muted-foreground">
              This will affect {responseCount} response{responseCount !== 1 ? 's' : ''}.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="soft-delete"
              checked={softDelete}
              onCheckedChange={(checked) => setSoftDelete(checked as boolean)}
            />
            <Label htmlFor="soft-delete" className="text-sm">
              Hide instead of permanently delete (recommended)
            </Label>
          </div>

          <div className="text-xs text-muted-foreground">
            {softDelete ? (
              "Hidden responses can be restored later from the admin panel."
            ) : (
              "⚠️ Permanent deletion cannot be undone."
            )}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : softDelete ? 'Hide Responses' : 'Delete Permanently'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
