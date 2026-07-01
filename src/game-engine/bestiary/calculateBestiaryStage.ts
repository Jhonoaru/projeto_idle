import { getBestiaryThreshold } from "../../data/bestiaryThresholds";
import type { BestiaryStage, Monster } from "../../shared/types";

export function calculateBestiaryStage(monster: Pick<Monster, "level">, kills: number): BestiaryStage {
  if (kills <= 0) return "unknown";

  const threshold = getBestiaryThreshold(monster);

  if (kills >= threshold.completeKills) return "completed";
  if (kills >= threshold.revealKills) return "revealed";
  return "started";
}
