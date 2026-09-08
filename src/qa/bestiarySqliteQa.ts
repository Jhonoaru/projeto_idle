import Database from "@tauri-apps/plugin-sql";
import { monsters } from "../data/monsters";
import { runMigrations } from "../database/migrations";
import { createInitialGameState, loadGameState, saveGameState, type GameStateSnapshot } from "../database/saveGameRepository";
import { addMonsterKillsToBestiary } from "../game-engine/bestiary/addMonsterKillsToBestiary";
import { assignCharmToMonster } from "../game-engine/bestiary/assignCharmToMonster";
import { claimBestiaryReward } from "../game-engine/bestiary/claimBestiaryReward";
import { unlockCharm } from "../game-engine/bestiary/unlockCharm";
import type { Character, Guild, Monster } from "../shared/types";

const QA_DATABASE = "sqlite:stage1775_20260908.db";
const sewerRat = monsters.sewerRat;
const caveSpider = monsters.caveSpider;
const dragonWhelp = monsters.dragonWhelp;

export interface Stage1775QaResult { character: Character; guild: Guild; report: string[]; }

export async function runStage1775Qa(): Promise<Stage1775QaResult> {
  const db = await Database.load(QA_DATABASE);
  try { await runMigrations(db); return await runChecks(db); } finally { await db.close(); }
}

export async function saveStage1775RuntimeReport(report: string[]) {
  const db = await Database.load(QA_DATABASE);
  try {
    await db.execute("CREATE TABLE IF NOT EXISTS stage1775_report (kind TEXT NOT NULL, report_json TEXT NOT NULL)");
    await db.execute("DELETE FROM stage1775_report WHERE kind = 'runtime'");
    await db.execute("INSERT INTO stage1775_report VALUES ('runtime', $1)", [JSON.stringify(report)]);
  } finally { await db.close(); }
}

async function runChecks(db: Database): Promise<Stage1775QaResult> {
  const report: string[] = [];
  const check = (ok: unknown, label: string) => { if (!ok) throw new Error(`FAIL after ${report.length} checks: ${label}`); report.push(`PASS ${label}`); };
  const addKills = (guild: Guild, monster: Monster, kills: number) => {
    const result = addMonsterKillsToBestiary(guild.bestiary, [{ monsterId: monster.id, monsterName: monster.name, kills }]);
    return { ...guild, bestiary: result.bestiary };
  };

  check(db.path === QA_DATABASE, "isolated Tauri SQL database");
  let state = structuredClone(createInitialGameState());
  state.guild = addKills(state.guild, sewerRat, 10);
  state.guild = addKills(state.guild, caveSpider, 24);
  check(state.guild.bestiary?.progress.find((entry) => entry.monsterId === caveSpider.id)?.stage === "started", "Cave Spider remains tracked before its reveal threshold");
  state.guild = addKills(state.guild, caveSpider, 1);
  check(state.guild.bestiary?.progress.find((entry) => entry.monsterId === caveSpider.id)?.stage === "revealed", "Cave Spider reveals exactly at 25 kills");
  state.guild = addKills(state.guild, dragonWhelp, 1_000);
  const completedDragon = state.guild.bestiary?.progress.find((entry) => entry.monsterId === dragonWhelp.id);
  check(completedDragon?.stage === "completed" && completedDragon.charmPointsClaimed === false, "Dragon Whelp completion makes its charm reward available");
  const reward = claimBestiaryReward(state.guild.bestiary, dragonWhelp.id);
  state.guild = { ...state.guild, bestiary: reward.bestiary };
  check(state.guild.bestiary?.charmPoints === 35 && state.guild.bestiary.progress.find((entry) => entry.monsterId === dragonWhelp.id)?.charmPointsClaimed, "completed reward grants 35 charm points once");
  checkThrows(() => claimBestiaryReward(state.guild.bestiary, dragonWhelp.id), "duplicate completed reward is rejected");
  const unlocked = unlockCharm(state.guild.bestiary, "charm-scavenger");
  state.guild = { ...state.guild, bestiary: unlocked.bestiary };
  check(state.guild.bestiary?.charmPoints === 0 && state.guild.bestiary.unlockedCharmIds.includes("charm-scavenger"), "Scavenger charm unlock spends the earned points");
  const assigned = assignCharmToMonster(state.guild.bestiary, "charm-scavenger", dragonWhelp.id);
  state.guild = { ...state.guild, bestiary: assigned.bestiary };
  check(state.guild.bestiary?.activeCharms.some((entry) => entry.charmId === "charm-scavenger" && entry.monsterId === dragonWhelp.id), "unlocked charm assigns to a completed creature");

  await saveGameState(db, state);
  state = requireState(await loadGameState(db), "fixture reload");
  const bestiary = state.guild.bestiary!;
  check(bestiary.progress.length === 3 && bestiary.progress.find((entry) => entry.monsterId === sewerRat.id)?.stage === "started", "three Bestiary stages survive SQL reload");
  check(bestiary.progress.find((entry) => entry.monsterId === caveSpider.id)?.stage === "revealed", "revealed loot state survives SQL reload");
  check(bestiary.activeCharms.length === 1 && bestiary.activeCharms[0].monsterId === dragonWhelp.id, "active charm assignment survives SQL reload");
  const raw = await db.select<Array<{ bestiary_json: string }>>("SELECT bestiary_json FROM guilds LIMIT 1");
  const persisted = JSON.parse(raw[0].bestiary_json);
  check(persisted.progress.length === 3 && persisted.unlockedCharmIds[0] === "charm-scavenger", "raw SQLite stores progress and unlocked charm");
  check(persisted.activeCharms[0]?.monsterId === dragonWhelp.id && persisted.progress.find((entry: { monsterId: string }) => entry.monsterId === dragonWhelp.id)?.charmPointsClaimed, "raw SQLite stores reward claim and assignment");
  const validState = structuredClone(state);
  await db.execute("UPDATE guilds SET bestiary_json = $1", [JSON.stringify({ progress: [null, { monsterId: dragonWhelp.id, monsterName: dragonWhelp.name, kills: -1 }], charmPoints: "NaN", unlockedCharmIds: ["charm-scavenger", "charm-scavenger"], activeCharms: [{ charmId: "charm-scavenger", monsterId: dragonWhelp.id }] })]);
  const recovered = requireState(await loadGameState(db), "corrupt Bestiary recovery");
  check(recovered.guild.bestiary?.progress.length === 1 && recovered.guild.bestiary.progress[0].kills === 0 && recovered.guild.bestiary.charmPoints === 0 && recovered.guild.bestiary.activeCharms.length === 0, "corrupt Bestiary JSON normalizes safely");
  await saveGameState(db, validState);
  state = requireState(await loadGameState(db), "visual fixture restore");
  check(state.guild.bestiary?.progress.find((entry) => entry.monsterId === dragonWhelp.id)?.kills === 1_000, "valid completed fixture is restored for WebView QA");
  await db.execute("CREATE TABLE IF NOT EXISTS stage1775_report (kind TEXT NOT NULL, report_json TEXT NOT NULL)");
  await db.execute("DELETE FROM stage1775_report WHERE kind = 'database'");
  await db.execute("INSERT INTO stage1775_report VALUES ('database', $1)", [JSON.stringify(report)]);
  return { character: state.characters[0], guild: state.guild, report };
}

function checkThrows(action: () => unknown, label: string) {
  try { action(); } catch { return; }
  throw new Error(`Expected rejection: ${label}`);
}

function requireState(state: GameStateSnapshot | null, label: string) {
  if (!state) throw new Error(`${label}: saved state was not found`);
  return state;
}
