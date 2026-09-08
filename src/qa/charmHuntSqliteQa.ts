import Database from "@tauri-apps/plugin-sql";
import { hunts } from "../data/hunts";
import { runMigrations } from "../database/migrations";
import { createInitialGameState, loadGameState, saveGameState, type GameStateSnapshot } from "../database/saveGameRepository";
import { assignCharmToMonster } from "../game-engine/bestiary/assignCharmToMonster";
import { calculateCharmBonusesForHunt } from "../game-engine/bestiary/calculateCharmBonusesForHunt";
import { unlockCharm } from "../game-engine/bestiary/unlockCharm";
import { finishHunt, startHunt } from "../game-services/huntService";
import type { Character, Guild } from "../shared/types";

const QA_DATABASE = "sqlite:stage1785_20260908.db";
export const stage1785Hunt = hunts.find((hunt) => hunt.id === "hunt-sewers-thaeron")!;
const durationMinutes = 30;

export interface Stage1785QaResult { character: Character; guild: Guild; report: string[]; }

export async function runStage1785Qa(): Promise<Stage1785QaResult> {
  const db = await Database.load(QA_DATABASE);
  try { await runMigrations(db); return await runChecks(db); } finally { await db.close(); }
}

export async function saveStage1785RuntimeReport(report: string[]) {
  const db = await Database.load(QA_DATABASE);
  try {
    await db.execute("CREATE TABLE IF NOT EXISTS stage1785_report (kind TEXT NOT NULL, report_json TEXT NOT NULL)");
    await db.execute("DELETE FROM stage1785_report WHERE kind = 'runtime'");
    await db.execute("INSERT INTO stage1785_report VALUES ('runtime', $1)", [JSON.stringify(report)]);
  } finally { await db.close(); }
}

async function runChecks(db: Database): Promise<Stage1785QaResult> {
  const report: string[] = [];
  const check = (ok: unknown, label: string) => { if (!ok) throw new Error(`FAIL after ${report.length} checks: ${label}`); report.push(`PASS ${label}`); };
  check(db.path === QA_DATABASE, "isolated Tauri SQL database");
  check(Boolean(stage1785Hunt), "production Sewer Rat hunt is available");

  let state = structuredClone(createInitialGameState());
  state.guild = {
    ...state.guild,
    bestiary: {
      charmPoints: 35,
      unlockedCharmIds: [],
      activeCharms: [],
      progress: [{ monsterId: "monster-sewer-rat", monsterName: "Sewer Rat", kills: 100, stage: "completed", charmPointsClaimed: true }],
    },
  };
  const unlocked = unlockCharm(state.guild.bestiary, "charm-scavenger");
  state.guild = { ...state.guild, bestiary: unlocked.bestiary };
  const assigned = assignCharmToMonster(state.guild.bestiary, "charm-scavenger", "monster-sewer-rat");
  state.guild = { ...state.guild, bestiary: assigned.bestiary };
  check(state.guild.bestiary?.activeCharms[0]?.charmId === "charm-scavenger", "Scavenger is assigned through the production engine");

  const baseCharacter = structuredClone(state.characters[0]);
  const baseline = finishHunt(startHunt(baseCharacter, stage1785Hunt, durationMinutes), stage1785Hunt, durationMinutes, state.guild.gold).result;
  const activeCharacter = startHunt(baseCharacter, stage1785Hunt, durationMinutes);
  state.characters = state.characters.map((character) => character.id === activeCharacter.id ? activeCharacter : character);
  await saveGameState(db, state);
  state = requireState(await loadGameState(db), "active charmed hunt reload");
  const character = state.characters.find((entry) => entry.id === activeCharacter.id)!;
  check(character.status === "hunting" && character.currentAction?.targetId === stage1785Hunt.id, "active charmed Hunt survives SQL reload");
  const bonuses = calculateCharmBonusesForHunt(state.guild.bestiary, stage1785Hunt);
  check(bonuses.lootMultiplier === 1.05 && bonuses.logs.length === 1, "Charm engine resolves the Sewer Rat loot multiplier");
  const rawBefore = await db.select<Array<{ bestiary_json: string }>>("SELECT bestiary_json FROM guilds LIMIT 1");
  const persistedBefore = JSON.parse(rawBefore[0].bestiary_json);
  check(persistedBefore.activeCharms[0]?.monsterId === "monster-sewer-rat" && persistedBefore.unlockedCharmIds.includes("charm-scavenger"), "raw SQLite persists the Charm assignment before resolution");

  const finished = finishHunt(character, stage1785Hunt, durationMinutes, state.guild.gold, state.guild.bestiary);
  const expectedLootValue = Math.round(baseline.totalLootValue * 1.05);
  check(finished.result.totalLootValue === expectedLootValue, "Scavenger applies exactly +5% to deterministic Hunt loot value");
  check((finished.result.charmBonusesApplied ?? []).length === 1 && finished.result.logs.some((entry) => entry.includes("Charm bonus applied: Scavenger")), "resolved Hunt result records the Charm bonus log");

  state.characters = state.characters.map((entry) => entry.id === character.id ? finished.character : entry);
  await saveGameState(db, state);
  state = requireState(await loadGameState(db), "resolved charmed hunt reload");
  check(state.characters.find((entry) => entry.id === character.id)?.status !== "hunting", "resolved Hunt character state survives SQL reload");
  check(state.guild.bestiary?.activeCharms[0]?.monsterId === "monster-sewer-rat", "Charm assignment remains after Hunt resolution");

  const visualState = structuredClone(state);
  const visualCharacter = startHunt(baseCharacter, stage1785Hunt, durationMinutes);
  visualState.characters = visualState.characters.map((entry) => entry.id === visualCharacter.id ? visualCharacter : entry);
  await saveGameState(db, visualState);
  state = requireState(await loadGameState(db), "visual active hunt restore");
  check(state.characters.find((entry) => entry.id === visualCharacter.id)?.status === "hunting", "active charmed fixture restored for WebView QA");
  await db.execute("CREATE TABLE IF NOT EXISTS stage1785_report (kind TEXT NOT NULL, report_json TEXT NOT NULL)");
  await db.execute("DELETE FROM stage1785_report WHERE kind = 'database'");
  await db.execute("INSERT INTO stage1785_report VALUES ('database', $1)", [JSON.stringify(report)]);
  return { character: state.characters.find((entry) => entry.id === visualCharacter.id)!, guild: state.guild, report };
}

function requireState(state: GameStateSnapshot | null, label: string) {
  if (!state) throw new Error(`${label}: saved state was not found`);
  return state;
}
