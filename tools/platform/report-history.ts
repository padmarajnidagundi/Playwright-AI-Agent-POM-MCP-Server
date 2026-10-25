import * as fs from 'fs';
import * as path from 'path';

export function archiveReportIfExists(reportFile: string, historyDir: string): string | null {
  if (!fs.existsSync(reportFile)) return null;
  if (!fs.existsSync(historyDir)) fs.mkdirSync(historyDir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const destination = path.join(historyDir, `ai-report-${stamp}.json`);
  fs.copyFileSync(reportFile, destination);
  return destination;
}

export function readReportFiles(historyDir: string): string[] {
  if (!fs.existsSync(historyDir)) return [];
  return fs
    .readdirSync(historyDir)
    .filter(name => name.endsWith('.json'))
    .map(name => path.join(historyDir, name))
    .sort((a, b) => a.localeCompare(b));
}
