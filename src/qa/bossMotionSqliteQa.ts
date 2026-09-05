import Database from "@tauri-apps/plugin-sql";
import { runMigrations } from "../database/migrations";
import { createInitialGameState, loadGameState, saveGameState, type GameStateSnapshot } from "../database/saveGameRepository";
import { getBossSprite } from "../data/bossSprites";
import { bosses } from "../data/bosses";
import { getCharacterSprite } from "../data/characterSprites";
import { getBossAbilityCastState } from "../game-engine/boss/getBossAbilityCastState";
import { calculateBossPartyThreat } from "../game-engine/boss/calculateBossThreat";
import { getBossArenaBackgroundMeta } from "../game-engine/boss-scene/getBossArenaBackgroundMeta";
import { getBossMotionPhase, getBossPartyMotionPhase, getBossPartyMotionVector } from "../game-engine/boss-scene/getBossMotionState";
import type { BossParty, Character, PartyRole, Vocation } from "../shared/types";

const QA_DATABASE = "sqlite:stage1715_20260905.db";
const completedAt = "2026-09-05T12:00:00.000Z";
const expectedVocations: Vocation[] = ["Guardian", "Ranger", "Arcanist", "Warden", "Monk"];
const roles: PartyRole[] = ["tank", "damage", "damage", "healer", "support"];
export const stage1715Boss = bosses.find((boss) => boss.id === "boss-ember-matriarch")!;

export interface Stage1715QaResult {
  party: BossParty;
  report: string[];
  state: GameStateSnapshot;
}

export async function runStage1715Qa(): Promise<Stage1715QaResult> {
  const db = await Database.load(QA_DATABASE);
  try {
    await runMigrations(db);
    return await runChecks(db);
  } finally {
    await db.close();
  }
}

export async function saveStage1715RuntimeReport(report: string[]) {
  const db = await Database.load(QA_DATABASE);
  try {
    await db.execute("CREATE TABLE IF NOT EXISTS stage1715_report (kind TEXT NOT NULL, report_json TEXT NOT NULL)");
    await db.execute("DELETE FROM stage1715_report WHERE kind = 'runtime'");
    await db.execute("INSERT INTO stage1715_report VALUES ('runtime', $1)", [JSON.stringify(report)]);
  } finally {
    await db.close();
  }
}

async function runChecks(db: Database): Promise<Stage1715QaResult> {
  const report: string[] = [];
  const check = (ok: unknown, label: string) => {
    if (!ok) throw new Error(`FAIL after ${report.length} checks: ${label}`);
    report.push(`PASS ${label}`);
  };

  check(db.path === QA_DATABASE, "isolated Tauri SQL database");
  check(Boolean(stage1715Boss), "five-member production boss is available");
  let state = structuredClone(createInitialGameState());
  await saveGameState(db, state);
  state = requireState(await loadGameState(db), "initial reload");
  const baseline = JSON.stringify({ guild: state.guild, depot: state.depot, logs: state.logs });
  const baselineCharacters = JSON.stringify(state.characters.map(({ attributes, inventory, characterDepot, equipment, bossCooldowns }) => ({ attributes, inventory, characterDepot, equipment, bossCooldowns })));
  check(state.characters.map((character) => character.vocation).join("|") === expectedVocations.join("|"), "all five production vocations available");

  const party = createParty(state.characters);
  const actionStart = Date.now() - 8_200;
  state.characters = state.characters.map((character) => withActiveBoss(character, party, actionStart));
  await saveGameState(db, state);
  state = requireState(await loadGameState(db), "active raid reload");
  const activeState = structuredClone(state);
  const rawActiveRows = await db.select<Array<{ id: string; vocation: Vocation; status: string; current_action_json: string | null }>>(
    "SELECT id, vocation, status, current_action_json FROM characters ORDER BY id",
  );
  check(rawActiveRows.length === expectedVocations.length, "five active party rows stored");

  for (const vocation of expectedVocations) {
    const character = state.characters.find((entry) => entry.vocation === vocation);
    check(character?.status === "bossing" && character.currentAction?.type === "bossing", `${vocation}: active raid survives SQL reload`);
    check(character?.currentAction?.targetId === stage1715Boss.id && character.currentAction.durationMinutes === 5, `${vocation}: boss target and duration persist`);
    check(character?.currentAction?.partyMembers?.length === 5 && character.currentAction.partyMemberIds?.length === 5, `${vocation}: full party snapshot persists`);
    const raw = rawActiveRows.find((row) => row.vocation === vocation);
    const rawAction = raw?.current_action_json ? JSON.parse(raw.current_action_json) : undefined;
    check(raw?.status === "bossing" && rawAction?.targetId === stage1715Boss.id && rawAction?.partyMembers?.length === 5 && rawAction?.readyToResolve !== true, `${vocation}: raw SQLite contains active raid and party`);
    await checkLocalImage(getCharacterSprite(character?.id)?.src, `${vocation}: local hero PNG loads inside Tauri`, check);
  }

  await checkLocalImage(getBossSprite(stage1715Boss.id)?.src, "boss PNG loads inside Tauri", check);
  await checkLocalImage(getBossArenaBackgroundMeta(stage1715Boss).src, "boss arena JPG loads inside Tauri", check);

  const threat = calculateBossPartyThreat(state.characters, party, stage1715Boss);
  const telegraph = getBossAbilityCastState(threat, 9_000, false);
  check(telegraph.state === "telegraphing" && Boolean(telegraph.cast?.targetCharacterId), "controlled clock reaches a targeted boss telegraph");
  check(getBossMotionPhase({ cycleProgress: 0.1, ready: false, abilityState: "idle" }) === "guarding", "boss guard phase resolves in Tauri");
  check(getBossMotionPhase({ cycleProgress: 0.4, ready: false, abilityState: "idle" }) === "lunging", "boss lunge phase resolves in Tauri");
  check(getBossMotionPhase({ cycleProgress: 0.58, ready: false, abilityState: "idle" }) === "impacting", "boss impact phase resolves in Tauri");
  check(getBossMotionPhase({ cycleProgress: 0.8, ready: false, abilityState: "idle" }) === "recovering", "boss recovery phase resolves in Tauri");
  check(getBossMotionPhase({ cycleProgress: 0.2, ready: true, abilityState: "idle" }) === "defeated", "completed raid overrides boss motion");
  check(getBossPartyMotionPhase({ cycleProgress: 0.2, ready: false, abilityState: "telegraphing", memberIndex: 0, targeted: true, positioning: "mobile" }) === "dodging", "targeted mobile member dodges telegraph");
  check(getBossPartyMotionPhase({ cycleProgress: 0.2, ready: false, abilityState: "telegraphing", memberIndex: 0, targeted: true, positioning: "anchored" }) === "guarding", "targeted anchored member holds position");
  check(getBossPartyMotionPhase({ cycleProgress: 0.2, ready: true, abilityState: "idle", memberIndex: 0, targeted: false, positioning: "mobile" }) === "victorious", "completed raid overrides party motion");

  for (let index = 0; index < 5; index += 1) {
    const vector = getBossPartyMotionVector(index);
    check(vector.x > 0 && Math.abs(vector.y) <= 1, `party member ${index + 1}: vector converges toward boss`);
  }

  state.characters = state.characters.map(withCompletedBoss);
  await saveGameState(db, state);
  state = requireState(await loadGameState(db), "completed raid reload");
  const rawCompletedRows = await db.select<Array<{ vocation: Vocation; current_action_json: string | null }>>(
    "SELECT vocation, current_action_json FROM characters ORDER BY id",
  );
  for (const vocation of expectedVocations) {
    const character = state.characters.find((entry) => entry.vocation === vocation);
    check(character?.currentAction?.readyToResolve === true && character.currentAction.offlineCompletedAt === completedAt, `${vocation}: completed raid survives SQL reload`);
    const raw = rawCompletedRows.find((row) => row.vocation === vocation);
    const rawAction = raw?.current_action_json ? JSON.parse(raw.current_action_json) : undefined;
    check(rawAction?.readyToResolve === true && rawAction?.offlineCompletedAt === completedAt, `${vocation}: raw SQLite contains completed raid`);
  }

  await saveGameState(db, activeState);
  state = requireState(await loadGameState(db), "restored active raid");
  check(state.characters.every((character) => character.status === "bossing" && character.currentAction?.readyToResolve !== true), "active five-member raid restored for visual QA");
  check(JSON.stringify({ guild: state.guild, depot: state.depot, logs: state.logs }) === baseline, "QA preserves guild, depot and activity log");
  check(JSON.stringify(state.characters.map(({ attributes, inventory, characterDepot, equipment, bossCooldowns }) => ({ attributes, inventory, characterDepot, equipment, bossCooldowns }))) === baselineCharacters, "QA preserves character power, items and cooldowns");

  await db.execute("CREATE TABLE IF NOT EXISTS stage1715_report (kind TEXT NOT NULL, report_json TEXT NOT NULL)");
  await db.execute("DELETE FROM stage1715_report");
  await db.execute("INSERT INTO stage1715_report VALUES ('database', $1)", [JSON.stringify(report)]);
  return { party, report, state };
}

function createParty(characters: Character[]): BossParty {
  return {
    bossId: stage1715Boss.id,
    members: characters.map((character, index) => ({ characterId: character.id, role: roles[index] })),
  };
}

function withActiveBoss(character: Character, party: BossParty, startedAt: number): Character {
  return {
    ...character,
    status: "bossing",
    currentAction: {
      type: "bossing",
      label: stage1715Boss.name,
      startedAt: new Date(startedAt).toISOString(),
      endsAt: new Date(startedAt + 300_000).toISOString(),
      durationMinutes: 5,
      targetId: stage1715Boss.id,
      targetName: stage1715Boss.name,
      risk: stage1715Boss.risk,
      expectedXp: stage1715Boss.reward.experience,
      expectedGold: stage1715Boss.reward.goldMax,
      cost: stage1715Boss.entryCost,
      partyMemberIds: party.members.map((member) => member.characterId),
      partyMembers: party.members,
      bossManualReactions: [],
    },
  };
}

function withCompletedBoss(character: Character): Character {
  return {
    ...character,
    status: "bossing",
    currentAction: character.currentAction ? {
      ...character.currentAction,
      endsAt: completedAt,
      offlineCompletedAt: completedAt,
      readyToResolve: true,
    } : undefined,
  };
}

async function checkLocalImage(src: string | undefined, label: string, check: (ok: unknown, label: string) => void) {
  const response = await fetch(src ?? "/qa/missing-stage1715-asset.png");
  const bytes = await response.arrayBuffer();
  check(response.ok && response.headers.get("content-type")?.startsWith("image/") && bytes.byteLength > 10_000, label);
}

function requireState(state: GameStateSnapshot | null, label: string) {
  if (!state) throw new Error(`${label}: saved state was not found`);
  return state;
}
