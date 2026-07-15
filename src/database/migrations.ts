import type Database from "@tauri-apps/plugin-sql";
import { PRIMARY_METADATA_ID, SAVE_VERSION } from "./schema";

const createStatements = [
  `CREATE TABLE IF NOT EXISTS guilds (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    gold INTEGER NOT NULL,
    renown INTEGER NOT NULL,
    rank TEXT NOT NULL,
    level INTEGER NOT NULL,
    bestiary_json TEXT NOT NULL DEFAULT '{"progress":[],"charmPoints":0,"unlockedCharmIds":[],"activeCharms":[]}',
    hunt_presets_json TEXT NOT NULL DEFAULT '[]',
    collections_json TEXT NOT NULL DEFAULT '{}',
    daily_reward_json TEXT NOT NULL DEFAULT '{}',
    career_identity_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS characters (
    id TEXT PRIMARY KEY,
    guild_id TEXT NOT NULL,
    name TEXT NOT NULL,
    vocation TEXT NOT NULL,
    level INTEGER NOT NULL,
    experience INTEGER NOT NULL,
    experience_to_next_level INTEGER NOT NULL,
    status TEXT NOT NULL,
    city TEXT NOT NULL,
    stamina_hours REAL NOT NULL,
    gold INTEGER NOT NULL,
    capacity_used REAL NOT NULL,
    capacity_max REAL NOT NULL,
    current_action_json TEXT,
    attributes_json TEXT NOT NULL,
    completed_quest_ids_json TEXT NOT NULL,
    access_ids_json TEXT NOT NULL,
    quest_progress_json TEXT NOT NULL,
    boss_cooldowns_json TEXT NOT NULL,
    death_state_json TEXT,
    blessings_json TEXT NOT NULL DEFAULT '[]',
    death_count INTEGER NOT NULL DEFAULT 0,
    weapon_proficiencies_json TEXT NOT NULL DEFAULT '{}',
    monster_focus_json TEXT NOT NULL DEFAULT '{}',
    destiny_json TEXT NOT NULL DEFAULT '{}',
    cosmetics_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS character_skills (
    id TEXT PRIMARY KEY,
    character_id TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    level INTEGER NOT NULL,
    progress_percent REAL NOT NULL,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS inventory_items (
    id TEXT PRIMARY KEY,
    owner_type TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    character_id TEXT,
    item_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    locked INTEGER NOT NULL DEFAULT 0,
    location TEXT NOT NULL,
    equipment_slot TEXT,
    parent_container_id TEXT,
    upgrade_level INTEGER NOT NULL DEFAULT 0,
    tier INTEGER NOT NULL DEFAULT 0,
    imbuements_json TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    guild_id TEXT NOT NULL,
    character_id TEXT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS save_metadata (
    id TEXT PRIMARY KEY,
    save_version INTEGER NOT NULL,
    last_saved_at TEXT NOT NULL,
    last_loaded_at TEXT,
    last_closed_at TEXT,
    last_offline_catchup_at TEXT,
    modified_flag INTEGER NOT NULL DEFAULT 0,
    integrity_hash TEXT
  )`,
];

export async function runMigrations(db: Database) {
  await db.execute("PRAGMA foreign_keys = ON");

  for (const statement of createStatements) {
    await db.execute(statement);
  }

  await addColumnIfMissing(
    db,
    "guilds",
    "bestiary_json",
    "TEXT NOT NULL DEFAULT '{\"progress\":[],\"charmPoints\":0,\"unlockedCharmIds\":[],\"activeCharms\":[]}'",
  );
  await addColumnIfMissing(db, "guilds", "hunt_presets_json", "TEXT NOT NULL DEFAULT '[]'");
  await addColumnIfMissing(db, "guilds", "collections_json", "TEXT NOT NULL DEFAULT '{}'");
  await addColumnIfMissing(db, "guilds", "daily_reward_json", "TEXT NOT NULL DEFAULT '{}'");
  await addColumnIfMissing(db, "guilds", "career_identity_json", "TEXT NOT NULL DEFAULT '{}'");

  await addColumnIfMissing(db, "characters", "death_state_json", "TEXT");
  await addColumnIfMissing(db, "characters", "blessings_json", "TEXT NOT NULL DEFAULT '[]'");
  await addColumnIfMissing(db, "characters", "death_count", "INTEGER NOT NULL DEFAULT 0");
  await addColumnIfMissing(db, "characters", "weapon_proficiencies_json", "TEXT NOT NULL DEFAULT '{}'");
  await addColumnIfMissing(db, "characters", "monster_focus_json", "TEXT NOT NULL DEFAULT '{}'");
  await addColumnIfMissing(db, "characters", "destiny_json", "TEXT NOT NULL DEFAULT '{}'");
  await addColumnIfMissing(db, "characters", "cosmetics_json", "TEXT NOT NULL DEFAULT '{}'");
  await addColumnIfMissing(db, "inventory_items", "upgrade_level", "INTEGER NOT NULL DEFAULT 0");
  await addColumnIfMissing(db, "inventory_items", "tier", "INTEGER NOT NULL DEFAULT 0");
  await addColumnIfMissing(db, "inventory_items", "imbuements_json", "TEXT NOT NULL DEFAULT '[]'");
  await addColumnIfMissing(db, "save_metadata", "last_loaded_at", "TEXT");
  await addColumnIfMissing(db, "save_metadata", "last_closed_at", "TEXT");
  await addColumnIfMissing(db, "save_metadata", "last_offline_catchup_at", "TEXT");

  await db.execute(
    `INSERT OR IGNORE INTO save_metadata (
      id,
      save_version,
      last_saved_at,
      modified_flag,
      integrity_hash
    ) VALUES ($1, $2, $3, $4, $5)`,
    [PRIMARY_METADATA_ID, SAVE_VERSION, new Date().toISOString(), 0, null],
  );
}

async function addColumnIfMissing(
  db: Database,
  tableName: string,
  columnName: string,
  definition: string,
) {
  const columns = await db.select<Array<{ name: string }>>(`PRAGMA table_info(${tableName})`);

  if (columns.some((column) => column.name === columnName)) return;

  try {
    await db.execute(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes("duplicate column")) {
      return;
    }

    if (String(error).toLowerCase().includes("duplicate column")) {
      return;
    }

    throw error;
  }
}
