import React from 'react';
import { Palette } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { CustomDomain } from '@/types/custom-domain';

interface DomainBrandingCardProps {
  domain: CustomDomain;
  onChange: (updates: Partial<CustomDomain>) => void;
}

const DEFAULT_METADATA = {
  trusted: false,
  allowScripts: false,
  allowIndexing: true,
};

export const DomainBrandingCard: React.FC<DomainBrandingCardProps> = ({
  domain,
  onChange,
}) => {
  const metadata = {
    ...DEFAULT_METADATA,
    ...domain.metadata,
  };

  const updateMetadata = (updates: Partial<typeof metadata>) => {
    onChange({
      metadata: {
        ...metadata,
        ...updates,
      },
    });
  };

  return (
    <section className="rounded-2xl border border-border/70 bg-background/70">
      <div className="flex items-center gap-3 border-b border-border/60 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-muted/[0.08]">
          <Palette className="h-4 w-4 text-foreground/70" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            White Label
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Branding and controlled code injection for {domain.host}.
          </p>
        </div>
      </div>

      <div className="grid gap-4 px-5 py-5 lg:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`domain-brand-name-${domain.id}`} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Brand Name
          </Label>
          <Input
            id={`domain-brand-name-${domain.id}`}
            value={domain.brandName ?? ''}
            onChange={(e) => onChange({ brandName: e.target.value })}
            placeholder="Acme Research"
            className="rounded-xl border-border/70 bg-muted/[0.08]"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`domain-favicon-${domain.id}`} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Favicon URL
          </Label>
          <Input
            id={`domain-favicon-${domain.id}`}
            value={domain.faviconUrl ?? ''}
            onChange={(e) => onChange({ faviconUrl: e.target.value })}
            placeholder="https://cdn.example.com/favicon.ico"
            className="rounded-xl border-border/70 bg-muted/[0.08]"
          />
        </div>

        <div className="rounded-2xl border border-border/70 bg-muted/[0.08] px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Remove Product Branding</p>
              <p className="text-xs text-muted-foreground">Hide the platform footer and shared brand references on public surfaces.</p>
            </div>
            <Switch
              checked={Boolean(domain.removeBranding)}
              onCheckedChange={(checked) => onChange({ removeBranding: checked })}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-muted/[0.08] px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Trusted Environment</p>
              <p className="text-xs text-muted-foreground">Enable domain-level injection only for controlled deployments.</p>
            </div>
            <Switch
              checked={Boolean(metadata.trusted)}
              onCheckedChange={(checked) => updateMetadata({ trusted: checked })}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-muted/[0.08] px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Allow Scripts</p>
              <p className="text-xs text-muted-foreground">Permit script tags inside injection slots only after explicit trust enablement.</p>
            </div>
            <Switch
              checked={Boolean(metadata.allowScripts)}
              onCheckedChange={(checked) => updateMetadata({ allowScripts: checked })}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-muted/[0.08] px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Allow Indexing</p>
              <p className="text-xs text-muted-foreground">Apply domain-level discoverability defaults to branded routes.</p>
            </div>
            <Switch
              checked={Boolean(metadata.allowIndexing)}
              onCheckedChange={(checked) => updateMetadata({ allowIndexing: checked })}
            />
          </div>
        </div>

        <div className="space-y-1.5 lg:col-span-2">
          <Label htmlFor={`domain-head-code-${domain.id}`} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Head Injection
          </Label>
          <Textarea
            id={`domain-head-code-${domain.id}`}
            value={domain.headCode ?? ''}
            onChange={(e) => onChange({ headCode: e.target.value })}
            placeholder='<meta name="theme-color" content="#fff8ef" />'
            className="min-h-[120px] rounded-2xl border-border/70 bg-muted/[0.05] font-mono text-xs"
          />
        </div>

        <div className="space-y-1.5 lg:col-span-2">
          <Label htmlFor={`domain-body-code-${domain.id}`} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Body Injection
          </Label>
          <Textarea
            id={`domain-body-code-${domain.id}`}
            value={domain.bodyCode ?? ''}
            onChange={(e) => onChange({ bodyCode: e.target.value })}
            placeholder="<script>window.ACME=true;</script>"
            className="min-h-[120px] rounded-2xl border-border/70 bg-muted/[0.05] font-mono text-xs"
          />
        </div>
      </div>
    </section>
  );
};
