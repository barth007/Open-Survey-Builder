
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QuestionOption } from '@/types/survey';

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
        <div className="grid gap-4 py-4">
          {editedOptions.map((option, index) => (
            <div key={option.id} className="grid grid-cols-12 items-center gap-2">
              <Label htmlFor={`option-${index}`} className="col-span-2 text-right">
                {index + 1}.
              </Label>
              <Input
                id={`option-${index}`}
                value={option.text}
                onChange={(e) => handleOptionTextChange(index, e.target.value)}
                className="col-span-10"
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="mr-2">Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LikertOptionsDialog;
