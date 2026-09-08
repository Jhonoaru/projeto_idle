import Database from "@tauri-apps/plugin-sql";
import { createInventoryItem } from "../data/inventoryFactory";
import { runMigrations } from "../database/migrations";
import { createInitialGameState, loadGameState, saveGameState, type GameStateSnapshot } from "../database/saveGameRepository";
import type { Character } from "../shared/types";

const QA_DATABASE = "sqlite:stage1755_20260907.db";

export interface Stage1755QaResult {
  character: Character;
  report: string[];
}

export async function runStage1755Qa(): Promise<Stage1755QaResult> {
  const db = await Database.load(QA_DATABASE);
  try {
    await runMigrations(db);
    return await runChecks(db);
  } finally {
    await db.close();
  }
}

export async function saveStage1755RuntimeReport(report: string[]) {
  const db = await Database.load(QA_DATABASE);
  try {
    await db.execute("CREATE TABLE IF NOT EXISTS stage1755_report (kind TEXT NOT NULL, report_json TEXT NOT NULL)");
    await db.execute("DELETE FROM stage1755_report WHERE kind = 'runtime'");
    await db.execute("INSERT INTO stage1755_report VALUES ('runtime', $1)", [JSON.stringify(report)]);
  } finally {
    await db.close();
  }
}

async function runChecks(db: Database): Promise<Stage1755QaResult> {
  const report: string[] = [];
  const check = (ok: unknown, label: string) => {
    if (!ok) throw new Error(`FAIL after ${report.length} checks: ${label}`);
    report.push(`PASS ${label}`);
  };

  check(db.path === QA_DATABASE, "isolated Tauri SQL database");
  let state = structuredClone(createInitialGameState());
  const fixture = createLoadoutFixture(state.characters[0]);
  state.characters = state.characters.map((character) => character.id === fixture.id ? fixture : character);
  await saveGameState(db, state);
  state = requireState(await loadGameState(db), "fixture reload");
  const baseline = JSON.stringify({ guild: state.guild, depot: state.depot, logs: state.logs });
  let character = state.characters.find((entry) => entry.id === fixture.id)!;

  check(Object.values(character.equipment).filter(Boolean).length === 3, "three visual loadout pieces survive save/reload");
  check(character.equipment.weapon?.item.id === "cryptsteel-blade", "rare weapon survives save/reload");
  check(character.equipment.offhand?.item.id === "brass-shield", "uncommon offhand survives save/reload");
  check(character.equipment.armor?.item.id === "dragonscale-armor", "epic armor survives save/reload");
  check(character.equipment.weapon?.tier === 2 && character.equipment.offhand?.tier === 1 && character.equipment.armor?.tier === 3, "loadout tiers survive save/reload");

  let rows = await db.select<Array<{ item_id: string; equipment_slot: string | null; tier: number; upgrade_level: number }>>(
    "SELECT item_id, equipment_slot, tier, upgrade_level FROM inventory_items WHERE character_id = $1 ORDER BY equipment_slot",
    [character.id],
  );
  check(rows.length === 3, "raw SQLite stores only the three equipped fixture rows");
  check(rows.map((row) => `${row.equipment_slot}:${row.item_id}:${row.tier}`).sort().join("|") === "armor:dragonscale-armor:3|offhand:brass-shield:1|weapon:cryptsteel-blade:2", "raw SQLite preserves slots, item IDs and tiers");
  check(rows.every((row) => row.upgrade_level > 0), "raw SQLite preserves upgraded visual equipment");

  const offhand = character.equipment.offhand;
  character = { ...character, equipment: { ...character.equipment, offhand: undefined } };
  state.characters = state.characters.map((entry) => entry.id === character.id ? character : entry);
  await saveGameState(db, state);
  state = requireState(await loadGameState(db), "offhand removal reload");
  character = state.characters.find((entry) => entry.id === fixture.id)!;
  check(!character.equipment.offhand, "offhand removal survives save/reload");
  const equipmentRows = await db.select<Array<{ equipment_slot: string | null }>>("SELECT equipment_slot FROM inventory_items WHERE character_id = $1", [character.id]);
  check(!equipmentRows.some((row) => row.equipment_slot === "offhand"), "raw SQLite removes offhand row");

  character = { ...character, equipment: { ...character.equipment, offhand } };
  state.characters = state.characters.map((entry) => entry.id === character.id ? character : entry);
  await saveGameState(db, state);
  state = requireState(await loadGameState(db), "offhand restoration reload");
  character = state.characters.find((entry) => entry.id === fixture.id)!;
  check(character.equipment.offhand?.id === offhand?.id, "offhand restores for visual WebView QA");
  check(JSON.stringify({ guild: state.guild, depot: state.depot, logs: state.logs }) === baseline, "QA preserves guild, depot and activity log");

  await db.execute("CREATE TABLE IF NOT EXISTS stage1755_report (kind TEXT NOT NULL, report_json TEXT NOT NULL)");
  await db.execute("DELETE FROM stage1755_report");
  await db.execute("INSERT INTO stage1755_report VALUES ('database', $1)", [JSON.stringify(report)]);
  return { character, report };
}

function createLoadoutFixture(character: Character): Character {
  const ownerId = character.id;
  return {
    ...character,
    inventory: [],
    equipment: {
      weapon: { ...createInventoryItem("cryptsteel-blade", 1, "character", ownerId), tier: 2, upgradeLevel: 3 },
      offhand: { ...createInventoryItem("brass-shield", 1, "character", ownerId), tier: 1, upgradeLevel: 2 },
      armor: { ...createInventoryItem("dragonscale-armor", 1, "character", ownerId), tier: 3, upgradeLevel: 4 },
    },
  };
}

function requireState(state: GameStateSnapshot | null, label: string) {
  if (!state) throw new Error(`${label}: saved state was not found`);
  return state;
}
