import Database from "@tauri-apps/plugin-sql";
import { runMigrations } from "../database/migrations";
import { createInitialGameState, loadGameState, saveGameState, type GameStateSnapshot } from "../database/saveGameRepository";
import { bosses } from "../data/bosses";
import { hunts } from "../data/hunts";
import { buildCombatFloatingFeedback, type CombatFloatingFeedbackActor } from "../game-engine/combat-feedback/buildCombatFloatingFeedback";
import type { BossParty, Character, PartyRole, Vocation } from "../shared/types";

const QA_DATABASE = "sqlite:stage1725_20260906.db";
const completedAt = "2026-09-06T12:00:00.000Z";
const expectedVocations: Vocation[] = ["Guardian", "Ranger", "Arcanist", "Warden", "Monk"];
const roles: PartyRole[] = ["tank", "damage", "damage", "healer", "support"];
export const stage1725Hunt = hunts[0];
export const stage1725Boss = bosses.find((boss) => boss.id === "boss-ember-matriarch")!;

export interface Stage1725QaResult {
  bossState: GameStateSnapshot;
  huntState: GameStateSnapshot;
  party: BossParty;
  report: string[];
}

export async function runStage1725Qa(): Promise<Stage1725QaResult> {
  const db = await Database.load(QA_DATABASE);
  try {
    await runMigrations(db);
    return await runChecks(db);
  } finally {
    await db.close();
  }
}

export async function saveStage1725RuntimeReport(report: string[]) {
  const db = await Database.load(QA_DATABASE);
  try {
    await db.execute("CREATE TABLE IF NOT EXISTS stage1725_report (kind TEXT NOT NULL, report_json TEXT NOT NULL)");
    await db.execute("DELETE FROM stage1725_report WHERE kind = 'runtime'");
    await db.execute("INSERT INTO stage1725_report VALUES ('runtime', $1)", [JSON.stringify(report)]);
  } finally {
    await db.close();
  }
}

async function runChecks(db: Database): Promise<Stage1725QaResult> {
  const report: string[] = [];
  const check = (ok: unknown, label: string) => {
    if (!ok) throw new Error(`FAIL after ${report.length} checks: ${label}`);
    report.push(`PASS ${label}`);
  };

  check(db.path === QA_DATABASE, "isolated Tauri SQL database");
  check(Boolean(stage1725Hunt && stage1725Boss), "production hunt and boss are available");
  let state = structuredClone(createInitialGameState());
  await saveGameState(db, state);
  state = requireState(await loadGameState(db), "initial reload");
  const baseline = JSON.stringify({ guild: state.guild, depot: state.depot, logs: state.logs });
  const baselineCharacters = JSON.stringify(state.characters.map(({ attributes, inventory, characterDepot, equipment, bossCooldowns }) => ({ attributes, inventory, characterDepot, equipment, bossCooldowns })));
  check(state.characters.map((character) => character.vocation).join("|") === expectedVocations.join("|"), "all five production vocations available");

  const huntStart = Date.now() - 6_600;
  state.characters = state.characters.map((character) => withActiveHunt(character, huntStart));
  await saveGameState(db, state);
  state = requireState(await loadGameState(db), "active hunts reload");
  const huntState = structuredClone(state);
  const rawHunts = await db.select<Array<{ vocation: Vocation; status: string; current_action_json: string | null }>>(
    "SELECT vocation, status, current_action_json FROM characters ORDER BY id",
  );
  check(rawHunts.length === 5, "five active hunt rows stored");

  for (const vocation of expectedVocations) {
    const character = state.characters.find((entry) => entry.vocation === vocation)!;
    const raw = rawHunts.find((entry) => entry.vocation === vocation);
    const rawAction = raw?.current_action_json ? JSON.parse(raw.current_action_json) : undefined;
    check(character.status === "hunting" && character.currentAction?.type === "hunting", `${vocation}: active hunt survives SQL reload`);
    check(raw?.status === "hunting" && rawAction?.targetId === stage1725Hunt.id && rawAction?.readyToResolve !== true, `${vocation}: raw SQLite contains active hunt`);
    const actors: CombatFloatingFeedbackActor[] = [{ character }];
    const events = buildCombatFloatingFeedback({ actors, elapsedMs: 1_800, mode: "hunt", resolved: false, target: { x: 90, y: 10 } });
    check(events.some((event) => event.kind === "incoming") && events.every((event) => event.value > 0), `${vocation}: active hunt emits positive outgoing and incoming values`);
    check(events.every((event) => event.x >= 4 && event.x <= 96 && event.y >= 4 && event.y <= 96), `${vocation}: floating coordinates stay inside the combat stage`);
    check(findCriticalElapsed(actors, "hunt") >= 0, `${vocation}: deterministic hunt cadence includes a critical hit`);
  }
  const warden = state.characters.find((character) => character.vocation === "Warden")!;
  check(buildCombatFloatingFeedback({ actors: [{ character: warden }], elapsedMs: 0, mode: "hunt", resolved: false, target: { x: 50, y: 50 } }).some((event) => event.kind === "healing"), "Warden hunt emits healing feedback");

  state.characters = state.characters.map(withCompletedAction);
  await saveGameState(db, state);
  state = requireState(await loadGameState(db), "completed hunts reload");
  for (const vocation of expectedVocations) {
    const character = state.characters.find((entry) => entry.vocation === vocation)!;
    check(character.currentAction?.readyToResolve === true && character.currentAction.offlineCompletedAt === completedAt, `${vocation}: completed hunt survives SQL reload`);
    check(buildCombatFloatingFeedback({ actors: [{ character }], elapsedMs: 1_800, mode: "hunt", resolved: true, target: { x: 50, y: 50 } }).length === 0, `${vocation}: completed hunt suppresses floating feedback`);
  }

  const party = createParty(huntState.characters);
  const bossStart = Date.now() - 6_600;
  state = structuredClone(huntState);
  state.characters = state.characters.map((character) => withActiveBoss(character, party, bossStart));
  await saveGameState(db, state);
  state = requireState(await loadGameState(db), "active raid reload");
  const bossState = structuredClone(state);
  const rawBosses = await db.select<Array<{ vocation: Vocation; status: string; current_action_json: string | null }>>(
    "SELECT vocation, status, current_action_json FROM characters ORDER BY id",
  );
  const actors = party.members.map((member) => ({
    character: state.characters.find((character) => character.id === member.characterId)!,
    role: member.role,
  }));
  for (const vocation of expectedVocations) {
    const character = state.characters.find((entry) => entry.vocation === vocation)!;
    const raw = rawBosses.find((entry) => entry.vocation === vocation);
    const rawAction = raw?.current_action_json ? JSON.parse(raw.current_action_json) : undefined;
    check(character.status === "bossing" && character.currentAction?.partyMembers?.length === 5, `${vocation}: active raid party survives SQL reload`);
    check(raw?.status === "bossing" && rawAction?.targetId === stage1725Boss.id && rawAction?.partyMembers?.length === 5, `${vocation}: raw SQLite contains five-member raid`);
  }
  const bossEvents = buildCombatFloatingFeedback({ actors, elapsedMs: 6_600, mode: "boss", resolved: false, target: { x: 76, y: 43 } });
  check(bossEvents.some((event) => event.kind === "incoming"), "boss cadence emits incoming damage");
  check(bossEvents.some((event) => event.kind === "healing"), "boss party roles emit healing feedback");
  check(findCriticalElapsed(actors, "boss") >= 0, "boss cadence includes a deterministic critical hit");

  state.characters = state.characters.map(withCompletedAction);
  await saveGameState(db, state);
  state = requireState(await loadGameState(db), "completed raid reload");
  check(state.characters.every((character) => character.currentAction?.readyToResolve === true), "completed five-member raid survives SQL reload");
  check(buildCombatFloatingFeedback({ actors, elapsedMs: 6_600, mode: "boss", resolved: true, target: { x: 76, y: 43 } }).length === 0, "completed raid suppresses floating feedback");

  await saveGameState(db, bossState);
  state = requireState(await loadGameState(db), "restored active raid");
  check(state.characters.every((character) => character.status === "bossing" && character.currentAction?.readyToResolve !== true), "active raid restored for visual QA");
  check(JSON.stringify({ guild: state.guild, depot: state.depot, logs: state.logs }) === baseline, "QA preserves guild, depot and activity log");
  check(JSON.stringify(state.characters.map(({ attributes, inventory, characterDepot, equipment, bossCooldowns }) => ({ attributes, inventory, characterDepot, equipment, bossCooldowns }))) === baselineCharacters, "QA preserves character power, items and cooldowns");

  await db.execute("CREATE TABLE IF NOT EXISTS stage1725_report (kind TEXT NOT NULL, report_json TEXT NOT NULL)");
  await db.execute("DELETE FROM stage1725_report");
  await db.execute("INSERT INTO stage1725_report VALUES ('database', $1)", [JSON.stringify(report)]);
  return { bossState: state, huntState, party, report };
}

export function findCriticalElapsed(actors: CombatFloatingFeedbackActor[], mode: "hunt" | "boss") {
  const interval = mode === "boss" ? 2_200 : 1_800;
  for (let sequence = 0; sequence < 30; sequence += 1) {
    const events = buildCombatFloatingFeedback({ actors, elapsedMs: sequence * interval, mode, resolved: false, target: { x: 76, y: 43 } });
    if (events.some((event) => event.kind === "critical")) return sequence * interval;
  }
  return -1;
}

function createParty(characters: Character[]): BossParty {
  return { bossId: stage1725Boss.id, members: characters.map((character, index) => ({ characterId: character.id, role: roles[index] })) };
}

function withActiveHunt(character: Character, startedAt: number): Character {
  return { ...character, status: "hunting", currentAction: { type: "hunting", label: `Hunting ${stage1725Hunt.name}`, startedAt: new Date(startedAt).toISOString(), endsAt: new Date(startedAt + 300_000).toISOString(), durationMinutes: 5, targetId: stage1725Hunt.id, targetName: stage1725Hunt.name, risk: stage1725Hunt.risk } };
}

function withActiveBoss(character: Character, party: BossParty, startedAt: number): Character {
  return { ...character, status: "bossing", currentAction: { type: "bossing", label: stage1725Boss.name, startedAt: new Date(startedAt).toISOString(), endsAt: new Date(startedAt + 300_000).toISOString(), durationMinutes: 5, targetId: stage1725Boss.id, targetName: stage1725Boss.name, risk: stage1725Boss.risk, expectedXp: stage1725Boss.reward.experience, expectedGold: stage1725Boss.reward.goldMax, cost: stage1725Boss.entryCost, partyMemberIds: party.members.map((member) => member.characterId), partyMembers: party.members, bossManualReactions: [] } };
}

function withCompletedAction(character: Character): Character {
  return { ...character, currentAction: character.currentAction ? { ...character.currentAction, endsAt: completedAt, offlineCompletedAt: completedAt, readyToResolve: true } : undefined };
}

function requireState(state: GameStateSnapshot | null, label: string) {
  if (!state) throw new Error(`${label}: saved state was not found`);
  return state;
}
