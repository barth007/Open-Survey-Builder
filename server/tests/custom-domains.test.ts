import { describe, expect, it } from 'vitest';
import './setup.js';

import {
  buildCustomDomainProviderSnapshot,
  normalizeCustomDomainHost,
  normalizeDomainRouteSlug,
  resolveDomainRouteSlugFromPath,
} from '../src/lib/custom-domain-provider.js';

describe('custom domain provider helpers', () => {
  it('normalizes hosts and slugs into stable routing keys', () => {
    expect(normalizeCustomDomainHost('HTTPS://Forms.Example.com/')).toBe('forms.example.com');
    expect(normalizeDomainRouteSlug(' Pricing Audit / Q2 ')).toBe('pricing-audit-q2');
    expect(resolveDomainRouteSlugFromPath('/pricing-audit/q2/')).toBe('pricing-audit-q2');
    expect(resolveDomainRouteSlugFromPath('/')).toBe('');
  });

  it('builds provider instructions for DNS verification and cname routing', () => {
    expect(
      buildCustomDomainProviderSnapshot({
        host: 'forms.example.com',
        verificationToken: 'verify-123',
      }),
    ).toEqual({
      dnsRecordType: 'TXT',
      dnsRecordName: '_survey.forms.example.com',
      dnsRecordValue: 'verify-123',
      cnameTarget: 'cname.survey-builder.local',
    });
  });
});
