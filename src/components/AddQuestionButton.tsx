
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AddQuestionButtonProps {
  onClick: () => void;
}

const AddQuestionButton: React.FC<AddQuestionButtonProps> = ({ onClick }) => {
  return (
    <Button 
      onClick={onClick} 
      variant="outline" 
      className="w-full border-dashed border-abyss flex items-center justify-center gap-2 h-20 hover:bg-abyss hover:text-white transition-colors"
    >
      <Plus size={20} />
      <span>Add Question</span>
    </Button>
  );
};

export default AddQuestionButton;
