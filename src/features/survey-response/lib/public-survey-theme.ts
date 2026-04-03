import type { CSSProperties } from 'react';

import type { SurveyAppearance } from '@/types/survey';
import { mergeSurveyAppearance } from '@/features/survey-editor/lib/survey-appearance';

export interface PublicSurveyProgressState {
  currentPage: number;
  totalPages: number;
}

export const getPublicSurveyThemeStyles = (appearance?: SurveyAppearance): CSSProperties => {
  const merged = mergeSurveyAppearance(appearance);

  return {
    '--survey-background': merged.colors?.background,
    '--survey-card-background': merged.colors?.cardBackground,
    '--survey-text': merged.colors?.text,
    '--survey-primary': merged.colors?.primary,
    '--survey-primary-foreground': merged.colors?.primaryForeground,
    '--survey-border': merged.colors?.border,
    '--survey-progress': merged.colors?.progress,
    '--survey-font-heading': merged.fonts?.heading,
    '--survey-font-body': merged.fonts?.body,
    backgroundColor: 'var(--survey-background)',
    color: 'var(--survey-text)',
    fontFamily: 'var(--survey-font-body)',
  } as CSSProperties;
};

export const getPublicSurveyWidthClass = (appearance?: SurveyAppearance) => {
  const width = mergeSurveyAppearance(appearance).layout?.width;

  switch (width) {
    case 'narrow':
      return 'max-w-4xl';
    case 'wide':
      return 'max-w-6xl';
    case 'standard':
    default:
      return 'max-w-5xl';
  }
};

export const shouldShowProductBranding = (appearance?: SurveyAppearance) => (
  mergeSurveyAppearance(appearance).layout?.showProductBranding !== false
);

export const getProgressState = (
  appearance: SurveyAppearance | undefined,
  progress?: PublicSurveyProgressState,
) => {
  const progressSettings = mergeSurveyAppearance(appearance).progressBar;

  if (!progressSettings?.enabled || !progress || progress.totalPages <= 1) {
    return null;
  }

  const currentPage = Math.max(1, Math.min(progress.currentPage, progress.totalPages));
  const value = Math.round((currentPage / progress.totalPages) * 100);

  return {
    position: progressSettings.position ?? 'top',
    currentPage,
    totalPages: progress.totalPages,
    value,
    summaryLabel: `Page ${currentPage} of ${progress.totalPages}`,
    valueLabel: `${value}% complete`,
  };
};
