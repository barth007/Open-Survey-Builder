import React from 'react';
import { Copy, LayoutTemplate } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { buildEmbedSnippet } from '@/lib/embed-snippet';
import type { SurveyDelivery } from '@/types/survey';
import { normalizePopupDelivery } from '@/features/survey-response/lib/popup-runtime';

interface DeliveryModesCardProps {
  publicCode?: string;
  delivery?: SurveyDelivery;
  onDeliveryChange: (delivery: SurveyDelivery) => void;
}

const popupOpenModes = [
  { value: 'button_click', label: 'Button Click' },
  { value: 'page_load', label: 'Page Load' },
  { value: 'elapsed_time', label: 'Elapsed Time' },
  { value: 'scroll', label: 'Scroll Depth' },
  { value: 'exit_intent', label: 'Exit Intent' },
] as const;

const popupPositions = [
  { value: 'center', label: 'Centered modal' },
  { value: 'bottom_right', label: 'Bottom right drawer' },
] as const;

export const DeliveryModesCard: React.FC<DeliveryModesCardProps> = ({
  publicCode,
  delivery,
  onDeliveryChange,
}) => {
  const popup = normalizePopupDelivery(delivery);
  const snippet = publicCode
    ? buildEmbedSnippet({
      publicCode,
      delivery: {
        popup,
      },
    })
    : '';

  const updatePopup = (updates: Partial<typeof popup>) => {
    onDeliveryChange({
      ...delivery,
      popup: {
        ...popup,
        ...updates,
      },
    });
  };

  const handleCopySnippet = async () => {
    if (!snippet || typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
      return;
    }

    await navigator.clipboard.writeText(snippet);
    toast('Embed snippet copied', {
      description: 'Paste it into the destination site to launch the popup form.',
    });
  };

  return (
    <section className="overflow-hidden rounded-[34px] border border-border/70 bg-background shadow-[0_14px_50px_rgba(15,15,15,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 bg-muted/[0.18] px-6 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-background">
            <LayoutTemplate className="h-4 w-4 text-foreground/70" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Delivery Modes
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure popup launch behavior and copy a deterministic embed snippet for external sites.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr] lg:divide-x lg:divide-border/60">
        <div className="space-y-6 px-6 py-8 sm:px-8">
          <div className="rounded-2xl border border-border/70 bg-muted/[0.08] px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Popup Form</p>
                <p className="text-xs text-muted-foreground">Launch the live form as an overlay on external pages.</p>
              </div>
              <Switch
                checked={Boolean(popup.enabled)}
                onCheckedChange={(checked) => updatePopup({ enabled: checked })}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="popup-open-mode" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Trigger
              </Label>
              <select
                id="popup-open-mode"
                value={popup.openMode}
                onChange={(e) => updatePopup({ openMode: e.target.value as typeof popup.openMode })}
                className="flex h-11 w-full rounded-xl border border-border/70 bg-muted/[0.08] px-3 text-sm outline-none focus:border-foreground/25"
              >
                {popupOpenModes.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="popup-position" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Position
              </Label>
              <select
                id="popup-position"
                value={popup.position}
                onChange={(e) => updatePopup({ position: e.target.value as typeof popup.position })}
                className="flex h-11 w-full rounded-xl border border-border/70 bg-muted/[0.08] px-3 text-sm outline-none focus:border-foreground/25"
              >
                {popupPositions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="popup-delay-seconds" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Delay Seconds
              </Label>
              <Input
                id="popup-delay-seconds"
                type="number"
                min={0}
                value={popup.delaySeconds}
                onChange={(e) => updatePopup({ delaySeconds: e.target.value ? Number(e.target.value) : 0 })}
                className="rounded-xl border-border/70 bg-muted/[0.08]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="popup-scroll-percent" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Scroll Percent
              </Label>
              <Input
                id="popup-scroll-percent"
                type="number"
                min={0}
                max={100}
                value={popup.scrollPercent}
                onChange={(e) => updatePopup({ scrollPercent: e.target.value ? Number(e.target.value) : 0 })}
                className="rounded-xl border-border/70 bg-muted/[0.08]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="popup-width" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Popup Width
              </Label>
              <Input
                id="popup-width"
                type="number"
                min={320}
                value={popup.widthPx}
                onChange={(e) => updatePopup({ widthPx: e.target.value ? Number(e.target.value) : 480 })}
                className="rounded-xl border-border/70 bg-muted/[0.08]"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-muted/[0.08] px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Hide Title</p>
                  <p className="text-xs text-muted-foreground">Remove the shell title when the form is embedded in a popup.</p>
                </div>
                <Switch
                  checked={Boolean(popup.hideTitle)}
                  onCheckedChange={(checked) => updatePopup({ hideTitle: checked })}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/[0.08] px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Left Align Content</p>
                  <p className="text-xs text-muted-foreground">Use a tighter content alignment for embedded flows.</p>
                </div>
                <Switch
                  checked={Boolean(popup.alignContentLeft)}
                  onCheckedChange={(checked) => updatePopup({ alignContentLeft: checked })}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/[0.08] px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Dark Overlay</p>
                  <p className="text-xs text-muted-foreground">Dim the host page behind the modal popup.</p>
                </div>
                <Switch
                  checked={Boolean(popup.darkOverlay)}
                  onCheckedChange={(checked) => updatePopup({ darkOverlay: checked })}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/[0.08] px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Show Once</p>
                  <p className="text-xs text-muted-foreground">Remember the popup locally after the first launch.</p>
                </div>
                <Switch
                  checked={Boolean(popup.showOnce)}
                  onCheckedChange={(checked) => updatePopup({ showOnce: checked })}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/[0.08] px-4 py-3 sm:col-span-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Preserve Query Parameters</p>
                  <p className="text-xs text-muted-foreground">Carry hidden field and attribution params from the host page into the popup iframe.</p>
                </div>
                <Switch
                  checked={Boolean(popup.preserveQueryParams)}
                  onCheckedChange={(checked) => updatePopup({ preserveQueryParams: checked })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-6 py-8 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Embedded Snippet</p>
              <p className="text-xs text-muted-foreground">
                {publicCode ? 'Copy the latest popup launcher for this published form.' : 'Publish the form to generate a stable embed snippet.'}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="gap-2 rounded-xl"
              onClick={() => void handleCopySnippet()}
              disabled={!publicCode}
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>
          </div>

          <Textarea
            readOnly
            value={snippet}
            placeholder="Publish this form to generate the popup embed snippet."
            className="min-h-[420px] rounded-2xl border-border/70 bg-muted/[0.05] font-mono text-xs"
          />
        </div>
      </div>
    </section>
  );
};
