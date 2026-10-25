import * as fs from 'fs';
import * as path from 'path';
import { spawnSync } from 'child_process';
import {
  HEALING_RECORD_SCHEMA_VERSION,
  HealingProposal,
  HealingRecord,
} from './schemas';
import { redactSecrets } from './secret-redaction';

const SELECTOR_LINE_RE = /locator\((['\"`])(.+?)\1\)/;

export function inferRisk(confidence: number, impactedSpecs: string[]): 'low' | 'medium' | 'high' {
  if (confidence >= 0.85 && impactedSpecs.length <= 2) return 'low';
  if (confidence >= 0.65 && impactedSpecs.length <= 5) return 'medium';
  return 'high';
}

export function buildLocatorRepairProposal(args: {
  file: string;
  locatorName: string;
  currentSelector: string;
  candidateSelectors: string[];
  impactedSpecs: string[];
}): HealingProposal {
  const proposedSelector = args.candidateSelectors[0] ?? args.currentSelector;
  const confidence = proposedSelector === args.currentSelector ? 0.35 : 0.9;

  return {
    id: `heal-${Date.now()}`,
    file: args.file,
    locatorName: args.locatorName,
    currentSelector: args.currentSelector,
    proposedSelector,
    confidence,
    risk: inferRisk(confidence, args.impactedSpecs),
    blastRadius: {
      estimatedSpecCount: args.impactedSpecs.length,
      impactedSpecs: args.impactedSpecs,
    },
    rationale:
      proposedSelector === args.currentSelector
        ? 'No stronger replacement identified from provided candidates.'
        : 'Promoted the highest-priority resilient selector candidate.',
  };
}

export function assertPomGuardrails(filePath: string): void {
  const normalized = filePath.replace(/\\/g, '/');
  if (!normalized.includes('/tests/pages/') && !normalized.startsWith('tests/pages/')) {
    throw new Error('Guardrail violation: locator edits are only allowed in tests/pages/* files.');
  }
}

export function applyLocatorRepairWithApproval(args: {
  repoRoot: string;
  proposal: HealingProposal;
  approvedBy?: string;
}): { applied: boolean; reason: string } {
  assertPomGuardrails(args.proposal.file);

  const needsApproval = args.proposal.risk !== 'low';
  if (needsApproval && !args.approvedBy) {
    return { applied: false, reason: 'Approval required for medium/high risk proposal.' };
  }

  const absolute = path.resolve(args.repoRoot, args.proposal.file);
  if (!fs.existsSync(absolute)) {
    return { applied: false, reason: 'Target page-object file not found.' };
  }

  const source = fs.readFileSync(absolute, 'utf8');
  const updated = source.replace(SELECTOR_LINE_RE, (_full, quote, selector) => {
    if (selector !== args.proposal.currentSelector) return _full;
    return `locator(${quote}${args.proposal.proposedSelector}${quote})`;
  });

  if (updated === source) {
    return { applied: false, reason: 'No matching locator usage found for replacement.' };
  }

  fs.writeFileSync(absolute, updated, 'utf8');
  return { applied: true, reason: 'Locator replacement applied to page object.' };
}

export function runValidationRerun(args: {
  cwd: string;
  impactedSpecs: string[];
  project?: string;
}): { passed: boolean; command: string; output: string } {
  const specs = args.impactedSpecs.length > 0 ? args.impactedSpecs : ['tests/wesendcv.spec.ts'];
  const projectArgs = args.project ? ['--project', args.project] : [];
  const cmdArgs = ['playwright', 'test', ...specs, ...projectArgs, '--reporter=list'];
  const command = `npx ${cmdArgs.join(' ')}`;

  const result = spawnSync('npx', cmdArgs, {
    cwd: args.cwd,
    encoding: 'utf8',
    timeout: 180_000,
  });

  const output = redactSecrets((result.stdout ?? '') + '\n' + (result.stderr ?? '')).trim();
  return {
    passed: result.status === 0,
    command,
    output,
  };
}

export function persistHealingRecord(args: {
  outputDir: string;
  proposal: HealingProposal;
  approval: { required: boolean; approvedBy?: string; approvedAt?: string };
  validation: { runCommand: string; passed: boolean; output: string };
}): HealingRecord {
  const record: HealingRecord = {
    schemaVersion: HEALING_RECORD_SCHEMA_VERSION,
    timestamp: new Date().toISOString(),
    proposal: args.proposal,
    approval: args.approval,
    validation: args.validation,
  };

  if (!fs.existsSync(args.outputDir)) fs.mkdirSync(args.outputDir, { recursive: true });
  const file = path.join(args.outputDir, `${record.proposal.id}.json`);
  fs.writeFileSync(file, JSON.stringify(record, null, 2), 'utf8');
  return record;
}
