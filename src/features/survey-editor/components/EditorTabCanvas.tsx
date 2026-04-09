import React from 'react';

import { cn } from '@/lib/utils';

interface EditorTabCanvasProps {
  children: React.ReactNode;
  width?: 'document' | 'wide';
  className?: string;
  contentClassName?: string;
  onCanvasClick?: () => void;
}

export const EditorTabCanvas: React.FC<EditorTabCanvasProps> = ({
  children,
  width = 'document',
  className,
  contentClassName,
  onCanvasClick,
}) => {
  return (
    <div
      className={cn('w-full h-full flex-1 overflow-y-auto overflow-x-hidden bg-[#f6f5f3]', className)}
      onClick={onCanvasClick}
    >
      <div
        className={cn(
          'mx-auto px-4 py-16 sm:px-8',
          width === 'document' ? 'max-w-3xl' : 'max-w-6xl',
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
};
