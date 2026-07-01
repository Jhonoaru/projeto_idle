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

  for (const entry of bestiary?.progress ?? []) {
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

  const unlockedCharmIds = [...new Set((bestiary?.unlockedCharmIds ?? []).filter(Boolean))];
  const activeCharms = [];
  const usedCharmIds = new Set<string>();
  const usedMonsterIds = new Set<string>();

  for (const assignment of bestiary?.activeCharms ?? []) {
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
    charmPoints: Math.max(0, Math.floor(bestiary?.charmPoints ?? 0)),
    unlockedCharmIds,
    activeCharms,
  };
}

export function getBestiaryProgress(
  bestiary: GuildBestiaryState | undefined,
  monsterId: string,
): MonsterBestiaryProgress | undefined {
  return normalizeBestiaryState(bestiary).progress.find(
    (entry) => entry.monsterId === monsterId,
  );
}
