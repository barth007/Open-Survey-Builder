import React from 'react';
import { Palette } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { SurveyAppearance } from '@/types/survey';
import { mergeSurveyAppearance } from '../lib/survey-appearance';

interface SurveyAppearanceCardProps {
  appearance?: SurveyAppearance;
  onAppearanceChange: (appearance: SurveyAppearance) => void;
}

const widthOptions = ['narrow', 'standard', 'wide'] as const;
const cardStyles = ['soft', 'sharp', 'outline'] as const;
const spacingOptions = ['compact', 'comfortable', 'spacious'] as const;
const progressPositions = ['top', 'bottom'] as const;

export const SurveyAppearanceCard: React.FC<SurveyAppearanceCardProps> = ({
  appearance,
  onAppearanceChange,
}) => {
  const mergedAppearance = mergeSurveyAppearance(appearance);

  const updateAppearance = (updates: Partial<SurveyAppearance>) => {
    onAppearanceChange({
      ...mergedAppearance,
      ...updates,
    });
  };

  const updateColors = (updates: Partial<NonNullable<SurveyAppearance['colors']>>) => {
    updateAppearance({
      colors: {
        ...mergedAppearance.colors,
        ...updates,
      },
    });
  };

  const updateFonts = (updates: Partial<NonNullable<SurveyAppearance['fonts']>>) => {
    updateAppearance({
      fonts: {
        ...mergedAppearance.fonts,
        ...updates,
      },
    });
  };

  const updateLayout = (updates: Partial<NonNullable<SurveyAppearance['layout']>>) => {
    updateAppearance({
      layout: {
        ...mergedAppearance.layout,
        ...updates,
      },
    });
  };

  const updateProgress = (updates: Partial<NonNullable<SurveyAppearance['progressBar']>>) => {
    updateAppearance({
      progressBar: {
        ...mergedAppearance.progressBar,
        ...updates,
      },
    });
  };

  return (
    <section className="overflow-hidden rounded-[34px] border border-border/70 bg-background shadow-[0_14px_50px_rgba(15,15,15,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 bg-muted/[0.18] px-6 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-background">
            <Palette className="h-4 w-4 text-foreground/70" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Form Theme
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Colors, typography, layout width, and progress behavior for the public shell.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr] lg:divide-x lg:divide-border/60">
        <div className="space-y-8 px-6 py-8 sm:px-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="survey-bg-color" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Background Color
              </Label>
              <Input
                id="survey-bg-color"
                type="color"
                value={mergedAppearance.colors?.background}
                onChange={(e) => updateColors({ background: e.target.value })}
                className="h-11 rounded-xl border-border/70 bg-muted/[0.08] px-2"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="survey-card-color" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Card Color
              </Label>
              <Input
                id="survey-card-color"
                type="color"
                value={mergedAppearance.colors?.cardBackground}
                onChange={(e) => updateColors({ cardBackground: e.target.value })}
                className="h-11 rounded-xl border-border/70 bg-muted/[0.08] px-2"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="survey-text-color" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Text Color
              </Label>
              <Input
                id="survey-text-color"
                type="color"
                value={mergedAppearance.colors?.text}
                onChange={(e) => updateColors({ text: e.target.value })}
                className="h-11 rounded-xl border-border/70 bg-muted/[0.08] px-2"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="survey-primary-color" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Primary Color
              </Label>
              <Input
                id="survey-primary-color"
                type="color"
                value={mergedAppearance.colors?.primary}
                onChange={(e) => updateColors({ primary: e.target.value, progress: e.target.value })}
                className="h-11 rounded-xl border-border/70 bg-muted/[0.08] px-2"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="survey-heading-font" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Heading Font
              </Label>
              <Input
                id="survey-heading-font"
                value={mergedAppearance.fonts?.heading}
                onChange={(e) => updateFonts({ heading: e.target.value })}
                className="rounded-xl border-border/70 bg-muted/[0.08]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="survey-body-font" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Body Font
              </Label>
              <Input
                id="survey-body-font"
                value={mergedAppearance.fonts?.body}
                onChange={(e) => updateFonts({ body: e.target.value })}
                className="rounded-xl border-border/70 bg-muted/[0.08]"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="survey-width" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Width
              </Label>
              <select
                id="survey-width"
                value={mergedAppearance.layout?.width}
                onChange={(e) => updateLayout({ width: e.target.value as typeof widthOptions[number] })}
                className="flex h-11 w-full rounded-xl border border-border/70 bg-muted/[0.08] px-3 text-sm outline-none focus:border-foreground/25"
              >
                {widthOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="survey-card-style" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Card Style
              </Label>
              <select
                id="survey-card-style"
                value={mergedAppearance.layout?.cardStyle}
                onChange={(e) => updateLayout({ cardStyle: e.target.value as typeof cardStyles[number] })}
                className="flex h-11 w-full rounded-xl border border-border/70 bg-muted/[0.08] px-3 text-sm outline-none focus:border-foreground/25"
              >
                {cardStyles.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="survey-spacing" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Spacing
              </Label>
              <select
                id="survey-spacing"
                value={mergedAppearance.layout?.questionSpacing}
                onChange={(e) => updateLayout({ questionSpacing: e.target.value as typeof spacingOptions[number] })}
                className="flex h-11 w-full rounded-xl border border-border/70 bg-muted/[0.08] px-3 text-sm outline-none focus:border-foreground/25"
              >
                {spacingOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-muted/[0.08] px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Progress Bar</p>
                  <p className="text-xs text-muted-foreground">Show respondents where they are in the form.</p>
                </div>
                <Switch
                  checked={mergedAppearance.progressBar?.enabled}
                  onCheckedChange={(checked) => updateProgress({ enabled: checked })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="survey-progress-position" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Progress Position
              </Label>
              <select
                id="survey-progress-position"
                value={mergedAppearance.progressBar?.position}
                onChange={(e) => updateProgress({ position: e.target.value as typeof progressPositions[number] })}
                className="flex h-11 w-full rounded-xl border border-border/70 bg-muted/[0.08] px-3 text-sm outline-none focus:border-foreground/25"
              >
                {progressPositions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-muted/[0.08] px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Product Branding</p>
                <p className="text-xs text-muted-foreground">Show the platform attribution in the public footer.</p>
              </div>
              <Switch
                checked={mergedAppearance.layout?.showProductBranding}
                onCheckedChange={(checked) => updateLayout({ showProductBranding: checked })}
              />
            </div>
          </div>
        </div>

        <div className="bg-muted/[0.05] px-6 py-8 sm:px-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Preview
          </p>
          <div
            className="mt-4 overflow-hidden rounded-[28px] border p-5 shadow-[0_18px_40px_rgba(15,15,15,0.08)]"
            style={{
              background: mergedAppearance.colors?.cardBackground,
              borderColor: mergedAppearance.colors?.border,
              color: mergedAppearance.colors?.text,
              fontFamily: mergedAppearance.fonts?.body,
            }}
          >
            <div className="space-y-4">
              <div
                className="text-3xl leading-tight"
                style={{ fontFamily: mergedAppearance.fonts?.heading }}
              >
                A more intentional public form
              </div>
              <p className="text-sm leading-6" style={{ opacity: 0.75 }}>
                The shell, buttons, and progress bar will follow these settings in preview and public mode.
              </p>
              <div className="space-y-2">
                <div className="h-2 rounded-full" style={{ background: mergedAppearance.colors?.border }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: '52%',
                      background: mergedAppearance.colors?.progress,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs" style={{ opacity: 0.72 }}>
                  <span>Page 2 of 4</span>
                  <span>52% complete</span>
                </div>
              </div>
              <div
                className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold"
                style={{
                  background: mergedAppearance.colors?.primary,
                  color: mergedAppearance.colors?.primaryForeground,
                  boxShadow: mergedAppearance.buttons?.shadow
                    ? '0 18px 36px rgba(15,15,15,0.14)'
                    : 'none',
                }}
              >
                Continue
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
