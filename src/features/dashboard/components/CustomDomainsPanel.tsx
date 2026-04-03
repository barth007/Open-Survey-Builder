import React, { useState } from 'react';
import { CheckCircle2, Globe, ShieldCheck, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CustomDomain, CustomDomainRoute, DomainSurveyOption } from '@/types/custom-domain';
import { DomainBrandingCard } from './DomainBrandingCard';
import { DomainRouteEditor } from './DomainRouteEditor';

interface CustomDomainsPanelProps {
  domains: CustomDomain[];
  surveyOptions: DomainSurveyOption[];
  onCreateDomain: (host: string) => void;
  onUpdateDomain: (domainId: string, updates: Partial<CustomDomain>) => void;
  onDeleteDomain: (domainId: string) => void;
  onCreateRoute: (domainId: string, route: {
    surveyId: string;
    slug: string;
    isPrimary: boolean;
  }) => void;
  onUpdateRoute: (domainId: string, routeId: string, updates: Partial<CustomDomainRoute>) => void;
  onDeleteRoute: (domainId: string, routeId: string) => void;
}

const formatDate = (value?: string | null) => (
  value ? new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) : 'Pending'
);

export const CustomDomainsPanel: React.FC<CustomDomainsPanelProps> = ({
  domains,
  surveyOptions,
  onCreateDomain,
  onUpdateDomain,
  onDeleteDomain,
  onCreateRoute,
  onUpdateRoute,
  onDeleteRoute,
}) => {
  const [newHost, setNewHost] = useState('');

  const handleCreateDomain = () => {
    if (!newHost.trim()) {
      return;
    }

    onCreateDomain(newHost.trim());
    setNewHost('');
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/10 pb-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight text-foreground">Custom Domains</h2>
          <p className="text-sm text-muted-foreground/70">
            Verification, branded URLs, metadata defaults, and white-label controls.
          </p>
        </div>

        <div className="flex w-full max-w-xl flex-wrap items-end gap-3">
          <div className="min-w-[240px] flex-1 space-y-1.5">
            <Label htmlFor="new-custom-domain" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Hostname
            </Label>
            <Input
              id="new-custom-domain"
              value={newHost}
              onChange={(e) => setNewHost(e.target.value)}
              placeholder="forms.example.com"
              className="rounded-xl border-border/70 bg-background"
            />
          </div>
          <Button type="button" className="rounded-xl" onClick={handleCreateDomain}>
            Add Domain
          </Button>
        </div>
      </div>

      {domains.length > 0 ? domains.map((domain) => (
        <article key={domain.id} className="overflow-hidden rounded-[28px] border border-border/70 bg-card/40 shadow-[0_18px_70px_rgba(15,15,15,0.06)]">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 bg-muted/[0.12] px-6 py-5">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-background">
                <Globe className="h-5 w-5 text-foreground/70" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-black text-foreground">{domain.host}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="rounded-full border border-border/60 bg-background px-3 py-1 font-semibold uppercase tracking-[0.14em]">
                    {domain.status}
                  </span>
                  <span>SSL: {domain.sslStatus}</span>
                  <span>Verified: {formatDate(domain.verifiedAt)}</span>
                  {domain.brandName ? <span>Brand: {domain.brandName}</span> : null}
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              className="gap-2 rounded-xl text-destructive hover:text-destructive"
              onClick={() => onDeleteDomain(domain.id)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>

          <div className="grid gap-6 px-6 py-6 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="space-y-6">
              <section className="rounded-2xl border border-border/70 bg-background/70">
                <div className="flex items-center gap-3 border-b border-border/60 px-5 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-muted/[0.08]">
                    <ShieldCheck className="h-4 w-4 text-foreground/70" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Verification
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Point DNS to the platform and publish a verification record for this hostname.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/70 bg-muted/[0.08] px-4 py-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">TXT Record</p>
                    <p className="mt-2 break-all font-mono text-xs text-foreground">{domain.provider?.dnsRecordName}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-muted/[0.08] px-4 py-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Verification Token</p>
                    <p className="mt-2 break-all font-mono text-xs text-foreground">{domain.provider?.dnsRecordValue || domain.verificationToken}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-muted/[0.08] px-4 py-4 sm:col-span-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">CNAME Target</p>
                    <p className="mt-2 break-all font-mono text-xs text-foreground">{domain.provider?.cnameTarget}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-muted/[0.08] px-4 py-4 sm:col-span-2">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <p className="text-sm font-medium text-foreground">
                        {domain.status === 'active' ? 'Domain is active and routing branded URLs.' : 'Domain is pending verification.'}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <DomainBrandingCard
                domain={domain}
                onChange={(updates) => onUpdateDomain(domain.id, updates)}
              />
            </div>

            <DomainRouteEditor
              routes={domain.routes}
              surveyOptions={surveyOptions}
              onCreateRoute={(route) => onCreateRoute(domain.id, route)}
              onUpdateRoute={(routeId, updates) => onUpdateRoute(domain.id, routeId, updates)}
              onDeleteRoute={(routeId) => onDeleteRoute(domain.id, routeId)}
            />
          </div>
        </article>
      )) : (
        <div className="rounded-[28px] border border-dashed border-border/60 px-6 py-12 text-center">
          <h3 className="text-lg font-bold text-foreground">No custom domains yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Add a hostname to start routing published surveys through branded URLs.
          </p>
        </div>
      )}
    </section>
  );
};
