import * as fs from 'fs';
import * as path from 'path';

function collectSpecFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectSpecFiles(full));
    else if (/\.spec\.(ts|js)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function normalize(input: string): string {
  return input.replace(/\\/g, '/').toLowerCase();
}

export function selectTestsForChanges(args: {
  repoRoot: string;
  changedFiles: string[];
}): { selectedSpecs: string[]; reasons: Record<string, string[]> } {
  const testsRoot = path.join(args.repoRoot, 'tests');
  const specs = collectSpecFiles(testsRoot);

  const changed = args.changedFiles.map(normalize);
  const reasons: Record<string, string[]> = {};
  const selected = new Set<string>();

  for (const spec of specs) {
    const relativeSpec = normalize(path.relative(args.repoRoot, spec));
    const content = fs.readFileSync(spec, 'utf8').toLowerCase();

    for (const file of changed) {
      const base = file.split('/').pop() ?? file;
      const pageHint = file.includes('/tests/pages/');
      const dataHint = file.includes('/tests/data/');

      if (relativeSpec.includes('unit-tests') && (file.includes('/tools/') || file.endsWith('mcp-server.ts'))) {
        selected.add(relativeSpec);
        reasons[relativeSpec] = [...(reasons[relativeSpec] ?? []), `unit scope for changed tool file: ${file}`];
      }

      if (pageHint && content.includes(base.replace('.ts', '').toLowerCase())) {
        selected.add(relativeSpec);
        reasons[relativeSpec] = [...(reasons[relativeSpec] ?? []), `references changed page object: ${base}`];
      }

      if (dataHint && content.includes('/data/')) {
        selected.add(relativeSpec);
        reasons[relativeSpec] = [...(reasons[relativeSpec] ?? []), `imports shared test data: ${base}`];
      }

      if (relativeSpec === file) {
        selected.add(relativeSpec);
        reasons[relativeSpec] = [...(reasons[relativeSpec] ?? []), 'changed file is a spec itself'];
      }
    }
  }

  if (selected.size === 0) {
    for (const spec of specs) {
      const relative = normalize(path.relative(args.repoRoot, spec));
      if (relative.includes('smoke') || relative.includes('wesendcv.spec.ts')) {
        selected.add(relative);
        reasons[relative] = ['fallback smoke selection'];
      }
    }
  }

  return {
    selectedSpecs: [...selected].sort((a, b) => a.localeCompare(b)),
    reasons,
  };
}
