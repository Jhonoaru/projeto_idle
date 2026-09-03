import Database from "@tauri-apps/plugin-sql";
import { runMigrations } from "../database/migrations";
import { createInitialGameState, loadGameState, saveGameState, type GameStateSnapshot } from "../database/saveGameRepository";
import { bosses } from "../data/bosses";
import { getBossTrophyRewards } from "../data/bossTrophyRewards";
import { getCollectionItemById } from "../data/collections";
import { getMountSprite } from "../data/collectionSprites";
import { buildBossTrophyHall } from "../game-engine/boss/buildBossTrophyHall";
import { claimBossTrophyReward } from "../game-engine/boss/claimBossTrophyReward";
import { equipCollectionItem } from "../game-engine/collections/equipCollectionItem";
import { normalizeCollectionsState } from "../game-engine/collections/normalizeCollectionsState";
import { normalizeGuildOperationOutcomes } from "../game-engine/operations/normalizeGuildOperationOutcomes";

const QA_DATABASE = "sqlite:stage1685_20260903.db";

export interface Stage1685QaResult {
  report: string[];
  state: GameStateSnapshot;
  mountIds: string[];
}

// Opt-in Tauri runner: never opens the player's database or mounts the game.
export async function runStage1685Qa(): Promise<Stage1685QaResult> {
  const db = await Database.load(QA_DATABASE);
  try {
    await runMigrations(db);
    return await runChecks(db);
  } finally {
    await db.close();
  }
}

async function runChecks(db: Database): Promise<Stage1685QaResult> {
  const report: string[] = [];
  const check = (ok: unknown, label: string) => {
    if (!ok) throw new Error(`FAIL after ${report.length} checks: ${label}`);
    report.push(`PASS ${label}`);
  };

  check(db.path === QA_DATABASE, "isolated Tauri SQL database");
  const now = "2026-09-03T12:00:00.000Z";
  let state = structuredClone(createInitialGameState());
  state.guild = {
    ...state.guild,
    operationOutcomes: normalizeGuildOperationOutcomes({
      bossRaidCodex: { records: bosses.map((boss) => ({ bossId: boss.id, attempts: 6, defeats: 6, lastAttemptAt: now, lastDefeatedAt: now })) },
      bossExecutionMastery: { records: bosses.map((boss) => ({ bossId: boss.id, victoriesWithPerfectReactions: 6, totalPerfectReactions: 30, perfectDodges: 15, perfectHolds: 15, bestPerfectChain: 6, lastRecordedAt: now })) },
    }),
  };
  await saveGameState(db, state);
  state = requireState(await loadGameState(db), "initial reload");
  const baseline = JSON.stringify({ gold: state.guild.gold, renown: state.guild.renown, depot: state.depot });
  const baselineAttributes = JSON.stringify(state.characters[0].attributes);
  check(state.characters[0].cosmetics?.activeMountId === "mount-none", "old/default character starts with safe mount fallback");

  const mountIds: string[] = [];
  for (const boss of bosses) {
    const rewards = getBossTrophyRewards(boss.id);
    const mountReward = rewards[2];
    mountIds.push(mountReward.collectionItemId);
    const sprite = getMountSprite(mountReward.collectionItemId);
    check(getCollectionItemById(mountReward.collectionItemId)?.category === "mount" && !!sprite, `${boss.name}: mount definition and sprite mapping`);
    const response = await fetch(sprite!.src);
    const bytes = await response.arrayBuffer();
    check(response.ok && response.headers.get("content-type")?.includes("image/png") && bytes.byteLength > 100_000, `${boss.name}: local PNG loads inside Tauri`);

    for (const reward of rewards) {
      const claim = claimBossTrophyReward(state.guild, reward.id, new Date(now));
      check(claim.success && claim.unlockedCollectionItemId === reward.collectionItemId, `${boss.name}: ${reward.tier} claim succeeds in order`);
      state.guild = claim.guild;
    }
    await saveGameState(db, state);
    state = requireState(await loadGameState(db), `${boss.name} reload`);
    const collections = normalizeCollectionsState(state.guild.collections);
    check(collections.unlockedCollectionItemIds.includes(mountReward.collectionItemId), `${boss.name}: mount unlock survives SQL reload`);
    check(state.guild.operationOutcomes?.bossTrophyHall?.claimedRewardIds.includes(mountReward.id), `${boss.name}: flawless claim survives SQL reload`);
  }

  check(buildBossTrophyHall(state.guild, bosses).claimedCount === 18, "all 18 prerequisite and mount trophies archived once");
  check(mountIds.every((id) => normalizeCollectionsState(state.guild.collections).unlockedCollectionItemIds.includes(id)), "all six mount IDs persisted in Collections");

  const firstRewards = getBossTrophyRewards(bosses[0].id);
  state.characters[0] = equipCollectionItem(state.characters[0], state.guild, firstRewards[0].collectionItemId);
  state.characters[0] = equipCollectionItem(state.characters[0], state.guild, firstRewards[1].collectionItemId);
  const expectedAvatar = state.characters[0].cosmetics?.activeAvatarId;
  const expectedOutfit = state.characters[0].cosmetics?.activeOutfitId;

  for (const mountId of mountIds) {
    state.characters[0] = equipCollectionItem(state.characters[0], state.guild, mountId);
    check(state.characters[0].cosmetics?.activeMountId === mountId, `${mountId}: equip selects only requested mount`);
    check(state.characters[0].cosmetics?.activeAvatarId === expectedAvatar && state.characters[0].cosmetics?.activeOutfitId === expectedOutfit, `${mountId}: avatar and outfit remain selected`);
    await saveGameState(db, state);
    state = requireState(await loadGameState(db), `${mountId} reload`);
    check(state.characters[0].cosmetics?.activeMountId === mountId && !!getMountSprite(state.characters[0].cosmetics?.activeMountId), `${mountId}: selection and artwork resolve after SQL reload`);
    const rows = await db.select<Array<{ cosmetics_json: string }>>("SELECT cosmetics_json FROM characters WHERE id = $1", [state.characters[0].id]);
    check(JSON.parse(rows[0].cosmetics_json).activeMountId === mountId, `${mountId}: raw SQLite stores active mount ID`);
  }

  check(JSON.stringify({ gold: state.guild.gold, renown: state.guild.renown, depot: state.depot }) === baseline, "claims and equipment preserve economy and depot");
  check(JSON.stringify(state.characters[0].attributes) === baselineAttributes, "mount equipment preserves character attributes");
  const rawGuild = await db.select<Array<{ collections_json: string; operation_outcomes_json: string }>>("SELECT collections_json, operation_outcomes_json FROM guilds LIMIT 1");
  const rawCollections = JSON.parse(rawGuild[0].collections_json);
  const rawOutcomes = JSON.parse(rawGuild[0].operation_outcomes_json);
  check(mountIds.every((id) => rawCollections.unlockedCollectionItemIds.includes(id)), "raw SQLite contains all six collection unlocks");
  check(rawOutcomes.bossTrophyHall.claimedRewardIds.length === 18, "raw SQLite contains exactly 18 ordered claims");

  const validState = structuredClone(state);
  await db.execute("UPDATE characters SET cosmetics_json = $1 WHERE id = $2", [JSON.stringify({ activeOutfitId: expectedOutfit, activeMountId: "missing-mount", activeAvatarId: expectedAvatar }), state.characters[0].id]);
  const recovered = requireState(await loadGameState(db), "invalid mount recovery");
  check(recovered.characters[0].cosmetics?.activeMountId === "mount-none", "invalid persisted mount normalizes to No Mount");
  check(recovered.characters[0].cosmetics?.activeOutfitId === expectedOutfit && recovered.characters[0].cosmetics?.activeAvatarId === expectedAvatar, "invalid mount does not discard outfit or avatar");
  await saveGameState(db, validState);
  state = requireState(await loadGameState(db), "final restored state");
  check(state.characters[0].cosmetics?.activeMountId === mountIds.at(-1), "valid mounted appearance restored after corruption test");

  await db.execute("CREATE TABLE IF NOT EXISTS stage1685_report (report_json TEXT NOT NULL)");
  await db.execute("INSERT INTO stage1685_report VALUES ($1)", [JSON.stringify(report)]);
  return { report, state, mountIds };
}

function requireState(state: GameStateSnapshot | null, label: string) {
  if (!state) throw new Error(`${label}: saved state was not found`);
  return state;
}
