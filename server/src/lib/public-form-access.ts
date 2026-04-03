import type { Request } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

interface PublicFormAccessTokenPayload extends jwt.JwtPayload {
  publicCode: string;
  scope: string;
  surveyId: string;
}

type JsonRecord = Record<string, unknown>;

const PUBLIC_FORM_ACCESS_SCOPE = 'public-form-access';
export const PUBLIC_FORM_ACCESS_HEADER = 'x-form-access-token';

const isJsonRecord = (value: unknown): value is JsonRecord => (
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value)
);

const cloneJson = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const getSettingsRecord = (surveyOrSettings: { settings?: unknown } | unknown): JsonRecord | undefined => {
  const rawValue = isJsonRecord(surveyOrSettings)
    && Object.prototype.hasOwnProperty.call(surveyOrSettings, 'settings')
    ? surveyOrSettings.settings
    : surveyOrSettings;

  return isJsonRecord(rawValue) ? cloneJson(rawValue) : undefined;
};

const getAccessRecord = (settings: JsonRecord | undefined): JsonRecord | undefined => {
  const access = settings?.access;
  return isJsonRecord(access) ? access : undefined;
};

const getPasswordProtectionRecord = (settings: JsonRecord | undefined): JsonRecord | undefined => {
  const access = getAccessRecord(settings);
  const passwordProtection = access?.passwordProtection;
  return isJsonRecord(passwordProtection) ? passwordProtection : undefined;
};

export const prepareSurveySettingsForStorage = async (
  existingSettings: unknown,
  incomingSettings: unknown,
) => {
  if (!isJsonRecord(incomingSettings)) {
    return incomingSettings;
  }

  const nextSettings = cloneJson(incomingSettings);
  const passwordProtection = getPasswordProtectionRecord(nextSettings);

  if (!passwordProtection) {
    return nextSettings;
  }

  const existingPasswordProtection = getPasswordProtectionRecord(getSettingsRecord(existingSettings));
  const plainPassword = typeof passwordProtection.password === 'string'
    ? passwordProtection.password.trim()
    : '';
  const existingPasswordHash = typeof existingPasswordProtection?.passwordHash === 'string'
    ? existingPasswordProtection.passwordHash
    : '';

  delete passwordProtection.password;
  delete passwordProtection.hasPassword;

  if (!passwordProtection.enabled) {
    delete passwordProtection.passwordHash;
    return nextSettings;
  }

  if (plainPassword.length > 0) {
    passwordProtection.passwordHash = await bcrypt.hash(plainPassword, 10);
    return nextSettings;
  }

  if (typeof passwordProtection.passwordHash !== 'string' || passwordProtection.passwordHash.trim().length === 0) {
    if (existingPasswordHash) {
      passwordProtection.passwordHash = existingPasswordHash;
    } else {
      delete passwordProtection.passwordHash;
    }
  }

  return nextSettings;
};

export const sanitizeSurveyForClient = <T extends Record<string, unknown>>(
  survey: T,
  options: {
    locked?: boolean;
  } = {},
) => {
  const nextSurvey = {
    ...survey,
  } as T & {
    publicAccessState?: {
      passwordRequired: boolean;
    };
    questions?: unknown[];
    settings?: unknown;
  };

  const settings = getSettingsRecord(survey);

  if (settings) {
    const passwordProtection = getPasswordProtectionRecord(settings);

    if (passwordProtection) {
      const hasPassword = typeof passwordProtection.passwordHash === 'string'
        && passwordProtection.passwordHash.trim().length > 0;
      delete passwordProtection.passwordHash;
      delete passwordProtection.password;
      passwordProtection.hasPassword = hasPassword;
    }

    nextSurvey.settings = settings as unknown;
  }

  if (options.locked) {
    nextSurvey.questions = [];
    nextSurvey.publicAccessState = {
      passwordRequired: true,
    };
  }

  return nextSurvey;
};

export const isSurveyPasswordProtected = (survey: { settings?: unknown }) => {
  const passwordProtection = getPasswordProtectionRecord(getSettingsRecord(survey));

  return Boolean(
    passwordProtection?.enabled
    && typeof passwordProtection.passwordHash === 'string'
    && passwordProtection.passwordHash.trim().length > 0,
  );
};

export const createPublicFormAccessToken = (surveyId: string, publicCode: string) => (
  jwt.sign(
    {
      surveyId,
      publicCode,
      scope: PUBLIC_FORM_ACCESS_SCOPE,
    },
    config.jwtSecret,
    { expiresIn: '2h' },
  )
);

export const hasValidPublicFormAccessToken = (
  token: string | undefined,
  surveyId: string,
  publicCode: string | null | undefined,
) => {
  if (!token || !publicCode) {
    return false;
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as PublicFormAccessTokenPayload;

    return decoded.scope === PUBLIC_FORM_ACCESS_SCOPE
      && decoded.surveyId === surveyId
      && decoded.publicCode === publicCode;
  } catch {
    return false;
  }
};

export const getPublicFormAccessTokenFromRequest = (req: Pick<Request, 'body' | 'header'>) => {
  const headerToken = req.header(PUBLIC_FORM_ACCESS_HEADER);

  if (typeof headerToken === 'string' && headerToken.trim().length > 0) {
    return headerToken;
  }

  const bodyToken = req.body?.publicAccessToken;
  return typeof bodyToken === 'string' && bodyToken.trim().length > 0
    ? bodyToken
    : undefined;
};

export const verifyPublicFormPassword = async (
  survey: { settings?: unknown },
  password: string,
) => {
  const passwordProtection = getPasswordProtectionRecord(getSettingsRecord(survey));
  const passwordHash = typeof passwordProtection?.passwordHash === 'string'
    ? passwordProtection.passwordHash
    : '';

  if (!passwordHash) {
    return false;
  }

  return bcrypt.compare(password, passwordHash);
};
