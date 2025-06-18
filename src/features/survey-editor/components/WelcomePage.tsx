import { debugLog, debugWarn } from '@/lib/logger';

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  welcomeTitle: string;
  welcomeMessage: string;
  welcomeInstructions: string;
  welcomeButtonText: string;
  onStart?: () => void;
}

export const WelcomePage: React.FC<Props> = ({
  welcomeTitle,
  welcomeMessage,
  welcomeInstructions,
  welcomeButtonText,
  onStart
}) => {
  debugLog('WelcomePage props received:', {
    welcomeTitle,
    welcomeMessage,
    welcomeInstructions,
    welcomeButtonText,
    hasOnStart: !!onStart
  });

  // Use fallbacks for empty strings but show content if it exists
  const displayTitle = welcomeTitle?.trim() || 'Welcome';
  const hasMessage = welcomeMessage?.trim();
  const hasInstructions = welcomeInstructions?.trim();
  const displayButtonText = welcomeButtonText?.trim() || 'Start';

  return (
    <Card className="w-full border border-abyss min-h-fit h-auto">
      <CardContent className="space-y-4 p-6">
        <h1 className="text-2xl font-semibold text-abyss">{displayTitle}</h1>

        {hasMessage && (
          <p className="text-gray-700 text-base">{welcomeMessage}</p>
        )}

        {hasInstructions && (
          <p className="text-sm text-gray-500">{welcomeInstructions}</p>
        )}

        <button
          className="mt-4 inline-block rounded-md bg-abyss px-4 py-2 text-white hover:bg-abyss/90 transition"
          onClick={onStart}
          disabled={!onStart}
        >
          {displayButtonText}
        </button>
      </CardContent>
    </Card>
  );
};
