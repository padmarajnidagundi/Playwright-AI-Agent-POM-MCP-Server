export interface FeatureFlags {
  analysisEnabled: boolean;
  healingEnabled: boolean;
  dashboardEnabled: boolean;
  testSelectionEnabled: boolean;
}

function enabled(value: string | undefined, fallback = true): boolean {
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

export function readFeatureFlags(env: NodeJS.ProcessEnv): FeatureFlags {
  return {
    analysisEnabled: enabled(env.FEATURE_ANALYSIS_ENABLED, true),
    healingEnabled: enabled(env.FEATURE_HEALING_ENABLED, true),
    dashboardEnabled: enabled(env.FEATURE_DASHBOARD_ENABLED, true),
    testSelectionEnabled: enabled(env.FEATURE_TEST_SELECTION_ENABLED, true),
  };
}
