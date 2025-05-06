
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface ChangeRoleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  memberName: string | null;
  currentRole: string;
  onConfirm: (newRole: 'admin' | 'member') => void;
}

export const ChangeRoleDialog = ({
  isOpen,
  onOpenChange,
  memberName,
  currentRole,
  onConfirm
}: ChangeRoleDialogProps) => {
  const [selectedRole, setSelectedRole] = useState<'admin' | 'member'>(
    (currentRole === 'admin' || currentRole === 'member') ? currentRole : 'member'
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (selectedRole === currentRole) {
      onOpenChange(false);
      return;
    }
    
    setIsLoading(true);
    try {
      await onConfirm(selectedRole);
      onOpenChange(false);
    } catch (error) {
      console.error('Error changing role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Member Role</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Member</Label>
            <p className="text-sm">{memberName || 'Team Member'}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role-select">Role</Label>
            <Select 
              value={selectedRole} 
              onValueChange={(value: 'admin' | 'member') => setSelectedRole(value)}
            >
              <SelectTrigger id="role-select">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" type="button">Cancel</Button>
          </DialogClose>
          <Button 
            onClick={handleConfirm} 
            disabled={isLoading || selectedRole === currentRole}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
