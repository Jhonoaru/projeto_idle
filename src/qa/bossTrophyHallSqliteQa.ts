import Database from "@tauri-apps/plugin-sql";
import { runMigrations } from "../database/migrations";
import { createInitialGameState, loadGameState, saveGameState } from "../database/saveGameRepository";
import { bosses } from "../data/bosses";
import { getBossTrophyRewards } from "../data/bossTrophyRewards";
import { buildBossTrophyHall } from "../game-engine/boss/buildBossTrophyHall";
import { claimBossTrophyReward } from "../game-engine/boss/claimBossTrophyReward";
import { normalizeGuildOperationOutcomes } from "../game-engine/operations/normalizeGuildOperationOutcomes";
import { recordBossOperationOutcome } from "../game-engine/operations/recordBossOperationOutcome";
import { normalizeCollectionsState } from "../game-engine/collections/normalizeCollectionsState";
import { unlockCollectionItem } from "../game-engine/collections/unlockCollectionItem";
import { clearNewCollectionFlags } from "../game-engine/collections/clearNewCollectionFlags";
import { equipCollectionItem } from "../game-engine/collections/equipCollectionItem";
import type { Guild } from "../shared/types";

// Opt-in Tauri runner: never opens the player's database or mounts the game.
export async function runStage1655Qa() {
  const db = await Database.load("sqlite:stage1655_20260902.db");
  try {
    await runMigrations(db);
    return await runChecks(db);
  } finally {
    await db.close();
  }
}

async function runChecks(db: Database) {
  const report: string[] = [];
  function check(ok: unknown, label: string) {
    if (!ok) throw new Error(`FAIL after ${report.length} checks: ${label}`);
    report.push(`PASS ${label}`);
  }
  check(db.path === "sqlite:stage1655_20260902.db", "isolated Tauri SQL database");
  let state = structuredClone(createInitialGameState());
  const now = "2026-09-02T12:00:00.000Z";
  const outcomes = normalizeGuildOperationOutcomes({
    bossRaidCodex: { records: bosses.map((boss) => ({ bossId: boss.id, attempts: 3, defeats: 3, lastAttemptAt: now, lastDefeatedAt: now })) },
    bossExecutionMastery: { records: bosses.map((boss) => ({ bossId: boss.id, victoriesWithPerfectReactions: 3, totalPerfectReactions: 30, perfectDodges: 15, perfectHolds: 15, bestPerfectChain: 6, lastRecordedAt: now })) },
  });
  state.guild = { ...state.guild, operationOutcomes: outcomes, collections: normalizeCollectionsState(undefined) };
  await saveGameState(db, state);
  const legacy = { ...outcomes };
  delete legacy.bossTrophyHall;
  await db.execute("UPDATE guilds SET operation_outcomes_json = $1", [JSON.stringify(legacy)]);
  const loadedLegacy = await loadGameState(db);
  if (!loadedLegacy) throw new Error("Legacy load failed");
  state = loadedLegacy;
  check(state.guild.operationOutcomes?.bossTrophyHall?.claimedRewardIds.length === 0, "legacy save initializes empty Trophy Hall");
  check(buildBossTrophyHall(state.guild, bosses).availableCount === 6, "retroactive progress offers first reward for all six bosses");
  check(buildBossTrophyHall(state.guild, bosses).claimedCount === 0, "load does not auto-claim");
  const baselineEconomy = JSON.stringify({ gold: state.guild.gold, renown: state.guild.renown, depot: state.depot });
  const siblingState = () => JSON.stringify({ ...state.guild.operationOutcomes, bossTrophyHall: undefined });
  const baselineSiblings = siblingState();
  const uiSeed = structuredClone(state);
  const invalid = claimBossTrophyReward(state.guild, "invalid");
  check(!invalid.success && invalid.logs.length === 0, "invalid reward rejected without log spam");
  const lockedGuild = { ...state.guild, operationOutcomes: normalizeGuildOperationOutcomes(undefined) };
  check(!claimBossTrophyReward(lockedGuild, getBossTrophyRewards(bosses[0].id)[0].id).success, "unearned reward rejected");
  let claimCount = 0;
  for (const boss of bosses) {
    const rewards = getBossTrophyRewards(boss.id);
    check(!claimBossTrophyReward(state.guild, rewards[2].id).success, `${boss.name}: cannot skip tiers`);
    for (const reward of rewards) {
      const claim = claimBossTrophyReward(state.guild, reward.id, new Date(now));
      check(claim.success && claim.unlockedCollectionItemId === reward.collectionItemId, `${reward.tier}/${boss.name}: unlock`);
      state.guild = claim.guild;
      claimCount++;
      check(!claimBossTrophyReward(state.guild, reward.id).success, `${reward.tier}/${boss.name}: immediate duplicate rejected`);
      await saveGameState(db, state);
      const loaded = await loadGameState(db);
      if (!loaded) throw new Error("Reload failed");
      state = loaded;
      const hall = state.guild.operationOutcomes?.bossTrophyHall;
      const collection = normalizeCollectionsState(state.guild.collections);
      check(hall?.claimedRewardIds.length === claimCount && hall.claimHistory.length === claimCount && hall.claimHistory.some((entry) => entry.rewardId === reward.id && entry.claimedAt === now), `${reward.tier}/${boss.name}: ledger/history/date survive SQL reload`);
      check(collection.unlockedCollectionItemIds.includes(reward.collectionItemId) && collection.newlyUnlockedCollectionItemIds.includes(reward.collectionItemId), `${reward.tier}/${boss.name}: unlock/badge survive SQL reload`);
      check(!claimBossTrophyReward(state.guild, reward.id).success, `${reward.tier}/${boss.name}: duplicate rejected after reload`);
    }
  }
  check(buildBossTrophyHall(state.guild, bosses).claimedCount === 18 && buildBossTrophyHall(state.guild, bosses).availableCount === 0, "all 18 rewards archived exactly once");
  check(siblingState() === baselineSiblings, "Raid Codex, execution mastery and sibling outcomes unchanged");
  check(JSON.stringify({ gold: state.guild.gold, renown: state.guild.renown, depot: state.depot }) === baselineEconomy, "gold, renown and depot unchanged by claims");
  const raw = await db.select<Array<{ operation_outcomes_json: string; collections_json: string }>>("SELECT operation_outcomes_json, collections_json FROM guilds");
  check(JSON.parse(raw[0].operation_outcomes_json).bossTrophyHall.claimedRewardIds.length === 18, "raw SQLite contains 18 claims");
  check(JSON.parse(raw[0].collections_json).newlyUnlockedCollectionItemIds.length === 18, "raw SQLite contains 18 badge flags");
  const firstRewards = getBossTrophyRewards(bosses[0].id);
  for (const reward of firstRewards) state.characters[0] = equipCollectionItem(state.characters[0], state.guild, reward.collectionItemId);
  await saveGameState(db, state);
  state = (await loadGameState(db))!;
  check(state.characters[0].cosmetics?.activeAvatarId === firstRewards[0].collectionItemId && state.characters[0].cosmetics?.activeOutfitId === firstRewards[1].collectionItemId && state.characters[0].cosmetics?.activeMountId === firstRewards[2].collectionItemId, "avatar, outfit and mount equipment survives reload");
  state.guild = clearNewCollectionFlags(state.guild);
  await saveGameState(db, state);
  state = (await loadGameState(db))!;
  check(normalizeCollectionsState(state.guild.collections).newlyUnlockedCollectionItemIds.length === 0, "seen badge stays cleared after reload");
  const beforeRepeat = JSON.stringify(state.guild);
  const repeat = claimBossTrophyReward(state.guild, firstRewards[0].id);
  check(!repeat.success && repeat.logs.length === 0 && JSON.stringify(repeat.guild) === beforeRepeat, "duplicate does not recreate badge or change guild");
  let preUnlocked: Guild = unlockCollectionItem(uiSeed.guild, firstRewards[0].collectionItemId).guild;
  preUnlocked = clearNewCollectionFlags(preUnlocked);
  const preClaim = claimBossTrophyReward(preUnlocked, firstRewards[0].id);
  check(preClaim.success && !preClaim.unlockedCollectionItemId && preClaim.logs.length === 1, "pre-unlocked cosmetic archives without duplicate unlock log");
  await saveGameState(db, { ...uiSeed, guild: preClaim.guild });
  const preLoaded = (await loadGameState(db))!;
  check(preLoaded.guild.operationOutcomes?.bossTrophyHall?.claimedRewardIds.length === 1 && normalizeCollectionsState(preLoaded.guild.collections).newlyUnlockedCollectionItemIds.length === 0, "pre-unlocked claim persists without new badge");
  const beforeOutcome = JSON.stringify(state.guild.operationOutcomes?.bossTrophyHall);
  state.guild = recordBossOperationOutcome(state.guild, bosses[0], {
    success: true, diedCharacterIds: [], defeated: true, bossId: bosses[0].id, bossName: bosses[0].name,
    durationMinutes: 1, experienceGained: 10, goldGained: 5, loot: [], renownGained: 1, cooldownsApplied: [], logs: [],
  }, { bossId: bosses[0].id, members: [{ characterId: state.characters[0].id, role: "tank" }] }, 0, { completedAt: new Date(now) });
  await saveGameState(db, state);
  state = (await loadGameState(db))!;
  check(JSON.stringify(state.guild.operationOutcomes?.bossTrophyHall) === beforeOutcome, "new Boss operation preserves all trophy claims through reload");
  const corrupted = { ...outcomes, bossTrophyHall: { claimedRewardIds: [firstRewards[0].id, firstRewards[0].id, "bad", null], claimHistory: [null, { rewardId: firstRewards[1].id, claimedAt: "invalid" }] } };
  await db.execute("UPDATE guilds SET operation_outcomes_json = $1", [JSON.stringify(corrupted)]);
  const recovered = (await loadGameState(db))!;
  check(recovered.guild.operationOutcomes?.bossTrophyHall?.claimedRewardIds.length === 1 && recovered.guild.operationOutcomes.bossTrophyHall.claimHistory.length === 0, "corrupt SQL ledger/history normalizes safely");
  await saveGameState(db, uiSeed);
  await db.execute("CREATE TABLE IF NOT EXISTS stage1655_report (report_json TEXT NOT NULL)");
  await db.execute("INSERT INTO stage1655_report VALUES ($1)", [JSON.stringify(report)]);
  return report;
}
