const SECRET_PATTERNS: RegExp[] = [
  /\b(?:ghp|gho|github_pat)_[A-Za-z0-9_]{20,}\b/g,
  /\bAKIA[0-9A-Z]{16}\b/g,
  /\b(?:sk|pk)_(?:live|test)_[A-Za-z0-9]{16,}\b/g,
  /\b(?:api[_-]?key|token|secret|password)\b\s*[:=]\s*['\"]?[^\s'\"]+/gi,
  /Bearer\s+[A-Za-z0-9._\-+/=]{16,}/gi,
];

export function redactSecrets(value: string): string {
  let redacted = value;
  for (const pattern of SECRET_PATTERNS) {
    redacted = redacted.replace(pattern, '[REDACTED]');
  }
  return redacted;
}

export function sanitizeEnv(input: NodeJS.ProcessEnv): Record<string, string> {
  const allowedPrefixes = ['E2E_', 'PLAYWRIGHT_', 'CI', 'NODE_ENV'];
  const out: Record<string, string> = {};

  for (const [k, v] of Object.entries(input)) {
    if (!v) continue;
    if (allowedPrefixes.some(prefix => k === prefix || k.startsWith(prefix))) {
      out[k] = v;
    }
  }

  return out;
}
