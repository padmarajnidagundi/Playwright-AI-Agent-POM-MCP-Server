export const AI_REPORT_SCHEMA_VERSION = '2.0.0';
export const HEALING_RECORD_SCHEMA_VERSION = '1.0.0';
export const ANALYTICS_EVENT_SCHEMA_VERSION = '1.0.0';

export type FailureCategory =
  | 'locator'
  | 'timeout'
  | 'network'
  | 'assertion'
  | 'navigation'
  | 'environment'
  | 'unknown';

export interface ArtifactLinks {
  trace?: string;
  screenshot?: string;
  video?: string;
  log?: string;
}

export interface RootCauseAssessment {
  probableCause: string;
  confidence: number;
  category: FailureCategory;
}

export interface TraceSummary {
  available: boolean;
  summary: string;
  actionableSteps: string[];
  evidence: string[];
}

export interface TestGenerationRequest {
  prompt: string;
  targetPageObject: string;
  targetSpec: string;
  constraints?: string[];
}

export interface TestGenerationPreview {
  schemaVersion: string;
  request: TestGenerationRequest;
  pageObjectUpdates: Array<{
    file: string;
    additions: string[];
  }>;
  specScaffold: {
    file: string;
    describeTitle: string;
    testCases: string[];
  };
}

export interface HealingProposal {
  id: string;
  file: string;
  locatorName: string;
  currentSelector: string;
  proposedSelector: string;
  confidence: number;
  risk: 'low' | 'medium' | 'high';
  blastRadius: {
    estimatedSpecCount: number;
    impactedSpecs: string[];
  };
  rationale: string;
}

export interface HealingRecord {
  schemaVersion: string;
  timestamp: string;
  proposal: HealingProposal;
  approval: {
    required: boolean;
    approvedBy?: string;
    approvedAt?: string;
  };
  validation: {
    runCommand: string;
    passed: boolean;
    output: string;
  };
}

export interface AnalyticsEvent {
  schemaVersion: string;
  timestamp: string;
  eventType:
    | 'test.failure'
    | 'test.passed'
    | 'healing.proposed'
    | 'healing.approved'
    | 'healing.rejected'
    | 'healing.validated';
  metadata: Record<string, unknown>;
}
