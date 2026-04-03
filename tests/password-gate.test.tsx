import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { PasswordGate } from '@/features/survey-response/components/PasswordGate';

describe('password gate', () => {
  it('renders localized default copy for protected forms', () => {
    const html = renderToStaticMarkup(
      <PasswordGate
        surveyTitle="Survey privata"
        locale="it"
        password=""
        onPasswordChange={() => {}}
        onUnlock={() => {}}
      />,
    );

    expect(html).toContain('Survey privata');
    expect(html).toContain('Questo modulo');
    expect(html).toContain('Sblocca modulo');
  });
});
