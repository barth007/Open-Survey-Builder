import React, { useState } from 'react';
import { Globe2, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { CustomDomainRoute, DomainSurveyOption } from '@/types/custom-domain';

interface DomainRouteEditorProps {
  routes: CustomDomainRoute[];
  surveyOptions: DomainSurveyOption[];
  onCreateRoute: (route: {
    surveyId: string;
    slug: string;
    isPrimary: boolean;
  }) => void;
  onUpdateRoute: (routeId: string, updates: Partial<CustomDomainRoute>) => void;
  onDeleteRoute: (routeId: string) => void;
}

const formatRouteSlug = (slug: string) => (slug ? `/${slug}` : '/');

export const DomainRouteEditor: React.FC<DomainRouteEditorProps> = ({
  routes,
  surveyOptions,
  onCreateRoute,
  onUpdateRoute,
  onDeleteRoute,
}) => {
  const [newSurveyId, setNewSurveyId] = useState(surveyOptions[0]?.id ?? '');
  const [newSlug, setNewSlug] = useState('');
  const [newPrimary, setNewPrimary] = useState(routes.length === 0);

  const handleCreateRoute = () => {
    if (!newSurveyId) {
      return;
    }

    onCreateRoute({
      surveyId: newSurveyId,
      slug: newSlug,
      isPrimary: newPrimary,
    });
    setNewSlug('');
    setNewPrimary(false);
  };

  return (
    <section className="rounded-2xl border border-border/70 bg-background/70">
      <div className="flex items-center gap-3 border-b border-border/60 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-muted/[0.08]">
          <Globe2 className="h-4 w-4 text-foreground/70" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Branded Routes
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Assign published surveys to pretty URLs on this domain.
          </p>
        </div>
      </div>

      <div className="space-y-4 px-5 py-5">
        {routes.length > 0 ? routes.map((route) => (
          <div key={route.id} className="grid gap-4 rounded-2xl border border-border/70 bg-muted/[0.08] px-4 py-4 lg:grid-cols-[1fr_1fr_auto]">
            <div className="space-y-1.5">
              <Label htmlFor={`domain-route-survey-${route.id}`} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Survey
              </Label>
              <select
                id={`domain-route-survey-${route.id}`}
                value={route.surveyId}
                onChange={(e) => onUpdateRoute(route.id, { surveyId: e.target.value })}
                className="flex h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm outline-none"
              >
                {surveyOptions.map((survey) => (
                  <option key={survey.id} value={survey.id}>
                    {survey.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`domain-route-slug-${route.id}`} className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Slug
              </Label>
              <Input
                id={`domain-route-slug-${route.id}`}
                value={route.slug}
                onChange={(e) => onUpdateRoute(route.id, { slug: e.target.value })}
                placeholder="/"
                className="rounded-xl border-border/70 bg-background"
              />
              <p className="text-xs text-muted-foreground">
                Live path: {formatRouteSlug(route.slug)}
              </p>
            </div>

            <div className="flex items-end justify-between gap-4 lg:flex-col lg:items-end">
              <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={route.isPrimary}
                    onCheckedChange={(checked) => onUpdateRoute(route.id, { isPrimary: checked })}
                  />
                  <span className="text-sm font-medium text-foreground">Primary</span>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                className="gap-2 rounded-xl text-destructive hover:text-destructive"
                onClick={() => onDeleteRoute(route.id)}
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            </div>
          </div>
        )) : (
          <div className="rounded-2xl border border-dashed border-border/60 px-4 py-6 text-sm text-muted-foreground">
            No branded routes yet.
          </div>
        )}

        <div className="grid gap-4 rounded-2xl border border-border/70 bg-background px-4 py-4 lg:grid-cols-[1fr_1fr_auto]">
          <div className="space-y-1.5">
            <Label htmlFor="new-domain-route-survey" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Survey
            </Label>
            <select
              id="new-domain-route-survey"
              value={newSurveyId}
              onChange={(e) => setNewSurveyId(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-border/70 bg-muted/[0.08] px-3 text-sm outline-none"
            >
              {surveyOptions.map((survey) => (
                <option key={survey.id} value={survey.id}>
                  {survey.name}
                  {survey.isPublished ? '' : ' (Draft)'}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new-domain-route-slug" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Slug
            </Label>
            <Input
              id="new-domain-route-slug"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              placeholder="/"
              className="rounded-xl border-border/70 bg-muted/[0.08]"
            />
          </div>

          <div className="flex flex-col items-start justify-end gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/[0.08] px-4 py-3">
              <Switch
                checked={newPrimary}
                onCheckedChange={setNewPrimary}
              />
              <span className="text-sm font-medium text-foreground">Primary</span>
            </div>

            <Button
              type="button"
              className="gap-2 rounded-xl"
              onClick={handleCreateRoute}
              disabled={!newSurveyId}
            >
              <Plus className="h-4 w-4" />
              Add Route
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
