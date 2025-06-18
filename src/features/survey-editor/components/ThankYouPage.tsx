
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  thankYouTitle: string;
  thankYouMessage: string;
  thankYouButtonText: string;
  redirectUrl: string;
}

export const ThankYouPage: React.FC<Props> = ({
  thankYouTitle,
  thankYouMessage,
  thankYouButtonText,
  redirectUrl
}) => {
  return (
    <Card className="w-full border border-abyss min-h-fit h-auto">
      <CardContent className="space-y-4 p-6">
        <h1 className="text-2xl font-semibold text-abyss">{thankYouTitle}</h1>

        {thankYouMessage && (
          <p className="text-gray-700 text-base">{thankYouMessage}</p>
        )}

        {redirectUrl ? (
          <a
            href={redirectUrl}
            className="inline-block rounded-md bg-abyss px-4 py-2 text-white hover:bg-abyss/90 transition"
            target="_blank"
            rel="noopener noreferrer"
          >
            {thankYouButtonText || "Go to site"}
          </a>
        ) : thankYouButtonText ? (
          <button
            className="inline-block rounded-md bg-abyss px-4 py-2 text-white opacity-60 cursor-not-allowed"
            disabled
          >
            {thankYouButtonText}
          </button>
        ) : null}
      </CardContent>
    </Card>
  );
};
