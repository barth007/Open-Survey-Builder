
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QuestionOption } from '@/types/survey';

interface LikertOptionFormProps {
  options: QuestionOption[];
  onOptionTextChange: (index: number, text: string) => void;
}

const LikertOptionForm: React.FC<LikertOptionFormProps> = ({
  options,
  onOptionTextChange,
}) => {
  return (
    <div className="grid gap-4 py-4">
      {options.map((option, index) => (
        <div key={option.id} className="grid grid-cols-12 items-center gap-2">
          <Label htmlFor={`option-${index}`} className="col-span-2 text-right">
            {index + 1}.
          </Label>
          <Input
            id={`option-${index}`}
            value={option.text}
            onChange={(e) => onOptionTextChange(index, e.target.value)}
            className="col-span-10"
          />
        </div>
      ))}
    </div>
  );
};

export default LikertOptionForm;
