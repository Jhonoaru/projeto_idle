import type { CombatSkillTarget } from "../../shared/types";

export function calculateIncomingAttackCount(durationMs: number, targets: CombatSkillTarget[]) {
  const durationMinutes = Math.max(0, Math.min(8 * 60, Number.isFinite(durationMs) ? durationMs / 60_000 : 0));
  if (durationMinutes <= 0 || targets.length === 0) return 0;
  const averageLevel = targets.reduce((sum, target) => sum + bounded(target.level, 1, 500, 1), 0) / targets.length;
  const attacksPerMinute = Math.min(15, Math.max(6, 8 + averageLevel * 0.03));
  return Math.min(20_000, Math.max(1, Math.round(durationMinutes * attacksPerMinute)));
}

function bounded(value: unknown, minimum: number, maximum: number, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.min(maximum, Math.max(minimum, parsed)) : fallback;
}
