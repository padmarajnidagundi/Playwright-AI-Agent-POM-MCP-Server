import { FailureCategory, RootCauseAssessment } from './schemas';

export function normalizeFailureCategory(message: string, status: string): FailureCategory {
  const msg = message.toLowerCase();
  if (status === 'timedOut' || /timeout|timed out/.test(msg)) return 'timeout';
  if (/locator|selector|not found|strict mode violation/.test(msg)) return 'locator';
  if (/net::|econnrefused|enotfound|dns|connection/i.test(message)) return 'network';
  if (/expect|assert|received|toequal|tobe/i.test(message)) return 'assertion';
  if (/navigation|tohaveurl|waitforurl|redirect/i.test(message)) return 'navigation';
  if (/browser has been closed|context closed|target page/.test(msg)) return 'environment';
  return 'unknown';
}

function confidenceFor(category: FailureCategory): number {
  switch (category) {
    case 'locator':
      return 0.88;
    case 'timeout':
      return 0.82;
    case 'network':
      return 0.9;
    case 'assertion':
      return 0.75;
    case 'navigation':
      return 0.72;
    case 'environment':
      return 0.8;
    default:
      return 0.5;
  }
}

function probableCauseFor(category: FailureCategory): string {
  switch (category) {
    case 'locator':
      return 'Locator likely stale or too brittle for current DOM.';
    case 'timeout':
      return 'Step exceeded timeout due to slow render, missing wait condition, or blocked dependency.';
    case 'network':
      return 'Target endpoint was unreachable or unstable from test runtime.';
    case 'assertion':
      return 'Observed page state does not match expected assertion.';
    case 'navigation':
      return 'Navigation timing/redirect behavior mismatched expectation.';
    case 'environment':
      return 'Test runtime/browser context was interrupted.';
    default:
      return 'Unable to classify with high confidence.';
  }
}

export function analyzeFailure(message: string, status: string): RootCauseAssessment {
  const category = normalizeFailureCategory(message, status);
  return {
    category,
    probableCause: probableCauseFor(category),
    confidence: confidenceFor(category),
  };
}
