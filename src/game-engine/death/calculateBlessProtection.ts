import type { Blessing } from "../../shared/types";

export function calculateBlessProtection(blessing?: Blessing) {
  if (!blessing) return 0;

  return Math.min(95, Math.max(0, blessing.protectionPercent)) / 100;
}
