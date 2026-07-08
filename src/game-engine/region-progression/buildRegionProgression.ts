import { accesses } from "../../data/accesses";
import type { AccessKey, Boss, Character, HuntArea, Quest } from "../../shared/types";

export type RegionProgressionItemKind = "hunt" | "quest" | "boss" | "access";
export type RegionProgressionStatus = "completed" | "active" | "available" | "locked";

export interface RegionProgressionItem {
  id: string;
  kind: RegionProgressionItemKind;
  name: string;
  description: string;
  city: string;
  requiredLevel: number;
  risk?: string;
  status: RegionProgressionStatus;
  blockerText?: string;
  unlockText?: string;
  tags: string[];
}

export interface RegionProgression {
  city: string;
  levelRange: string;
  progressPercent: number;
  completedCount: number;
  totalCount: number;
  unlockedCount: number;
  items: RegionProgressionItem[];
  nextItem?: RegionProgressionItem;
  accessKeys: AccessKey[];
}

export function buildRegionProgression(
  character: Character,
  hunts: HuntArea[],
  quests: Quest[],
  bosses: Boss[],
): RegionProgression[] {
  const cities = Array.from(
    new Set([
      character.city,
      ...hunts.map((hunt) => hunt.city),
      ...quests.map((quest) => quest.city),
      ...bosses.map((boss) => boss.city),
    ].filter(Boolean)),
  );

  return cities
    .map((city) => {
      const items = [
        ...getAccessItems(character, city, quests),
        ...hunts.filter((hunt) => hunt.city === city).map((hunt) => getHuntItem(character, hunt)),
        ...quests.filter((quest) => quest.city === city).map((quest) => getQuestItem(character, quest)),
        ...bosses.filter((boss) => boss.city === city).map((boss) => getBossItem(character, boss)),
      ].sort(sortProgressionItems);
      const totalCount = items.length;
      const completedCount = items.filter((item) => item.status === "completed").length;
      const unlockedCount = items.filter((item) => item.status !== "locked").length;
      const nextItem =
        items.find((item) => item.status === "available" || item.status === "active") ??
        items.find((item) => item.status === "locked");
      const levels = items.map((item) => item.requiredLevel).filter((level) => level > 0);

      return {
        city,
        levelRange: formatLevelRange(levels),
        progressPercent: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
        completedCount,
        totalCount,
        unlockedCount,
        items,
        nextItem,
        accessKeys: getAccessKeysForCity(city, quests),
      };
    })
    .sort((a, b) => getRegionSortLevel(a) - getRegionSortLevel(b));
}

function getAccessItems(character: Character, city: string, quests: Quest[]): RegionProgressionItem[] {
  return getAccessKeysForCity(city, quests).map((access) => {
    const quest = quests.find((entry) => entry.unlocksAccess === access.id);
    const owned = character.accessIds.includes(access.id);
    const questCompleted = quest ? character.completedQuestIds.includes(quest.id) : false;
    const questActive = quest
      ? character.questProgress.some((progress) => progress.questId === quest.id && progress.status === "in_progress")
      : false;
    const status: RegionProgressionStatus = owned
      ? "completed"
      : questActive
        ? "active"
        : quest && canStartByRequirements(character, quest.requiredLevel, quest.requiredAccess, quest.requiredQuestIds)
          ? "available"
          : "locked";

    return {
      id: `access-${access.id}`,
      kind: "access",
      name: access.name,
      description: access.description,
      city,
      requiredLevel: quest?.requiredLevel ?? 1,
      status,
      blockerText: owned ? undefined : getQuestBlocker(character, quest),
      unlockText: questCompleted || owned ? "Access unlocked" : quest ? `Unlock via ${quest.name}` : "No quest source",
      tags: ["access"],
    };
  });
}

function getHuntItem(character: Character, hunt: HuntArea): RegionProgressionItem {
  const missingAccess = hunt.requiredAccess && !character.accessIds.includes(hunt.requiredAccess)
    ? hunt.requiredAccess
    : undefined;
  const levelLocked = character.level < hunt.minLevel;
  const status: RegionProgressionStatus = levelLocked || missingAccess ? "locked" : "available";

  return {
    id: hunt.id,
    kind: "hunt",
    name: hunt.name,
    description: hunt.description,
    city: hunt.city,
    requiredLevel: hunt.minLevel,
    risk: hunt.risk,
    status,
    blockerText: levelLocked
      ? `Requires level ${hunt.minLevel}`
      : missingAccess
        ? `Requires ${formatAccessName(missingAccess)}`
        : undefined,
    unlockText: hunt.requiredAccess ? formatAccessName(hunt.requiredAccess) : "Open route",
    tags: hunt.tags,
  };
}

function getQuestItem(character: Character, quest: Quest): RegionProgressionItem {
  const completed = character.completedQuestIds.includes(quest.id);
  const active = character.questProgress.some(
    (progress) => progress.questId === quest.id && progress.status === "in_progress",
  );
  const status: RegionProgressionStatus = completed
    ? "completed"
    : active
      ? "active"
      : canStartByRequirements(character, quest.requiredLevel, quest.requiredAccess, quest.requiredQuestIds)
        ? "available"
        : "locked";

  return {
    id: quest.id,
    kind: "quest",
    name: quest.name,
    description: quest.description,
    city: quest.city,
    requiredLevel: quest.requiredLevel,
    risk: quest.risk,
    status,
    blockerText: completed ? undefined : getQuestBlocker(character, quest),
    unlockText: quest.unlocksAccess ? `Unlocks ${formatAccessName(quest.unlocksAccess)}` : "Story progress",
    tags: quest.tags,
  };
}

function getBossItem(character: Character, boss: Boss): RegionProgressionItem {
  const missingAccess = boss.requirements.requiredAccessIds?.find((accessId) => !character.accessIds.includes(accessId));
  const missingQuest = boss.requirements.requiredQuestIds?.find(
    (questId) => !character.completedQuestIds.includes(questId),
  );
  const levelLocked = character.level < boss.requirements.requiredLevel;
  const status: RegionProgressionStatus = levelLocked || missingAccess || missingQuest ? "locked" : "available";

  return {
    id: boss.id,
    kind: "boss",
    name: boss.name,
    description: boss.description,
    city: boss.city,
    requiredLevel: boss.requirements.requiredLevel,
    risk: boss.risk,
    status,
    blockerText: levelLocked
      ? `Requires level ${boss.requirements.requiredLevel}`
      : missingAccess
        ? `Requires ${formatAccessName(missingAccess)}`
        : missingQuest
          ? `Requires quest ${missingQuest}`
          : undefined,
    unlockText: boss.requirements.requiredAccessIds?.length
      ? boss.requirements.requiredAccessIds.map(formatAccessName).join(", ")
      : "Open contract",
    tags: boss.tags,
  };
}

function getQuestBlocker(character: Character, quest?: Quest) {
  if (!quest) return "No unlock quest found";
  if (character.level < quest.requiredLevel) return `Requires level ${quest.requiredLevel}`;
  if (quest.requiredAccess && !character.accessIds.includes(quest.requiredAccess)) {
    return `Requires ${formatAccessName(quest.requiredAccess)}`;
  }
  const missingQuest = quest.requiredQuestIds?.find((questId) => !character.completedQuestIds.includes(questId));
  if (missingQuest) return `Requires quest ${missingQuest}`;
  return undefined;
}

function canStartByRequirements(
  character: Character,
  requiredLevel: number,
  requiredAccess?: string,
  requiredQuestIds?: string[],
) {
  if (character.level < requiredLevel) return false;
  if (requiredAccess && !character.accessIds.includes(requiredAccess)) return false;
  if (requiredQuestIds?.some((questId) => !character.completedQuestIds.includes(questId))) return false;
  return true;
}

function getAccessKeysForCity(city: string, quests: Quest[]) {
  const ids = quests
    .filter((quest) => quest.city === city && quest.unlocksAccess)
    .map((quest) => quest.unlocksAccess as string);

  return accesses.filter((access) => ids.includes(access.id));
}

function formatAccessName(accessId: string) {
  return accesses.find((access) => access.id === accessId)?.name ?? accessId;
}

function formatLevelRange(levels: number[]) {
  if (levels.length === 0) return "Any level";
  const min = Math.min(...levels);
  const max = Math.max(...levels);
  return min === max ? `Level ${min}` : `Level ${min}-${max}`;
}

function getRegionSortLevel(region: RegionProgression) {
  const levels = region.items.map((item) => item.requiredLevel).filter((level) => level > 0);
  return levels.length > 0 ? Math.min(...levels) : 999;
}

function sortProgressionItems(a: RegionProgressionItem, b: RegionProgressionItem) {
  const kindOrder: Record<RegionProgressionItemKind, number> = {
    access: 0,
    hunt: 1,
    quest: 2,
    boss: 3,
  };
  if (a.requiredLevel !== b.requiredLevel) return a.requiredLevel - b.requiredLevel;
  if (kindOrder[a.kind] !== kindOrder[b.kind]) return kindOrder[a.kind] - kindOrder[b.kind];
  return a.name.localeCompare(b.name);
}
