import { describe, expect, it } from 'vitest';
import './setup.js';

import {
  prepareDomainCodeInjectionInput,
  sanitizeCodeInjection,
} from '../src/lib/code-injection-policy.js';

describe('code injection policy', () => {
  it('drops injection when the environment is not trusted', () => {
    expect(
      prepareDomainCodeInjectionInput(
        {
          headCode: '<meta name="theme-color" content="#fff8ef" />',
          bodyCode: '<script>window.ACME=true;</script>',
        },
        {
          trusted: false,
          allowScripts: false,
        },
      ),
    ).toEqual({
      headCode: null,
      bodyCode: null,
    });
  });

  it('rejects unsupported script injection unless explicitly allowed', () => {
    expect(() => sanitizeCodeInjection('<script>alert(1)</script>', {
      trusted: true,
      allowScripts: false,
    })).toThrow('Script tags require an explicitly trusted environment');
  });

  it('accepts trimmed head/body snippets inside the configured size limit', () => {
    expect(
      prepareDomainCodeInjectionInput(
        {
          headCode: '  <meta name="theme-color" content="#fff8ef" />  ',
          bodyCode: '<script>window.ACME=true;</script>',
        },
        {
          trusted: true,
          allowScripts: true,
        },
      ),
    ).toEqual({
      headCode: '<meta name="theme-color" content="#fff8ef" />',
      bodyCode: '<script>window.ACME=true;</script>',
    });
  });
});
