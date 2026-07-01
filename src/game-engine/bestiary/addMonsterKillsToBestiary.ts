import { monsters } from "../../data/monsters";
import { calculateBestiaryStage } from "./calculateBestiaryStage";
import { normalizeBestiaryState } from "./getBestiaryProgress";
import type { GuildBestiaryState, MonsterKillResult } from "../../shared/types";

const monsterList = Object.values(monsters);

export function addMonsterKillsToBestiary(
  bestiary: GuildBestiaryState | undefined,
  monsterKills: MonsterKillResult[] = [],
) {
  const state = normalizeBestiaryState(bestiary);
  const now = new Date().toISOString();
  const logs: string[] = [];
  const progress = [...state.progress];

  for (const killEntry of monsterKills.filter((entry) => entry.kills > 0)) {
    const monster = monsterList.find((candidate) => candidate.id === killEntry.monsterId);
    if (!monster) continue;

    const existingIndex = progress.findIndex((entry) => entry.monsterId === killEntry.monsterId);
    const existing = existingIndex >= 0 ? progress[existingIndex] : undefined;
    const previousStage = existing?.stage ?? "unknown";
    const kills = (existing?.kills ?? 0) + killEntry.kills;
    const stage = calculateBestiaryStage(monster, kills);
    const updated = {
      monsterId: killEntry.monsterId,
      monsterName: killEntry.monsterName,
      kills,
      stage,
      firstSeenAt: existing?.firstSeenAt ?? now,
      completedAt: existing?.completedAt ?? (stage === "completed" ? now : undefined),
      charmPointsClaimed: existing?.charmPointsClaimed ?? false,
    };

    if (existingIndex >= 0) {
      progress[existingIndex] = updated;
    } else {
      progress.push(updated);
    }

    logs.push(`Bestiary: ${killEntry.monsterName} +${killEntry.kills} kills.`);
    if (previousStage !== "revealed" && stage === "revealed") {
      logs.push(`Bestiary revealed: ${killEntry.monsterName}.`);
    }
    if (previousStage !== "completed" && stage === "completed") {
      logs.push(`Bestiary completed: ${killEntry.monsterName}. Claim reward available.`);
    }
  }

  return {
    bestiary: {
      ...state,
      progress,
    },
    logs,
  };
}
