import type { GuildBestiaryState, MonsterBestiaryProgress } from "../../shared/types";

export const emptyBestiaryState: GuildBestiaryState = {
  progress: [],
  charmPoints: 0,
  unlockedCharmIds: [],
  activeCharms: [],
};

export function normalizeBestiaryState(
  bestiary?: Partial<GuildBestiaryState>,
): GuildBestiaryState {
  const progressByMonster = new Map<string, MonsterBestiaryProgress>();

  const sourceProgress = Array.isArray(bestiary?.progress) ? bestiary.progress : [];
  for (const entry of sourceProgress) {
    if (!entry?.monsterId) continue;

    const existing = progressByMonster.get(entry.monsterId);
    const kills = Math.max(0, Number.isFinite(entry.kills) ? entry.kills : 0);

    if (!existing || kills >= existing.kills) {
      progressByMonster.set(entry.monsterId, {
        ...entry,
        monsterName: entry.monsterName || "Unknown Creature",
        kills,
        stage: entry.stage ?? "started",
        charmPointsClaimed: entry.charmPointsClaimed === true,
      });
    }
  }

  const unlockedCharmIds = [...new Set(
    (Array.isArray(bestiary?.unlockedCharmIds) ? bestiary.unlockedCharmIds : [])
      .filter((charmId): charmId is string => typeof charmId === "string" && charmId.length > 0),
  )];
  const activeCharms = [];
  const usedCharmIds = new Set<string>();
  const usedMonsterIds = new Set<string>();

  const sourceActiveCharms = Array.isArray(bestiary?.activeCharms) ? bestiary.activeCharms : [];
  for (const assignment of sourceActiveCharms) {
    if (!assignment?.charmId || !assignment?.monsterId) continue;
    if (usedCharmIds.has(assignment.charmId) || usedMonsterIds.has(assignment.monsterId)) continue;

    const progress = progressByMonster.get(assignment.monsterId);
    if (!unlockedCharmIds.includes(assignment.charmId) || progress?.stage !== "completed") continue;

    activeCharms.push(assignment);
    usedCharmIds.add(assignment.charmId);
    usedMonsterIds.add(assignment.monsterId);
  }

  return {
    progress: [...progressByMonster.values()],
    charmPoints: normalizeInteger(bestiary?.charmPoints),
    unlockedCharmIds,
    activeCharms,
  };
}

function normalizeInteger(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
}

export function getBestiaryProgress(
  bestiary: GuildBestiaryState | undefined,
  monsterId: string,
): MonsterBestiaryProgress | undefined {
  return normalizeBestiaryState(bestiary).progress.find(
    (entry) => entry.monsterId === monsterId,
  );
}
