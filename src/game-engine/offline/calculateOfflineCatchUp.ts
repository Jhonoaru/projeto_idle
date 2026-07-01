import { getOfflineElapsedMs } from "./getOfflineElapsedMs";
import { markExpiredActionsReady } from "./markExpiredActionsReady";
import { createOfflineReport } from "./createOfflineReport";
import type { GameStateSnapshot } from "../../database/saveGameRepository";

export interface OfflineCatchUpMetadata {
  lastSavedAt?: string;
}

export function calculateOfflineCatchUp(
  gameState: GameStateSnapshot,
  metadata: OfflineCatchUpMetadata,
  now = new Date(),
) {
  const { totalOfflineMs, consideredOfflineMs } = getOfflineElapsedMs(metadata.lastSavedAt, now);
  const catchUpNow = new Date(now.getTime() - Math.max(0, totalOfflineMs - consideredOfflineMs));
  const marked = markExpiredActionsReady(gameState.characters, catchUpNow, metadata.lastSavedAt);
  const report = createOfflineReport(
    totalOfflineMs,
    consideredOfflineMs,
    marked.reports,
    marked.logs,
    now,
  );

  return {
    state: {
      ...gameState,
      characters: marked.characters,
    },
    report,
    changed: marked.characters !== gameState.characters && marked.logs.length > 0,
  };
}

