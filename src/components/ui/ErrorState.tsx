import React from 'react';
import { Button } from './button';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
    title?: string;
    message?: string;
    error?: Error | unknown;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
    fullScreen?: boolean;
}

export function ErrorState({
    title = 'An unexpected error occurred',
    message,
    error,
    actionLabel = 'Try Again',
    onAction,
    className,
    fullScreen = false
}: ErrorStateProps) {
    const errorMessage = message || (error instanceof Error ? error.message : 'Please try again later.');

    const content = (
        <Card className={cn("w-full max-w-md shadow-sm border-destructive/20", className)}>
            <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-4 bg-destructive/10 p-3 rounded-full w-fit text-destructive">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                <CardDescription className="text-base">{errorMessage}</CardDescription>
            </CardContent>
            {onAction && (
                <CardFooter className="flex justify-center pt-2">
                    <Button variant="outline" onClick={onAction} className="gap-2">
                        {actionLabel}
                    </Button>
                </CardFooter>
            )}
        </Card>
    );

    if (fullScreen) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center bg-background p-4">
                {content}
            </div>
        );
    }

    return content;
}
