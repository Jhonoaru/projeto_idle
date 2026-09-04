import Database from "@tauri-apps/plugin-sql";
import { runMigrations } from "../database/migrations";
import { createInitialGameState, loadGameState, saveGameState, type GameStateSnapshot } from "../database/saveGameRepository";
import { getCharacterSprite } from "../data/characterSprites";
import { getCreatureSprite } from "../data/creatureSprites";
import { hunts } from "../data/hunts";
import { getHuntActorMotionPhase, getHuntCreatureMotionPhase, getHuntMotionVector } from "../game-engine/hunt-scene/getHuntMotionState";
import type { Character, Vocation } from "../shared/types";

const QA_DATABASE = "sqlite:stage1705_20260904.db";
const expectedVocations: Vocation[] = ["Guardian", "Ranger", "Arcanist", "Warden", "Monk"];

export interface Stage1705QaResult {
  report: string[];
  state: GameStateSnapshot;
}

export async function runStage1705Qa(): Promise<Stage1705QaResult> {
  const db = await Database.load(QA_DATABASE);
  try {
    await runMigrations(db);
    return await runChecks(db);
  } finally {
    await db.close();
  }
}

export async function saveStage1705RuntimeReport(report: string[]) {
  const db = await Database.load(QA_DATABASE);
  try {
    await db.execute("CREATE TABLE IF NOT EXISTS stage1705_report (kind TEXT NOT NULL, report_json TEXT NOT NULL)");
    await db.execute("DELETE FROM stage1705_report WHERE kind = 'runtime'");
    await db.execute("INSERT INTO stage1705_report VALUES ('runtime', $1)", [JSON.stringify(report)]);
  } finally {
    await db.close();
  }
}

async function runChecks(db: Database): Promise<Stage1705QaResult> {
  const report: string[] = [];
  const check = (ok: unknown, label: string) => {
    if (!ok) throw new Error(`FAIL after ${report.length} checks: ${label}`);
    report.push(`PASS ${label}`);
  };

  check(db.path === QA_DATABASE, "isolated Tauri SQL database");
  let state = structuredClone(createInitialGameState());
  await saveGameState(db, state);
  state = requireState(await loadGameState(db), "initial reload");
  const baseline = JSON.stringify({ guild: state.guild, depot: state.depot, logs: state.logs });
  const baselineCharacters = JSON.stringify(state.characters.map(({ attributes, inventory, characterDepot, equipment }) => ({ attributes, inventory, characterDepot, equipment })));
  check(state.characters.map((character) => character.vocation).join("|") === expectedVocations.join("|"), "all five production vocations available");

  const actionStart = Date.now() - 30_000;
  state.characters = state.characters.map((character) => withActiveHunt(character, actionStart));
  await saveGameState(db, state);
  state = requireState(await loadGameState(db), "active hunts reload");
  const activeState = structuredClone(state);

  const rawActiveRows = await db.select<Array<{ id: string; vocation: Vocation; status: string; current_action_json: string | null }>>(
    "SELECT id, vocation, status, current_action_json FROM characters ORDER BY id",
  );
  check(rawActiveRows.length === expectedVocations.length, "five active character rows stored");

  for (const vocation of expectedVocations) {
    const character = state.characters.find((entry) => entry.vocation === vocation);
    check(character?.status === "hunting" && character.currentAction?.type === "hunting", `${vocation}: active hunt survives SQL reload`);
    check(character?.currentAction?.targetId === hunts[0].id && character.currentAction.durationMinutes === 5, `${vocation}: hunt target and duration persist`);
    const raw = rawActiveRows.find((row) => row.vocation === vocation);
    const rawAction = raw?.current_action_json ? JSON.parse(raw.current_action_json) : undefined;
    check(raw?.status === "hunting" && rawAction?.targetId === hunts[0].id && rawAction?.readyToResolve !== true, `${vocation}: raw SQLite contains active action`);
    const sprite = getCharacterSprite(character?.id);
    const response = await fetch(sprite?.src ?? "/qa/missing-character.png");
    const bytes = await response.arrayBuffer();
    check(response.ok && response.headers.get("content-type")?.includes("image/png") && bytes.byteLength > 10_000, `${vocation}: local hero PNG loads inside Tauri`);
  }

  const creatureSprite = getCreatureSprite(hunts[0].monsters[0].id);
  const creatureResponse = await fetch(creatureSprite?.src ?? "/qa/missing-creature.png");
  const creatureBytes = await creatureResponse.arrayBuffer();
  check(creatureResponse.ok && creatureResponse.headers.get("content-type")?.includes("image/png") && creatureBytes.byteLength > 10_000, "hunt creature PNG loads inside Tauri");

  check(getHuntActorMotionPhase(0.1, false) === "windup", "actor windup phase resolves in Tauri");
  check(getHuntActorMotionPhase(0.4, false) === "striking", "actor striking phase resolves in Tauri");
  check(getHuntActorMotionPhase(0.68, false) === "recoiling", "actor recoil phase resolves in Tauri");
  check(getHuntActorMotionPhase(0.9, false) === "recovering", "actor recovery phase resolves in Tauri");
  check(getHuntActorMotionPhase(0.2, true) === "resolved", "actor resolved phase overrides progress");
  check(getHuntCreatureMotionPhase("spawning", true, 0.4) === "spawning", "spawn phase overrides active combat");
  check(getHuntCreatureMotionPhase("defeated", true, 0.4) === "defeated", "defeated phase overrides active combat");

  for (const position of ["top-left", "top-right", "left", "right", "bottom-left", "bottom-right"]) {
    const actor = getHuntMotionVector(position, "actor");
    const creature = getHuntMotionVector(position, "creature");
    check(actor.x === -creature.x && actor.y === -creature.y, `${position}: actor and creature vectors converge`);
  }

  state.characters = state.characters.map(withCompletedHunt);
  await saveGameState(db, state);
  state = requireState(await loadGameState(db), "completed hunts reload");
  const rawCompletedRows = await db.select<Array<{ vocation: Vocation; current_action_json: string | null }>>(
    "SELECT vocation, current_action_json FROM characters ORDER BY id",
  );
  for (const vocation of expectedVocations) {
    const character = state.characters.find((entry) => entry.vocation === vocation);
    check(character?.currentAction?.readyToResolve === true && character.currentAction.offlineCompletedAt === "2026-09-04T12:00:00.000Z", `${vocation}: completed state survives SQL reload`);
    const raw = rawCompletedRows.find((row) => row.vocation === vocation);
    const rawAction = raw?.current_action_json ? JSON.parse(raw.current_action_json) : undefined;
    check(rawAction?.readyToResolve === true && rawAction?.offlineCompletedAt === "2026-09-04T12:00:00.000Z", `${vocation}: raw SQLite contains completed state`);
  }

  await saveGameState(db, activeState);
  state = requireState(await loadGameState(db), "restored active state");
  check(state.characters.every((character) => character.status === "hunting" && character.currentAction?.readyToResolve !== true), "all five active hunts restored for visual QA");
  check(JSON.stringify({ guild: state.guild, depot: state.depot, logs: state.logs }) === baseline, "QA preserves guild, depot and activity log");
  check(JSON.stringify(state.characters.map(({ attributes, inventory, characterDepot, equipment }) => ({ attributes, inventory, characterDepot, equipment }))) === baselineCharacters, "QA preserves character power and items");

  await db.execute("CREATE TABLE IF NOT EXISTS stage1705_report (kind TEXT NOT NULL, report_json TEXT NOT NULL)");
  await db.execute("DELETE FROM stage1705_report");
  await db.execute("INSERT INTO stage1705_report VALUES ('database', $1)", [JSON.stringify(report)]);
  return { report, state };
}

function withActiveHunt(character: Character, startedAt: number): Character {
  return {
    ...character,
    status: "hunting",
    currentAction: {
      type: "hunting",
      label: `Hunting ${hunts[0].name}`,
      startedAt: new Date(startedAt).toISOString(),
      endsAt: new Date(startedAt + 300_000).toISOString(),
      durationMinutes: 5,
      targetId: hunts[0].id,
      targetName: hunts[0].name,
      risk: hunts[0].risk,
    },
  };
}

function withCompletedHunt(character: Character): Character {
  return {
    ...character,
    status: "hunting",
    currentAction: character.currentAction ? {
      ...character.currentAction,
      endsAt: "2026-09-04T12:00:00.000Z",
      offlineCompletedAt: "2026-09-04T12:00:00.000Z",
      readyToResolve: true,
    } : undefined,
  };
}

function requireState(state: GameStateSnapshot | null, label: string) {
  if (!state) throw new Error(`${label}: saved state was not found`);
  return state;
}
