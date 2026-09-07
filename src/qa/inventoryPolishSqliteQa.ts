import Database from "@tauri-apps/plugin-sql";
import { createInventoryItem } from "../data/inventoryFactory";
import { runMigrations } from "../database/migrations";
import { createInitialGameState, loadGameState, saveGameState, type GameStateSnapshot } from "../database/saveGameRepository";
import type { Character, InventoryItem } from "../shared/types";

const QA_DATABASE = "sqlite:stage1745_20260907.db";

export interface Stage1745QaResult {
  character: Character;
  report: string[];
}

export async function runStage1745Qa(): Promise<Stage1745QaResult> {
  const db = await Database.load(QA_DATABASE);
  try {
    await runMigrations(db);
    return await runChecks(db);
  } finally {
    await db.close();
  }
}

export async function saveStage1745RuntimeReport(report: string[]) {
  const db = await Database.load(QA_DATABASE);
  try {
    await db.execute("CREATE TABLE IF NOT EXISTS stage1745_report (kind TEXT NOT NULL, report_json TEXT NOT NULL)");
    await db.execute("DELETE FROM stage1745_report WHERE kind = 'runtime'");
    await db.execute("INSERT INTO stage1745_report VALUES ('runtime', $1)", [JSON.stringify(report)]);
  } finally {
    await db.close();
  }
}

async function runChecks(db: Database): Promise<Stage1745QaResult> {
  const report: string[] = [];
  const check = (ok: unknown, label: string) => {
    if (!ok) throw new Error(`FAIL after ${report.length} checks: ${label}`);
    report.push(`PASS ${label}`);
  };

  check(db.path === QA_DATABASE, "isolated Tauri SQL database");
  let state = structuredClone(createInitialGameState());
  let baseline = "";
  const fixtureCharacter = createInventoryFixture(state.characters[0]);
  state.characters = state.characters.map((character) => character.id === fixtureCharacter.id ? fixtureCharacter : character);
  await saveGameState(db, state);
  state = requireState(await loadGameState(db), "fixture reload");
  baseline = JSON.stringify({ guild: state.guild, depot: state.depot, logs: state.logs });
  let character = state.characters.find((entry) => entry.id === fixtureCharacter.id)!;
  check(character.inventory.length === 6, "six production inventory entries survive save/reload");
  check(character.inventory.filter((item) => item.locked).length === 1, "locked item survives save/reload");
  check(character.inventory.find((item) => item.locked)?.quantity === 9_999, "locked stack quantity survives save/reload");
  check(character.inventory.some((item) => item.item.rarity === "legendary" && item.tier === 3), "legendary T3 item survives save/reload");
  check(Object.values(character.equipment).filter(Boolean).length === 3, "three equipped items survive save/reload");

  let rows = await db.select<Array<{ item_id: string; locked: number; quantity: number; tier: number; equipment_slot: string | null }>>(
    "SELECT item_id, locked, quantity, tier, equipment_slot FROM inventory_items WHERE character_id = $1 ORDER BY item_id",
    [character.id],
  );
  check(rows.length === 9, "raw SQLite stores inventory and three equipment rows");
  check(rows.some((row) => row.item_id === "rat-tail" && row.locked === 1 && row.quantity === 9_999), "raw SQLite stores locked stack data");
  check(rows.some((row) => row.item_id === "emberheart-amulet" && row.tier === 3), "raw SQLite stores legendary T3 data");
  check(rows.filter((row) => row.equipment_slot !== null).map((row) => row.equipment_slot).sort().join("|") === "armor|offhand|weapon", "raw SQLite stores equipment slots");

  const removedWeapon = character.equipment.weapon;
  character = { ...character, equipment: { ...character.equipment, weapon: undefined } };
  state.characters = state.characters.map((entry) => entry.id === character.id ? character : entry);
  await saveGameState(db, state);
  state = requireState(await loadGameState(db), "weapon removal reload");
  character = state.characters.find((entry) => entry.id === fixtureCharacter.id)!;
  check(!character.equipment.weapon, "weapon removal survives save/reload");
  const equipmentRows = await db.select<Array<{ equipment_slot: string | null }>>("SELECT equipment_slot FROM inventory_items WHERE character_id = $1", [character.id]);
  check(!equipmentRows.some((row) => row.equipment_slot === "weapon"), "raw SQLite removes weapon slot row");

  character = { ...character, equipment: { ...character.equipment, weapon: removedWeapon } };
  state.characters = state.characters.map((entry) => entry.id === character.id ? character : entry);
  await saveGameState(db, state);
  state = requireState(await loadGameState(db), "restored equipment reload");
  character = state.characters.find((entry) => entry.id === fixtureCharacter.id)!;
  check(character.equipment.weapon?.id === removedWeapon?.id, "weapon restores for visual QA after save/reload");
  check(JSON.stringify({ guild: state.guild, depot: state.depot, logs: state.logs }) === baseline, "QA preserves guild, depot and activity log");

  await db.execute("CREATE TABLE IF NOT EXISTS stage1745_report (kind TEXT NOT NULL, report_json TEXT NOT NULL)");
  await db.execute("DELETE FROM stage1745_report");
  await db.execute("INSERT INTO stage1745_report VALUES ('database', $1)", [JSON.stringify(report)]);
  return { character, report };
}

function createInventoryFixture(character: Character): Character {
  const ownerId = character.id;
  const inventory: InventoryItem[] = [
    createInventoryItem("worn-sword", 1, "character", ownerId),
    createInventoryItem("iron-longsword", 1, "character", ownerId),
    createInventoryItem("cryptsteel-blade", 1, "character", ownerId),
    createInventoryItem("ember-blade", 1, "character", ownerId),
    { ...createInventoryItem("emberheart-amulet", 1, "character", ownerId), tier: 3 },
    { ...createInventoryItem("rat-tail", 9_999, "character", ownerId), locked: true },
  ];
  return {
    ...character,
    inventory,
    equipment: {
      weapon: createInventoryItem("worn-sword", 1, "character", ownerId),
      offhand: createInventoryItem("wooden-shield", 1, "character", ownerId),
      armor: createInventoryItem("leather-armor", 1, "character", ownerId),
    },
  };
}

function requireState(state: GameStateSnapshot | null, label: string) {
  if (!state) throw new Error(`${label}: saved state was not found`);
  return state;
}
