import React from 'react';
import { Link2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { SurveySeo, SurveyShareMeta } from '@/types/survey';

interface ShareMetadataCardProps {
  shareMeta?: SurveyShareMeta;
  seo?: SurveySeo;
  onShareMetaChange: (shareMeta: SurveyShareMeta) => void;
  onSeoChange: (seo: SurveySeo) => void;
}

export const ShareMetadataCard: React.FC<ShareMetadataCardProps> = ({
  shareMeta,
  seo,
  onShareMetaChange,
  onSeoChange,
}) => {
  const mergedShareMeta: SurveyShareMeta = {
    ogTitle: '',
    ogDescription: '',
    ogImageUrl: '',
    ...shareMeta,
  };

  const mergedSeo: SurveySeo = {
    allowIndexing: true,
    ...seo,
  };

  const updateShareMeta = (updates: Partial<SurveyShareMeta>) => {
    onShareMetaChange({
      ...mergedShareMeta,
      ...updates,
    });
  };

  return (
    <section className="overflow-hidden rounded-[34px] border border-border/70 bg-background shadow-[0_14px_50px_rgba(15,15,15,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 bg-muted/[0.18] px-6 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-background">
            <Link2 className="h-4 w-4 text-foreground/70" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Share Metadata
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure title, description, preview image, and indexing preferences.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 px-6 py-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className="space-y-1.5">
            <Label htmlFor="survey-og-title" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              OG Title
            </Label>
            <Input
              id="survey-og-title"
              value={mergedShareMeta.ogTitle || ''}
              onChange={(e) => updateShareMeta({ ogTitle: e.target.value })}
              placeholder="Hiring survey"
              className="rounded-xl border-border/70 bg-muted/[0.08]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="survey-og-description" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              OG Description
            </Label>
            <Textarea
              id="survey-og-description"
              value={mergedShareMeta.ogDescription || ''}
              onChange={(e) => updateShareMeta({ ogDescription: e.target.value })}
              placeholder="Collect structured feedback from candidates."
              className="min-h-[112px] rounded-xl border-border/70 bg-muted/[0.08]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="survey-og-image" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              OG Image URL
            </Label>
            <Input
              id="survey-og-image"
              value={mergedShareMeta.ogImageUrl || ''}
              onChange={(e) => updateShareMeta({ ogImageUrl: e.target.value })}
              placeholder="https://example.com/og.png"
              className="rounded-xl border-border/70 bg-muted/[0.08]"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border/70 bg-muted/[0.08] px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Search Indexing</p>
                <p className="text-xs text-muted-foreground">Allow search engines to index the public form route.</p>
              </div>
              <Switch
                checked={Boolean(mergedSeo.allowIndexing)}
                onCheckedChange={(checked) => onSeoChange({ allowIndexing: checked })}
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-[26px] border border-border/70 bg-muted/[0.04]">
            <div className="border-b border-border/60 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Preview
            </div>
            <div className="space-y-2 px-4 py-4">
              <p className="text-sm font-semibold text-foreground">
                {mergedShareMeta.ogTitle || 'Untitled public form'}
              </p>
              <p className="text-xs leading-5 text-muted-foreground">
                {mergedShareMeta.ogDescription || 'Description preview for links, search, and embeds.'}
              </p>
              <p className="truncate text-xs text-primary">
                {mergedShareMeta.ogImageUrl || 'https://example.com/og-preview.png'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
