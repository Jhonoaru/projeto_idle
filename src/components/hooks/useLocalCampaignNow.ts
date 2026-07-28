import { useEffect, useMemo, useState } from "react";

const MAX_TIMEOUT_MS = 2_147_000_000;

export function useLocalCampaignNow() {
  const [clock, setClock] = useState(() => Date.now());

  useEffect(() => {
    const refresh = () => setClock(Date.now());
    const timeout = window.setTimeout(refresh, getNextLocalCampaignCycleDelay(new Date(clock)));
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };

    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [clock]);

  return useMemo(() => new Date(clock), [clock]);
}

export function getNextLocalCampaignCycleDelay(now: Date) {
  const current = Number.isFinite(now.getTime()) ? now : new Date();
  const nextCycle = new Date(current);
  nextCycle.setDate(nextCycle.getDate() + 1);
  nextCycle.setHours(0, 0, 0, 0);
  return Math.min(MAX_TIMEOUT_MS, Math.max(50, nextCycle.getTime() - current.getTime() + 50));
}
