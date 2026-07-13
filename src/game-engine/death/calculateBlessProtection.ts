import type { Blessing } from "../../shared/types";

export function calculateBlessProtection(blessing?: Blessing) {
  if (!blessing) return 0;

  return calculateBlessingsProtection([blessing]);
}

export function calculateBlessingsProtection(blessings: Blessing[] = []) {
  const totalProtection = blessings.reduce(
    (total, blessing) => total + Math.max(0, blessing.protectionPercent),
    0,
  );

  return Math.min(70, totalProtection) / 100;
}
