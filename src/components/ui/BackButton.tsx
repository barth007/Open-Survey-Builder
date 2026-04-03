import React from 'react';
import { Button } from './button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BackButtonProps {
    to?: string;
    label?: string;
    className?: string;
    onClick?: () => void;
}

export function BackButton({
    to,
    label = 'Back',
    className,
    onClick
}: BackButtonProps) {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onClick) {
            onClick();
        } else if (to) {
            navigate(to);
        } else {
            navigate(-1);
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            className={cn("flex items-center gap-2 text-muted-foreground hover:text-foreground -ml-2", className)}
            onClick={handleBack}
        >
            <ArrowLeft className="h-4 w-4" />
            {label}
        </Button>
    );
}
