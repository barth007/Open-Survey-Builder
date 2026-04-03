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

export type CapabilityMap = Record<CapabilityKey, CapabilityState>;

export const CAPABILITY_KEYS: CapabilityKey[] = [
  'googleAuth',
  'passwordReset',
  'twoFactor',
  'accountExport',
  'accountDeletion',
  'payment',
  'recaptcha',
];

export const DEFAULT_CAPABILITIES: CapabilityMap = {
  googleAuth: { enabled: false, reason: 'Google sign-in is not configured in this environment yet.' },
  passwordReset: { enabled: false, reason: 'Password reset is not wired to an email delivery flow yet.' },
  twoFactor: { enabled: false, reason: 'Two-factor authentication is not available yet.' },
  accountExport: { enabled: false, reason: 'Account export is not available yet.' },
  accountDeletion: { enabled: false, reason: 'Account deletion is not available yet.' },
  payment: { enabled: false, reason: 'Payment provider integration is not available yet.' },
  recaptcha: { enabled: false, reason: 'reCAPTCHA provider integration is not available yet.' },
};
