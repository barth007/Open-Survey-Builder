import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { DomainBrandingCard } from '@/features/dashboard/components/DomainBrandingCard';

describe('domain branding card', () => {
  it('renders white-label and code-injection controls for a branded domain', () => {
    const html = renderToStaticMarkup(
      <DomainBrandingCard
        domain={{
          id: 'domain-1',
          host: 'forms.example.com',
          status: 'active',
          verificationToken: 'verify-123',
          sslStatus: 'issued',
          faviconUrl: 'https://cdn.example.com/favicon.ico',
          brandName: 'Acme Research',
          removeBranding: true,
          metadata: {
            trusted: true,
            allowScripts: true,
            allowIndexing: false,
          },
          headCode: '<meta name="theme-color" content="#fff8ef" />',
          bodyCode: '<script>window.ACME=true;</script>',
          routes: [],
        }}
        onChange={() => {}}
      />,
    );

    expect(html).toContain('White Label');
    expect(html).toContain('Brand Name');
    expect(html).toContain('forms.example.com');
    expect(html).toContain('Head Injection');
    expect(html).toContain('Body Injection');
  });
});
