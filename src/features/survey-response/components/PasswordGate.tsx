import React from 'react';
import { LockKeyhole } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PasswordGateProps {
  surveyTitle: string;
  locale?: string;
  password: string;
  errorMessage?: string;
  isUnlocking?: boolean;
  onPasswordChange: (password: string) => void;
  onUnlock: () => void;
}

const getLocalizedCopy = (locale?: string) => {
  const normalizedLocale = locale?.toLowerCase().trim();

  if (normalizedLocale?.startsWith('it')) {
    return {
      eyebrow: 'Modulo protetto',
      titleSuffix: 'richiede una password',
      description: 'Questo modulo è protetto. Inserisci la password per continuare.',
      placeholder: 'Inserisci la password',
      action: 'Sblocca modulo',
    };
  }

  return {
    eyebrow: 'Protected form',
    titleSuffix: 'requires a password',
    description: 'This form is protected. Enter the password to continue.',
    placeholder: 'Enter password',
    action: 'Unlock form',
  };
};

export const PasswordGate: React.FC<PasswordGateProps> = ({
  surveyTitle,
  locale,
  password,
  errorMessage,
  isUnlocking = false,
  onPasswordChange,
  onUnlock,
}) => {
  const copy = getLocalizedCopy(locale);

  return (
    <div className="mx-auto flex min-h-[64vh] w-full max-w-[560px] flex-col justify-center py-14 sm:py-20">
      <div
        className="rounded-[32px] border px-6 py-8 shadow-[0_18px_55px_rgba(15,15,15,0.08)] sm:px-8"
        style={{
          borderColor: 'var(--survey-border)',
          background: 'var(--survey-card-background)',
        }}
      >
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border" style={{ borderColor: 'var(--survey-border)', background: 'rgba(255,255,255,0.5)' }}>
          <LockKeyhole className="h-5 w-5" style={{ color: 'var(--survey-text)' }} />
        </div>

        <p className="text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: 'var(--survey-text)', opacity: 0.64 }}>
          {copy.eyebrow}
        </p>
        <h1
          className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
          style={{ color: 'var(--survey-text)', fontFamily: 'var(--survey-font-heading)' }}
        >
          {surveyTitle} {copy.titleSuffix}
        </h1>
        <p className="mt-3 text-base leading-7" style={{ color: 'var(--survey-text)', opacity: 0.76 }}>
          {copy.description}
        </p>

        <div className="mt-8 space-y-3">
          <Input
            type="password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            placeholder={copy.placeholder}
            className="h-12 rounded-2xl border-border/70 bg-muted/10 px-4 text-base"
          />

          {errorMessage && (
            <p className="text-sm text-rose-600">{errorMessage}</p>
          )}

          <Button
            type="button"
            onClick={onUnlock}
            disabled={isUnlocking || password.trim().length === 0}
            className="h-12 w-full rounded-2xl text-sm font-semibold shadow-[0_18px_36px_rgba(17,17,17,0.18)] hover:opacity-95"
            style={{
              background: 'var(--survey-primary)',
              color: 'var(--survey-primary-foreground)',
            }}
          >
            {isUnlocking ? `${copy.action}...` : copy.action}
          </Button>
        </div>
      </div>
    </div>
  );
};
