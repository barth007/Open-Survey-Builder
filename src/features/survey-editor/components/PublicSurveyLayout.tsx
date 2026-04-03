import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SurveyAppearance, SurveyBranding } from '@/types/survey';
import {
  getProgressState,
  getPublicSurveyThemeStyles,
  getPublicSurveyWidthClass,
  shouldShowProductBranding,
  type PublicSurveyProgressState,
} from '@/features/survey-response/lib/public-survey-theme';

interface PublicSurveyLayoutProps {
  children: ReactNode;
  surveyTitle: string;
  appearance?: SurveyAppearance;
  branding?: SurveyBranding;
  progress?: PublicSurveyProgressState;
  isPreviewMode?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
  hideSurveyTitle?: boolean;
  forceHideProductBranding?: boolean;
  contentClassName?: string;
}

export const PublicSurveyLayout: React.FC<PublicSurveyLayoutProps> = ({ 
  children, 
  surveyTitle,
  appearance,
  branding,
  progress,
  isPreviewMode = false,
  showBackButton = false,
  onBack,
  hideSurveyTitle = false,
  forceHideProductBranding = false,
  contentClassName,
}) => {
  const widthClass = getPublicSurveyWidthClass(appearance);
  const themeStyles = getPublicSurveyThemeStyles(appearance);
  const progressState = getProgressState(appearance, progress);
  const showBranding = !forceHideProductBranding && shouldShowProductBranding(appearance);

  const renderProgress = () => {
    if (!progressState) {
      return null;
    }

    return (
      <div
        aria-label="Form progress"
        data-progress-position={progressState.position}
        className={cn(
          'px-6',
          progressState.position === 'top' ? 'pb-2' : 'pt-2',
        )}
      >
        <div className={cn('mx-auto w-full', widthClass)}>
          <div className="mb-2 flex items-center justify-between gap-4 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--survey-text)', opacity: 0.72 }}>
            <span>{progressState.summaryLabel}</span>
            <span>{progressState.valueLabel}</span>
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressState.value}
            aria-valuetext={progressState.valueLabel}
            className="h-2 overflow-hidden rounded-full"
            style={{ background: 'var(--survey-border)' }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progressState.value}%`,
                background: 'var(--survey-progress)',
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="public-survey-shell" className="flex min-h-screen flex-col" style={themeStyles}>
      <header className="px-6 py-10 sm:py-12">
        <div className={cn('mx-auto flex w-full items-center justify-between gap-6', widthClass)}>
          <div className="flex min-w-0 items-center gap-4">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="h-8 -ml-2 px-2 font-bold text-[10px] uppercase tracking-widest"
                style={{ color: 'var(--survey-text)', opacity: 0.6 }}
              >
                <ArrowLeft size={14} className="mr-2" />
                Back
              </Button>
            )}

            {branding?.logo?.url ? (
              <img
                src={branding.logo.url}
                alt={branding.logo.alt || 'Survey logo'}
                className="max-h-10 w-auto rounded-md object-contain"
                style={{ width: branding.logo.width ? `${branding.logo.width}px` : undefined }}
              />
            ) : null}

            {!hideSurveyTitle ? (
              <div className="min-w-0">
                <h1
                  className="max-w-[240px] truncate text-[11px] font-bold uppercase tracking-[0.2em] md:max-w-md"
                  style={{ color: 'var(--survey-text)', opacity: 0.56 }}
                >
                  {surveyTitle}
                </h1>
              </div>
            ) : null}
          </div>
          
          {isPreviewMode && (
            <div className="rounded-full border px-3 py-1" style={{ borderColor: 'var(--survey-border)', background: 'var(--survey-card-background)' }}>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--survey-primary)' }}>Preview</span>
            </div>
          )}
        </div>
      </header>

      {progressState?.position === 'top' ? renderProgress() : null}

      <main className={cn('mx-auto flex w-full flex-1 px-6 pb-20 sm:px-8', widthClass)}>
        <div
          className="w-full overflow-hidden rounded-[32px] border shadow-[0_24px_90px_rgba(15,15,15,0.08)]"
          style={{
            background: 'var(--survey-card-background)',
            borderColor: 'var(--survey-border)',
          }}
        >
          {branding?.coverImage?.url ? (
            <img
              src={branding.coverImage.url}
              alt={branding.coverImage.alt || 'Survey cover image'}
              className={cn(
                'w-full object-cover',
                branding.coverImage.height === 'sm' ? 'h-32' : branding.coverImage.height === 'lg' ? 'h-56' : 'h-44',
              )}
            />
          ) : null}

          <div className={cn('px-6 py-8 sm:px-10 sm:py-10', contentClassName)}>
            {children}
          </div>
        </div>
      </main>

      {progressState?.position === 'bottom' ? renderProgress() : null}

      {showBranding ? (
        <footer className="py-12 text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--survey-text)', opacity: 0.42 }}>
            Built with Survey-Builder
          </span>
        </footer>
      ) : null}
    </div>
  );
};
