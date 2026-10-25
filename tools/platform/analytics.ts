import * as fs from 'fs';
import * as path from 'path';
import { ANALYTICS_EVENT_SCHEMA_VERSION, AnalyticsEvent } from './schemas';

export function writeAnalyticsEvent(args: {
  outputDir: string;
  eventType: AnalyticsEvent['eventType'];
  metadata: Record<string, unknown>;
}): AnalyticsEvent {
  const event: AnalyticsEvent = {
    schemaVersion: ANALYTICS_EVENT_SCHEMA_VERSION,
    timestamp: new Date().toISOString(),
    eventType: args.eventType,
    metadata: args.metadata,
  };

  if (!fs.existsSync(args.outputDir)) fs.mkdirSync(args.outputDir, { recursive: true });
  const file = path.join(args.outputDir, `${event.timestamp.replace(/[:.]/g, '-')}-${event.eventType}.json`);
  fs.writeFileSync(file, JSON.stringify(event, null, 2), 'utf8');
  return event;
}
