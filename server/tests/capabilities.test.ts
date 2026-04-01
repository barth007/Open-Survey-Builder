import request from 'supertest';
import { describe, expect, it } from 'vitest';
import './setup.js';
import { app } from '../src/app.js';
import { createSystemCapabilities } from '../src/capabilities.js';

describe('system capabilities', () => {
  it('returns a stable capability contract', async () => {
    const res = await request(app).get('/api/system/capabilities');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      googleAuth: { enabled: false, reason: expect.any(String) },
      passwordReset: { enabled: false, reason: expect.any(String) },
      twoFactor: { enabled: false, reason: expect.any(String) },
      accountExport: { enabled: true },
      accountDeletion: { enabled: true },
      payment: { enabled: false, reason: expect.any(String) },
      recaptcha: { enabled: false, reason: expect.any(String) },
    });
  });

  it('only enables features that are actually implemented server-side', () => {
    const capabilities = createSystemCapabilities({
      GOOGLE_AUTH_ENABLED: 'true',
      GOOGLE_CLIENT_ID: 'client-id',
      GOOGLE_CLIENT_SECRET: 'client-secret',
      PASSWORD_RESET_ENABLED: 'true',
      TWO_FACTOR_REASON: 'TOTP is not deployed',
      ACCOUNT_EXPORT_ENABLED: 'false',
      ACCOUNT_DELETION_ENABLED: 'false',
      PAYMENT_ENABLED: 'yes',
      RECAPTCHA_ENABLED: '1',
    });

    expect(capabilities.googleAuth.enabled).toBe(false);
    expect(capabilities.passwordReset.enabled).toBe(false);
    expect(capabilities.payment.enabled).toBe(false);
    expect(capabilities.recaptcha.enabled).toBe(false);
    expect(capabilities.twoFactor).toEqual({
      enabled: false,
      reason: 'TOTP is not deployed',
    });
    expect(capabilities.accountDeletion.enabled).toBe(false);
    expect(capabilities.accountExport.enabled).toBe(false);
    expect(capabilities.accountDeletion.reason).toContain('Account deletion');
  });
});
