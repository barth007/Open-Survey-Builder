
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QuestionOption } from '@/types/survey';
import LikertOptionForm from './LikertOptionForm';

interface LikertOptionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  options: QuestionOption[];
  onSave: (options: QuestionOption[]) => void;
}

const LikertOptionsDialog: React.FC<LikertOptionsDialogProps> = ({
  isOpen,
  onClose,
  options,
  onSave,
}) => {
  const [editedOptions, setEditedOptions] = useState<QuestionOption[]>(options);

  const handleOptionTextChange = (index: number, text: string) => {
    const newOptions = [...editedOptions];
    newOptions[index] = { ...newOptions[index], text };
    setEditedOptions(newOptions);
  };

  const handleSave = () => {
    onSave(editedOptions);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Customize Likert Scale Options</DialogTitle>
          <DialogDescription>
            Edit the text for each option in your Likert scale.
          </DialogDescription>
        </DialogHeader>
        
        <LikertOptionForm options={editedOptions} onOptionTextChange={handleOptionTextChange} />
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="mr-2">Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LikertOptionsDialog;
