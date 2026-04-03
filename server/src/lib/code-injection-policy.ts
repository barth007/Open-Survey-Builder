const MAX_INJECTION_LENGTH = 12_000;
const TOP_LEVEL_TAG_PATTERN = /<(html|head|body)\b/i;
const SCRIPT_TAG_PATTERN = /<script\b/i;

export interface CodeInjectionPolicyOptions {
  trusted: boolean;
  allowScripts: boolean;
}

export const sanitizeCodeInjection = (
  snippet: unknown,
  options: CodeInjectionPolicyOptions,
) => {
  if (typeof snippet !== 'string' || snippet.trim().length === 0) {
    return null;
  }

  if (!options.trusted) {
    return null;
  }

  const normalized = snippet.trim();

  if (normalized.length > MAX_INJECTION_LENGTH) {
    throw new Error('Injection code exceeds the maximum supported size');
  }

  if (TOP_LEVEL_TAG_PATTERN.test(normalized)) {
    throw new Error('Top-level html/head/body tags are not supported in injection slots');
  }

  if (!options.allowScripts && SCRIPT_TAG_PATTERN.test(normalized)) {
    throw new Error('Script tags require an explicitly trusted environment');
  }

  return normalized;
};

export const prepareDomainCodeInjectionInput = (
  input: {
    headCode?: unknown;
    bodyCode?: unknown;
  },
  options: CodeInjectionPolicyOptions,
) => ({
  headCode: sanitizeCodeInjection(input.headCode, options),
  bodyCode: sanitizeCodeInjection(input.bodyCode, options),
});
