import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { CustomDomainsPanel } from '@/features/dashboard/components/CustomDomainsPanel';

describe('custom domains panel', () => {
  it('renders branded domains, verification details, and mapped survey routes', () => {
    const html = renderToStaticMarkup(
      <CustomDomainsPanel
        domains={[
          {
            id: 'domain-1',
            host: 'forms.example.com',
            status: 'active',
            verificationToken: 'verify-123',
            verifiedAt: '2026-04-01T10:00:00.000Z',
            sslStatus: 'issued',
            faviconUrl: 'https://cdn.example.com/favicon.ico',
            brandName: 'Acme Research',
            removeBranding: true,
            metadata: {
              trusted: true,
              allowIndexing: false,
              allowScripts: true,
            },
            provider: {
              dnsRecordType: 'TXT',
              dnsRecordName: '_survey.forms.example.com',
              dnsRecordValue: 'verify-123',
              cnameTarget: 'cname.survey-builder.local',
            },
            routes: [
              {
                id: 'route-1',
                surveyId: 'survey-1',
                surveyName: 'Product Research',
                publicCode: 'public-1',
                slug: 'pricing-audit',
                isPrimary: true,
                metadata: {},
              },
            ],
          },
        ]}
        surveyOptions={[
          {
            id: 'survey-1',
            name: 'Product Research',
            publicCode: 'public-1',
            isPublished: true,
          },
        ]}
        onCreateDomain={() => {}}
        onUpdateDomain={() => {}}
        onDeleteDomain={() => {}}
        onCreateRoute={() => {}}
        onUpdateRoute={() => {}}
        onDeleteRoute={() => {}}
      />,
    );

    expect(html).toContain('Custom Domains');
    expect(html).toContain('forms.example.com');
    expect(html).toContain('pricing-audit');
    expect(html).toContain('Product Research');
    expect(html).toContain('Acme Research');
    expect(html).toContain('Verification');
  });
});
