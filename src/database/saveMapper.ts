import { items } from "../data/items";
import { mockCharacters } from "../data/mockCharacters";
import { normalizeBestiaryState } from "../game-engine/bestiary/getBestiaryProgress";
import { normalizeCharacterAction } from "../game-engine/action/normalizeCharacterAction";
import { calculateCharacterAttributes } from "../game-engine/character/calculateCharacterAttributes";
import { normalizeCharacterCosmetics } from "../game-engine/collections/normalizeCharacterCosmetics";
import { normalizeCollectionsState } from "../game-engine/collections/normalizeCollectionsState";
import { normalizeDailyRewardState } from "../game-engine/daily-reward/normalizeDailyRewardState";
import { normalizeGuildCareerIdentity } from "../game-engine/achievements/getGuildIdentity";
import { normalizeGuildHeadquarters } from "../game-engine/headquarters/normalizeGuildHeadquarters";
import { normalizeGuildExpeditionState } from "../game-engine/expeditions/normalizeGuildExpeditionState";
import { normalizeGuildStaffState } from "../game-engine/staff/normalizeGuildStaffState";
import { normalizeGuildTreasuryState } from "../game-engine/treasury/normalizeGuildTreasuryState";
import { normalizeGuildProjectsState } from "../game-engine/projects/normalizeGuildProjectsState";
import { normalizeGuildBazaarState } from "../game-engine/bazaar/normalizeGuildBazaarState";
import { normalizeGuildCraftingState } from "../game-engine/crafting/normalizeGuildCraftingState";
import { normalizeGuildLogisticsState } from "../game-engine/logistics/normalizeGuildLogisticsState";
import { normalizeGuildProgressionRewardState } from "../game-engine/guild-progression/normalizeGuildProgressionRewardState";
import { normalizeGuildProgression } from "../game-engine/guild-progression/getGuildProgression";
import { normalizeItemTier, normalizeItemUpgradeLevel } from "../game-engine/items/getItemVisualIdentity";
import { normalizeDestinyState } from "../game-engine/destiny/normalizeDestinyState";
import { normalizeMonsterFocusState } from "../game-engine/monster-focus/normalizeMonsterFocusState";
import { normalizeWeaponProficiencies } from "../game-engine/weapon-proficiency/weaponProficiencyProgression";
import type {
  ActivityLogEntry,
  Character,
  CharacterAction,
  EquipmentSlot,
  EquippedItems,
  Guild,
  InventoryItem,
  Item,
  SkillName,
  SkillSet,
} from "../shared/types";
import { OWNER_TYPES } from "./schema";

export interface GuildRow {
  id: string;
  name: string;
  gold: number;
  renown: number;
  rank: string;
  level: number;
  bestiary_json?: string | null;
  hunt_presets_json?: string | null;
  collections_json?: string | null;
  daily_reward_json?: string | null;
  career_identity_json?: string | null;
  headquarters_json?: string | null;
  expeditions_json?: string | null;
  staff_json?: string | null;
  treasury_json?: string | null;
  projects_json?: string | null;
  logistics_json?: string | null;
  bazaar_json?: string | null;
  crafting_json?: string | null;
  progression_rewards_json?: string | null;
}

export interface CharacterRow {
  id: string;
  name: string;
  vocation: Character["vocation"];
  level: number;
  experience: number;
  experience_to_next_level: number;
  status: Character["status"];
  city: string;
  stamina_hours: number;
  gold?: number;
  capacity_used: number;
  capacity_max: number;
  current_action_json: string | null;
  attributes_json: string;
  completed_quest_ids_json: string;
  access_ids_json: string;
  quest_progress_json: string;
  boss_cooldowns_json: string;
  death_state_json?: string | null;
  blessings_json?: string | null;
  death_count?: number | null;
  weapon_proficiencies_json?: string | null;
  monster_focus_json?: string | null;
  destiny_json?: string | null;
  cosmetics_json?: string | null;
  created_at: string;
}

export interface SkillRow {
  character_id: string;
  skill_name: SkillName;
  level: number;
  progress_percent: number;
}

export interface InventoryRow {
  id: string;
  owner_type: string;
  owner_id: string;
  character_id: string | null;
  item_id: string;
  quantity: number;
  locked: number;
  location: InventoryItem["location"];
  equipment_slot: EquipmentSlot | null;
  parent_container_id: string | null;
  upgrade_level?: number | null;
  tier?: number | null;
  imbuements_json?: string | null;
}

export interface LogRow {
  id: string;
  title: string;
  message: string;
  type: ActivityLogEntry["tone"];
  created_at: string;
}

export function mapGuild(row: GuildRow): Guild {
  return normalizeGuildProgression({
    id: row.id,
    name: row.name,
    gold: row.gold,
    renown: row.renown,
    rank: row.rank,
    level: row.level,
    bestiary: normalizeBestiaryState(
      row.bestiary_json ? parseJson(row.bestiary_json, undefined) : undefined,
    ),
    huntPresets: parseJson(row.hunt_presets_json ?? "[]", []),
    collections: normalizeCollectionsState(
      row.collections_json ? parseJson(row.collections_json, undefined) : undefined,
    ),
    dailyReward: normalizeDailyRewardState(
      row.daily_reward_json ? parseJson(row.daily_reward_json, undefined) : undefined,
    ),
    careerIdentity: normalizeGuildCareerIdentity(
      row.career_identity_json ? parseJson(row.career_identity_json, undefined) : undefined,
    ),
    headquarters: normalizeGuildHeadquarters(
      row.headquarters_json ? parseJson(row.headquarters_json, undefined) : undefined,
    ),
    expeditions: normalizeGuildExpeditionState(
      row.expeditions_json ? parseJson(row.expeditions_json, undefined) : undefined,
    ),
    staff: normalizeGuildStaffState(
      row.staff_json ? parseJson(row.staff_json, undefined) : undefined,
    ),
    treasury: normalizeGuildTreasuryState(
      row.treasury_json ? parseJson(row.treasury_json, undefined) : undefined,
    ),
    projects: normalizeGuildProjectsState(
      row.projects_json ? parseJson(row.projects_json, undefined) : undefined,
    ),
    logistics: normalizeGuildLogisticsState(
      row.logistics_json ? parseJson(row.logistics_json, undefined) : undefined,
    ),
    bazaar: normalizeGuildBazaarState(
      row.bazaar_json ? parseJson(row.bazaar_json, undefined) : undefined,
      row.id,
    ),
    crafting: normalizeGuildCraftingState(
      row.crafting_json ? parseJson(row.crafting_json, undefined) : undefined,
    ),
    progressionRewards: normalizeGuildProgressionRewardState(
      row.progression_rewards_json ? parseJson(row.progression_rewards_json, undefined) : undefined,
    ),
  });
}

export function mapCharacter(
  row: CharacterRow,
  skillRows: SkillRow[],
  inventoryRows: InventoryRow[],
  guild?: Guild,
): Character {
  const inventory = inventoryRows
    .filter(
      (inventoryRow) =>
        inventoryRow.owner_type === OWNER_TYPES.characterInventory &&
        inventoryRow.owner_id === row.id,
    )
    .map(mapInventoryItem);
  const characterDepot = inventoryRows
    .filter(
      (inventoryRow) =>
        inventoryRow.owner_type === OWNER_TYPES.characterDepot &&
        inventoryRow.owner_id === row.id,
    )
    .map(mapInventoryItem);
  const equipment = mapEquipment(row.id, inventoryRows);
  const skills = mapSkills(row.id, skillRows);
  const weaponProficiencies = normalizeWeaponProficiencies(
    parseJson(row.weapon_proficiencies_json ?? "{}", {}),
  );
  const monsterFocus = normalizeMonsterFocusState(
    parseJson(row.monster_focus_json ?? "{}", {}),
  );
  const destiny = normalizeDestinyState({
    level: row.level,
    vocation: row.vocation,
    destiny: parseJson(row.destiny_json ?? "{}", {}),
  });
  const cosmetics = normalizeCharacterCosmetics(
    {
      vocation: row.vocation,
      cosmetics: parseJson(row.cosmetics_json ?? "{}", {}),
    },
    guild?.collections,
  );
  const attributes = calculateCharacterAttributes({
    level: row.level,
    vocation: row.vocation,
    skills,
    equipment,
    weaponProficiencies,
    destiny,
  });
  const currentAction = normalizeCharacterAction(
    row.current_action_json
      ? parseJson<CharacterAction | undefined>(row.current_action_json, undefined)
      : undefined,
    skills,
  );

  return {
    id: row.id,
    name: row.name,
    vocation: row.vocation,
    level: row.level,
    experience: row.experience,
    experienceToNextLevel: row.experience_to_next_level,
    status: row.status,
    city: row.city,
    staminaHours: row.stamina_hours,
    gold: 0,
    inventory,
    characterDepot,
    equipment,
    capacityUsed: row.capacity_used,
    capacityMax: attributes.capacity,
    completedQuestIds: parseJson(row.completed_quest_ids_json, []),
    accessIds: parseJson(row.access_ids_json, []),
    bossCooldowns: parseJson(row.boss_cooldowns_json, []),
    questProgress: parseJson(row.quest_progress_json, []),
    skills,
    attributes,
    currentAction,
    deathState: row.death_state_json
      ? parseJson(row.death_state_json, undefined)
      : undefined,
    blessings: parseJson(row.blessings_json ?? "[]", []),
    deathCount: row.death_count ?? 0,
    weaponProficiencies,
    monsterFocus,
    destiny,
    cosmetics,
    createdAt: row.created_at,
  };
}

export function mapInventoryItem(row: InventoryRow): InventoryItem {
  return {
    id: row.id,
    itemId: row.item_id,
    item: getCatalogItem(row.item_id),
    quantity: row.quantity,
    ownerCharacterId: row.character_id ?? undefined,
    parentContainerId: row.parent_container_id,
    locked: Boolean(row.locked),
    location: row.location,
    upgradeLevel: normalizeItemUpgradeLevel(row.upgrade_level),
    tier: normalizeItemTier(row.tier),
    imbuements: parseJson(row.imbuements_json ?? "[]", []),
  };
}

export function mapLog(row: LogRow): ActivityLogEntry {
  return {
    id: row.id,
    createdAt: row.created_at,
    timestamp: new Date(row.created_at).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    title: row.title,
    message: row.message,
    tone: row.type,
  };
}

function mapSkills(characterId: string, skillRows: SkillRow[]): SkillSet {
  const characterSkillRows = skillRows.filter((row) => row.character_id === characterId);
  const defaultSkills = mockCharacters.find((character) => character.id === characterId)?.skills;
  const hasBelowBaselineSkill = characterSkillRows.some((row) => {
    const baseline = defaultSkills?.[row.skill_name as SkillName];
    return baseline ? row.level < baseline.level : false;
  });
  const getSkill = (skillName: SkillName) => {
    const row = characterSkillRows.find((entry) => entry.skill_name === skillName);
    const baseline = defaultSkills?.[skillName];

    if (!row) {
      return baseline ?? { name: skillName, level: 10, progressPercent: 0 };
    }

    const looksLikeLegacyFallback =
      hasBelowBaselineSkill &&
      row.level === 10 &&
      row.progress_percent === 0 &&
      baseline &&
      baseline.level !== 10;

    if (baseline && (row.level < baseline.level || looksLikeLegacyFallback)) {
      return baseline;
    }

    const progressPercent =
      baseline && row.level === baseline.level
        ? Math.max(row.progress_percent, baseline.progressPercent)
        : row.progress_percent;

    return {
      name: skillName,
      level: row.level,
      progressPercent,
    };
  };

  return {
    sword: getSkill("sword"),
    axe: getSkill("axe"),
    club: getSkill("club"),
    distance: getSkill("distance"),
    fist: getSkill("fist"),
    shielding: getSkill("shielding"),
    magic: getSkill("magic"),
  };
}

function mapEquipment(characterId: string, inventoryRows: InventoryRow[]): EquippedItems {
  const equippedRows = inventoryRows.filter(
    (row) =>
      row.owner_type === OWNER_TYPES.equipped &&
      row.owner_id === characterId &&
      row.equipment_slot,
  );

  return Object.fromEntries(
    equippedRows.map((row) => [row.equipment_slot, mapInventoryItem(row)]),
  ) as EquippedItems;
}

function getCatalogItem(itemId: string): Item {
  return (
    items[itemId] ?? {
      id: itemId,
      name: "Unknown Item",
      type: "misc",
      rarity: "common",
      weight: 0,
      value: 0,
      stackable: false,
      description: "This item id no longer exists in the local catalog.",
    }
  );
}

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
