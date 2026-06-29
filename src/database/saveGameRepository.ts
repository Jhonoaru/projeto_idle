import type Database from "@tauri-apps/plugin-sql";
import { items } from "../data/items";
import { mockCharacters } from "../data/mockCharacters";
import { mockDepot } from "../data/mockDepot";
import { mockGuild } from "../data/mockGuild";
import { mockLogs } from "../data/mockLogs";
import type {
  ActivityLogEntry,
  Character,
  EquipmentSlot,
  EquippedItems,
  Guild,
  GuildDepot,
  InventoryItem,
  Item,
  SkillName,
  SkillSet,
} from "../shared/types";
import { OWNER_TYPES, PRIMARY_METADATA_ID, SAVE_VERSION } from "./schema";

export interface GameStateSnapshot {
  guild: Guild;
  characters: Character[];
  depot: GuildDepot;
  logs: ActivityLogEntry[];
}

interface GuildRow {
  id: string;
  name: string;
  gold: number;
  renown: number;
  rank: string;
  level: number;
}

interface CharacterRow {
  id: string;
  name: string;
  vocation: Character["vocation"];
  level: number;
  experience: number;
  experience_to_next_level: number;
  status: Character["status"];
  city: string;
  stamina_hours: number;
  gold: number;
  capacity_used: number;
  capacity_max: number;
  current_action_json: string | null;
  attributes_json: string;
  completed_quest_ids_json: string;
  access_ids_json: string;
  quest_progress_json: string;
  boss_cooldowns_json: string;
  created_at: string;
}

interface SkillRow {
  character_id: string;
  skill_name: SkillName;
  level: number;
  progress_percent: number;
}

interface InventoryRow {
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
}

interface LogRow {
  id: string;
  title: string;
  message: string;
  type: ActivityLogEntry["tone"];
  created_at: string;
}

export function createInitialGameState(): GameStateSnapshot {
  return {
    guild: mockGuild,
    characters: mockCharacters,
    depot: mockDepot,
    logs: mockLogs,
  };
}

export async function loadGameState(db: Database): Promise<GameStateSnapshot> {
  const guildRows = await db.select<GuildRow[]>("SELECT * FROM guilds LIMIT 1");

  if (guildRows.length === 0) {
    const initialState = createInitialGameState();
    await saveGameState(db, initialState);
    return initialState;
  }

  const guild = mapGuild(guildRows[0]);
  const [characterRows, skillRows, inventoryRows, logRows] = await Promise.all([
    db.select<CharacterRow[]>("SELECT * FROM characters ORDER BY id"),
    db.select<SkillRow[]>("SELECT * FROM character_skills"),
    db.select<InventoryRow[]>("SELECT * FROM inventory_items"),
    db.select<LogRow[]>("SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 80"),
  ]);

  return {
    guild,
    characters: characterRows.map((row) =>
      mapCharacter(row, skillRows, inventoryRows),
    ),
    depot: {
      goldStored: 0,
      items: inventoryRows
        .filter((row) => row.owner_type === OWNER_TYPES.guildDepot)
        .map(mapInventoryItem),
    },
    logs: logRows.map(mapLog),
  };
}

export async function saveGameState(db: Database, state: GameStateSnapshot) {
  const now = new Date().toISOString();

  await clearSaveTables(db);
  await saveGuild(db, state.guild, now);

  for (const character of state.characters) {
    await saveCharacter(db, state.guild.id, character, now);
  }

  await saveGuildDepot(db, state.guild.id, state.depot, now);
  await saveLogs(db, state.guild.id, state.logs.slice(0, 80), now);
  await db.execute(
    `INSERT OR REPLACE INTO save_metadata (
      id,
      save_version,
      last_saved_at,
      modified_flag,
      integrity_hash
    ) VALUES ($1, $2, $3, $4, $5)`,
    [PRIMARY_METADATA_ID, SAVE_VERSION, now, 0, null],
  );
}

export async function resetSave(db: Database): Promise<GameStateSnapshot> {
  const initialState = createInitialGameState();
  await clearSaveTables(db);
  await saveGameState(db, initialState);
  return initialState;
}

async function clearSaveTables(db: Database) {
  await db.execute("DELETE FROM activity_logs");
  await db.execute("DELETE FROM inventory_items");
  await db.execute("DELETE FROM character_skills");
  await db.execute("DELETE FROM characters");
  await db.execute("DELETE FROM guilds");
}

async function saveGuild(db: Database, guild: Guild, now: string) {
  await db.execute(
    `INSERT INTO guilds (
      id,
      name,
      gold,
      renown,
      rank,
      level,
      created_at,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [guild.id, guild.name, guild.gold, guild.renown, guild.rank, guild.level, now, now],
  );
}

async function saveCharacter(
  db: Database,
  guildId: string,
  character: Character,
  now: string,
) {
  await db.execute(
    `INSERT INTO characters (
      id,
      guild_id,
      name,
      vocation,
      level,
      experience,
      experience_to_next_level,
      status,
      city,
      stamina_hours,
      gold,
      capacity_used,
      capacity_max,
      current_action_json,
      attributes_json,
      completed_quest_ids_json,
      access_ids_json,
      quest_progress_json,
      boss_cooldowns_json,
      created_at,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
    [
      character.id,
      guildId,
      character.name,
      character.vocation,
      character.level,
      character.experience,
      character.experienceToNextLevel,
      character.status,
      character.city,
      character.staminaHours,
      character.gold,
      character.capacityUsed,
      character.capacityMax,
      stringifyNullable(character.currentAction),
      JSON.stringify(character.attributes),
      JSON.stringify(character.completedQuestIds),
      JSON.stringify(character.accessIds),
      JSON.stringify(character.questProgress),
      JSON.stringify(character.bossCooldowns),
      character.createdAt,
      now,
    ],
  );

  for (const skill of Object.values(character.skills)) {
    await db.execute(
      `INSERT INTO character_skills (
        id,
        character_id,
        skill_name,
        level,
        progress_percent
      ) VALUES ($1, $2, $3, $4, $5)`,
      [
        `${character.id}-${skill.name}`,
        character.id,
        skill.name,
        skill.level,
        skill.progressPercent,
      ],
    );
  }

  for (const inventoryItem of character.inventory) {
    await saveInventoryItem(db, inventoryItem, {
      ownerType: OWNER_TYPES.characterInventory,
      ownerId: character.id,
      characterId: character.id,
      equipmentSlot: null,
      now,
    });
  }

  for (const inventoryItem of character.characterDepot) {
    await saveInventoryItem(db, inventoryItem, {
      ownerType: OWNER_TYPES.characterDepot,
      ownerId: character.id,
      characterId: character.id,
      equipmentSlot: null,
      now,
    });
  }

  for (const [slot, inventoryItem] of Object.entries(character.equipment)) {
    if (!inventoryItem) continue;

    await saveInventoryItem(db, inventoryItem, {
      ownerType: OWNER_TYPES.equipped,
      ownerId: character.id,
      characterId: character.id,
      equipmentSlot: slot as EquipmentSlot,
      now,
    });
  }
}

async function saveGuildDepot(
  db: Database,
  guildId: string,
  depot: GuildDepot,
  now: string,
) {
  for (const inventoryItem of depot.items) {
    await saveInventoryItem(db, inventoryItem, {
      ownerType: OWNER_TYPES.guildDepot,
      ownerId: guildId,
      characterId: inventoryItem.ownerCharacterId,
      equipmentSlot: null,
      now,
    });
  }
}

async function saveInventoryItem(
  db: Database,
  inventoryItem: InventoryItem,
  options: {
    ownerType: string;
    ownerId: string;
    characterId?: string;
    equipmentSlot: EquipmentSlot | null;
    now: string;
  },
) {
  await db.execute(
    `INSERT INTO inventory_items (
      id,
      owner_type,
      owner_id,
      character_id,
      item_id,
      quantity,
      locked,
      location,
      equipment_slot,
      parent_container_id,
      created_at,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [
      inventoryItem.id,
      options.ownerType,
      options.ownerId,
      options.characterId ?? null,
      inventoryItem.itemId,
      inventoryItem.quantity,
      inventoryItem.locked ? 1 : 0,
      inventoryItem.location,
      options.equipmentSlot,
      inventoryItem.parentContainerId ?? null,
      options.now,
      options.now,
    ],
  );
}

async function saveLogs(
  db: Database,
  guildId: string,
  logs: ActivityLogEntry[],
  now: string,
) {
  for (const log of logs) {
    await db.execute(
      `INSERT INTO activity_logs (
        id,
        guild_id,
        character_id,
        title,
        message,
        type,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [log.id, guildId, null, log.title, log.message, log.tone, now],
    );
  }
}

function mapGuild(row: GuildRow): Guild {
  return {
    id: row.id,
    name: row.name,
    gold: row.gold,
    renown: row.renown,
    rank: row.rank,
    level: row.level,
  };
}

function mapCharacter(
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
    gold: row.gold,
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
    createdAt: row.created_at,
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

function mapInventoryItem(row: InventoryRow): InventoryItem {
  return {
    id: row.id,
    itemId: row.item_id,
    item: getCatalogItem(row.item_id),
    quantity: row.quantity,
    ownerCharacterId: row.character_id ?? undefined,
    parentContainerId: row.parent_container_id,
    locked: Boolean(row.locked),
    location: row.location,
  };
}

function mapLog(row: LogRow): ActivityLogEntry {
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

function stringifyNullable(value: unknown) {
  return value ? JSON.stringify(value) : null;
}

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
