export type CapabilityKey =
  | 'googleAuth'
  | 'passwordReset'
  | 'twoFactor'
  | 'accountExport'
  | 'accountDeletion'
  | 'payment'
  | 'recaptcha';

export interface CapabilityState {
  enabled: boolean;
  reason?: string;
}

export interface SystemCapabilities {
  googleAuth: CapabilityState;
  passwordReset: CapabilityState;
  twoFactor: CapabilityState;
  accountExport: CapabilityState;
  accountDeletion: CapabilityState;
  payment: CapabilityState;
  recaptcha: CapabilityState;
}

type Env = NodeJS.ProcessEnv;

const parseBoolean = (value: string | undefined) => (
  value === 'true' || value === '1' || value === 'yes' || value === 'on'
);

const parseBooleanOverride = (value: string | undefined) => (
  value === undefined ? undefined : parseBoolean(value)
);

const readCapabilityState = (
  enabled: boolean,
  reason: string,
  overrideReason?: string,
): CapabilityState => (
  enabled
    ? { enabled: true }
    : { enabled: false, reason: overrideReason?.trim() || reason }
);

export const createSystemCapabilities = (env: Env = process.env): SystemCapabilities => {
  const accountExportEnabled = parseBooleanOverride(env.ACCOUNT_EXPORT_ENABLED) ?? true;
  const accountDeletionEnabled = parseBooleanOverride(env.ACCOUNT_DELETION_ENABLED) ?? true;
  const passwordResetEnabled = parseBooleanOverride(env.PASSWORD_RESET_ENABLED) ?? !!env.SMTP_HOST?.trim();

  return {
    googleAuth: readCapabilityState(
      false,
      'Google OAuth integration is not implemented in this build',
      env.GOOGLE_AUTH_REASON,
    ),
    passwordReset: readCapabilityState(
      passwordResetEnabled,
      'Password reset requires SMTP to be configured',
      env.PASSWORD_RESET_REASON,
    ),
    twoFactor: readCapabilityState(
      false,
      'Two-factor authentication is not implemented in this build',
      env.TWO_FACTOR_REASON,
    ),
    accountExport: readCapabilityState(
      accountExportEnabled,
      'Account export is not enabled',
      env.ACCOUNT_EXPORT_REASON,
    ),
    accountDeletion: readCapabilityState(
      accountDeletionEnabled,
      'Account deletion is not enabled',
      env.ACCOUNT_DELETION_REASON,
    ),
    payment: readCapabilityState(
      false,
      'Payment provider integration is not implemented in this build',
      env.PAYMENT_REASON,
    ),
    recaptcha: readCapabilityState(
      false,
      'reCAPTCHA provider integration is not implemented in this build',
      env.RECAPTCHA_REASON,
    ),
  };
};
