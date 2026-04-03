import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';

interface TextQuestionRendererProps {
  value: string;
  onChange: (value: string) => void;
}

export const TextQuestionRenderer: React.FC<TextQuestionRendererProps> = ({
  value,
  onChange
}) => {
  return (
    <div className="w-full">
      <TextareaAutosize
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your answer here..."
        className="w-full min-h-[100px] py-4 text-xl font-medium border-none bg-transparent p-0 m-0 focus-visible:outline-none placeholder:text-muted-foreground/20 text-foreground resize-none border-b border-border/10 focus:border-primary/20 transition-colors"
      />
    </div>
  );
};
