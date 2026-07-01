import { items } from "../data/items";
import { mockCharacters } from "../data/mockCharacters";
import { normalizeBestiaryState } from "../game-engine/bestiary/getBestiaryProgress";
import type {
  ActivityLogEntry,
  Character,
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
  return {
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
  };
}

export function mapCharacter(
  row: CharacterRow,
  skillRows: SkillRow[],
  inventoryRows: InventoryRow[],
): Character {
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
    inventory: inventoryRows
      .filter(
        (inventoryRow) =>
          inventoryRow.owner_type === OWNER_TYPES.characterInventory &&
          inventoryRow.owner_id === row.id,
      )
      .map(mapInventoryItem),
    characterDepot: inventoryRows
      .filter(
        (inventoryRow) =>
          inventoryRow.owner_type === OWNER_TYPES.characterDepot &&
          inventoryRow.owner_id === row.id,
      )
      .map(mapInventoryItem),
    equipment: mapEquipment(row.id, inventoryRows),
    capacityUsed: row.capacity_used,
    capacityMax: row.capacity_max,
    completedQuestIds: parseJson(row.completed_quest_ids_json, []),
    accessIds: parseJson(row.access_ids_json, []),
    bossCooldowns: parseJson(row.boss_cooldowns_json, []),
    questProgress: parseJson(row.quest_progress_json, []),
    skills: mapSkills(row.id, skillRows),
    attributes: parseJson(row.attributes_json, {
      maxHealth: 0,
      maxMana: 0,
      capacity: row.capacity_max,
      speed: 0,
      attackPower: 0,
      defensePower: 0,
      armor: 0,
    }),
    currentAction: row.current_action_json
      ? parseJson(row.current_action_json, undefined)
      : undefined,
    deathState: row.death_state_json
      ? parseJson(row.death_state_json, undefined)
      : undefined,
    blessings: parseJson(row.blessings_json ?? "[]", []),
    deathCount: row.death_count ?? 0,
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
    upgradeLevel: row.upgrade_level ?? 0,
    tier: row.tier ?? 0,
    imbuements: parseJson(row.imbuements_json ?? "[]", []),
  };
}

export function mapLog(row: LogRow): ActivityLogEntry {
  return {
    id: row.id,
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
  const getSkill = (skillName: SkillName) => {
    const row = characterSkillRows.find((entry) => entry.skill_name === skillName);

    return {
      name: skillName,
      level: row?.level ?? 10,
      progressPercent: row?.progress_percent ?? 0,
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
