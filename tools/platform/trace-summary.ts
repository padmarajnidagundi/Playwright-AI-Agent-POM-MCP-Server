import * as fs from 'fs';
import * as path from 'path';
import { TraceSummary } from './schemas';

function normalizeStep(step: string): string {
  return step.replace(/\s+/g, ' ').trim();
}

export function summarizeTraceArtifacts(params: {
  tracePath?: string;
  screenshotPath?: string;
  videoPath?: string;
  errorMessage?: string;
}): TraceSummary {
  const evidence: string[] = [];
  const actionableSteps: string[] = [];

  const traceExists = !!(params.tracePath && fs.existsSync(params.tracePath));
  const screenshotExists = !!(params.screenshotPath && fs.existsSync(params.screenshotPath));
  const videoExists = !!(params.videoPath && fs.existsSync(params.videoPath));

  if (traceExists && params.tracePath) evidence.push(`Trace: ${path.basename(params.tracePath)}`);
  if (screenshotExists && params.screenshotPath) evidence.push(`Screenshot: ${path.basename(params.screenshotPath)}`);
  if (videoExists && params.videoPath) evidence.push(`Video: ${path.basename(params.videoPath)}`);
  if (params.errorMessage) evidence.push(`Error: ${normalizeStep(params.errorMessage).slice(0, 200)}`);

  const msg = (params.errorMessage ?? '').toLowerCase();
  if (/locator|not found|strict mode violation/.test(msg)) {
    actionableSteps.push('Inspect DOM at failure point in trace and update page-object locator to role/data-testid strategy.');
    actionableSteps.push('Validate updated locator with targeted rerun on impacted spec only.');
  } else if (/timeout/.test(msg)) {
    actionableSteps.push('Inspect network + render timeline in trace and replace implicit timing with explicit wait conditions.');
    actionableSteps.push('Re-run failing spec with trace enabled to verify stable completion.');
  } else if (/net::|econnrefused|enotfound|dns/.test(msg)) {
    actionableSteps.push('Verify endpoint availability and environment base URL configuration.');
    actionableSteps.push('Capture request/response evidence and retry targeted spec after connectivity check.');
  } else {
    actionableSteps.push('Open trace and screenshot artifacts to determine the first diverging step.');
    actionableSteps.push('Apply minimal fix in page-object or test data and run impacted spec validation.');
  }

  return {
    available: traceExists || screenshotExists || videoExists,
    summary: evidence.length > 0 ? `Collected ${evidence.length} artifact signal(s) for failure triage.` : 'No artifacts available for this failure.',
    actionableSteps,
    evidence,
  };
}
