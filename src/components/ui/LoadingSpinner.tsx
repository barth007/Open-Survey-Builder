import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    text?: string;
    className?: string;
    fullScreen?: boolean;
}

export function LoadingSpinner({
    text = 'Loading...',
    className = '',
    fullScreen = false
}: LoadingSpinnerProps) {
    const content = (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            {text && <p className="text-sm font-medium text-muted-foreground">{text}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                {content}
            </div>
        );
    }

    return content;
}
