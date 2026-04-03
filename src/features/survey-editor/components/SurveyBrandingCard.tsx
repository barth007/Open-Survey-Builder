import React from 'react';
import { ImagePlus } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SurveyBranding, SurveyBrandingAsset } from '@/types/survey';
import { mergeSurveyBranding } from '../lib/survey-appearance';

interface SurveyBrandingCardProps {
  branding?: SurveyBranding;
  onBrandingChange: (branding: SurveyBranding) => void;
}

export const SurveyBrandingCard: React.FC<SurveyBrandingCardProps> = ({
  branding,
  onBrandingChange,
}) => {
  const mergedBranding = mergeSurveyBranding(branding);

  const updateAsset = (
    field: keyof SurveyBranding,
    updates: Partial<SurveyBrandingAsset>,
  ) => {
    onBrandingChange({
      ...mergedBranding,
      [field]: {
        ...(mergedBranding[field] ?? { url: '' }),
        ...updates,
      },
    });
  };

  return (
    <section className="overflow-hidden rounded-[34px] border border-border/70 bg-background shadow-[0_14px_50px_rgba(15,15,15,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 bg-muted/[0.18] px-6 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-background">
            <ImagePlus className="h-4 w-4 text-foreground/70" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Branding
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a logo and a cover image to shape the public shell.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr] lg:divide-x lg:divide-border/60">
        <div className="space-y-8 px-6 py-8 sm:px-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="survey-logo-url" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Logo URL
              </Label>
              <Input
                id="survey-logo-url"
                value={mergedBranding.logo?.url ?? ''}
                onChange={(e) => updateAsset('logo', { url: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="rounded-xl border-border/70 bg-muted/[0.08]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="survey-logo-alt" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Logo Alt
              </Label>
              <Input
                id="survey-logo-alt"
                value={mergedBranding.logo?.alt ?? ''}
                onChange={(e) => updateAsset('logo', { alt: e.target.value })}
                placeholder="Brand logo"
                className="rounded-xl border-border/70 bg-muted/[0.08]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="survey-logo-width" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Logo Width
              </Label>
              <Input
                id="survey-logo-width"
                type="number"
                value={mergedBranding.logo?.width ?? 140}
                onChange={(e) => updateAsset('logo', { width: Number(e.target.value) || 140 })}
                className="rounded-xl border-border/70 bg-muted/[0.08]"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="survey-cover-url" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Cover Image URL
              </Label>
              <Input
                id="survey-cover-url"
                value={mergedBranding.coverImage?.url ?? ''}
                onChange={(e) => updateAsset('coverImage', { url: e.target.value })}
                placeholder="https://example.com/cover.png"
                className="rounded-xl border-border/70 bg-muted/[0.08]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="survey-cover-alt" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Cover Alt
              </Label>
              <Input
                id="survey-cover-alt"
                value={mergedBranding.coverImage?.alt ?? ''}
                onChange={(e) => updateAsset('coverImage', { alt: e.target.value })}
                placeholder="Cover image"
                className="rounded-xl border-border/70 bg-muted/[0.08]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="survey-cover-height" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Cover Height
              </Label>
              <select
                id="survey-cover-height"
                value={mergedBranding.coverImage?.height ?? 'md'}
                onChange={(e) => updateAsset('coverImage', { height: e.target.value as 'sm' | 'md' | 'lg' })}
                className="flex h-11 w-full rounded-xl border border-border/70 bg-muted/[0.08] px-3 text-sm outline-none focus:border-foreground/25"
              >
                <option value="sm">sm</option>
                <option value="md">md</option>
                <option value="lg">lg</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-muted/[0.05] px-6 py-8 sm:px-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Preview
          </p>

          <div className="mt-4 overflow-hidden rounded-[28px] border border-border/70 bg-background shadow-[0_18px_40px_rgba(15,15,15,0.08)]">
            {mergedBranding.coverImage?.url ? (
              <img
                src={mergedBranding.coverImage.url}
                alt={mergedBranding.coverImage.alt || 'Cover image'}
                className="h-36 w-full object-cover"
              />
            ) : (
              <div className="flex h-36 items-center justify-center bg-muted/[0.18] text-sm text-muted-foreground">
                Cover image preview
              </div>
            )}

            <div className="flex items-center gap-4 px-5 py-5">
              {mergedBranding.logo?.url ? (
                <img
                  src={mergedBranding.logo.url}
                  alt={mergedBranding.logo.alt || 'Logo'}
                  className="max-h-12 w-auto rounded-md object-contain"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-dashed border-border/70 text-xs text-muted-foreground">
                  Logo
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-foreground">Public shell branding</p>
                <p className="text-xs text-muted-foreground">Logo in the header, cover image above the form canvas.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
