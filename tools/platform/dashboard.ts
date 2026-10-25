import * as fs from 'fs';
import { readReportFiles } from './report-history';

interface SimpleReport {
  runId?: string;
  summary?: {
    passed?: number;
    failed?: number;
    total?: number;
    durationMs?: number;
  };
  tests?: Array<{ status?: string; category?: string; retries?: number }>;
}

export interface DashboardMetrics {
  runs: number;
  totalTests: number;
  totalFailures: number;
  passRate: number;
  avgDurationMs: number;
  flakyRate: number;
  topFailureCategories: Array<{ category: string; count: number }>;
}

export function buildDashboardMetrics(historyDir: string): DashboardMetrics {
  const files = readReportFiles(historyDir);
  const reports: SimpleReport[] = files.map(file => {
    try {
      return JSON.parse(fs.readFileSync(file, 'utf8')) as SimpleReport;
    } catch {
      return {};
    }
  });

  const runs = reports.length;
  const totalTests = reports.reduce((sum, r) => sum + (r.summary?.total ?? 0), 0);
  const totalFailures = reports.reduce((sum, r) => sum + (r.summary?.failed ?? 0), 0);
  const totalDuration = reports.reduce((sum, r) => sum + (r.summary?.durationMs ?? 0), 0);
  const retries = reports.reduce(
    (sum, r) =>
      sum +
      (r.tests ?? []).reduce((inner, test) => inner + ((test.retries ?? 0) > 0 ? 1 : 0), 0),
    0
  );

  const categoryCount = new Map<string, number>();
  for (const report of reports) {
    for (const test of report.tests ?? []) {
      if (!test.category) continue;
      categoryCount.set(test.category, (categoryCount.get(test.category) ?? 0) + 1);
    }
  }

  const topFailureCategories = [...categoryCount.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    runs,
    totalTests,
    totalFailures,
    passRate: totalTests > 0 ? (totalTests - totalFailures) / totalTests : 0,
    avgDurationMs: runs > 0 ? Math.round(totalDuration / runs) : 0,
    flakyRate: totalTests > 0 ? retries / totalTests : 0,
    topFailureCategories,
  };
}
