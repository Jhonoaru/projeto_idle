import { formatDuration } from "../../shared/time";
import type { OfflineCatchUpReport, OfflineCharacterReport } from "../../shared/types";

export function createOfflineReport(
  totalOfflineMs: number,
  consideredOfflineMs: number,
  characterReports: OfflineCharacterReport[],
  logs: string[],
  now = new Date(),
): OfflineCatchUpReport {
  return {
    generatedAt: now.toISOString(),
    totalOfflineMs,
    consideredOfflineMs,
    characterReports,
    logs: [
      `Offline catch-up calculated: ${formatDuration(consideredOfflineMs)} considered (${formatDuration(totalOfflineMs)} real).`,
      ...logs,
    ],
  };
}

