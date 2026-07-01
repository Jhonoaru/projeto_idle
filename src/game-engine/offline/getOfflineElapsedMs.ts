export const MAX_OFFLINE_CATCHUP_HOURS = 12;
export const MAX_OFFLINE_CATCHUP_MS = MAX_OFFLINE_CATCHUP_HOURS * 60 * 60 * 1000;

export function getOfflineElapsedMs(lastSavedAt: string | undefined, now = new Date()) {
  if (!lastSavedAt) {
    return { totalOfflineMs: 0, consideredOfflineMs: 0 };
  }

  const savedAtMs = new Date(lastSavedAt).getTime();
  if (!Number.isFinite(savedAtMs)) {
    return { totalOfflineMs: 0, consideredOfflineMs: 0 };
  }

  const totalOfflineMs = now.getTime() - savedAtMs;
  if (totalOfflineMs < 0) {
    console.warn("Offline catch-up skipped because system clock moved backwards.");
    return { totalOfflineMs: 0, consideredOfflineMs: 0 };
  }

  return {
    totalOfflineMs,
    consideredOfflineMs: Math.min(totalOfflineMs, MAX_OFFLINE_CATCHUP_MS),
  };
}

