import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// Run the production TS modules in Node without altering the application's bundler.
registerHooks({
  resolve(specifier, context, next) {
    try { return next(specifier, context); } catch (error) {
      if (!specifier.startsWith('.')) throw error;
      for (const extension of ['.ts', '.tsx']) {
        try { return next(specifier + extension, context); } catch {}
      }
      throw error;
    }
  },
  load(url, context, next) {
    if (!/\.tsx?$/.test(url)) return next(url, context);
    return { format: 'module', shortCircuit: true, source: ts.transpileModule(readFileSync(new URL(url), 'utf8'), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX },
    }).outputText };
  },
});

const { mapGuild, mapCharacter, mapInventoryItem } = await import('../src/database/saveMapper.ts');
const legacyGuildRow = { id: 'legacy-audit', name: 'Legacy', gold: 123, renown: 0, rank: 'Recruit', level: 1 };
for (const invalid of ['{broken', 'null', '{}', '42', '"text"']) {
  assert.deepEqual(mapGuild({ ...legacyGuildRow, hunt_presets_json: invalid }).huntPresets, [], `invalid list: ${invalid}`);
}
const legacyItemRow = { id: 'legacy-item', item_id: 'removed-catalog-item', quantity: 2, locked: 1,
  location: 'inventory', character_id: 'legacy-hero', parent_container_id: null };
for (const invalid of ['{broken', 'null', '{}', '42']) {
  const item = mapInventoryItem({ ...legacyItemRow, imbuements_json: invalid });
  assert.deepEqual(item.imbuements, []);
  assert.equal(item.item.value, 0);
  assert.equal(item.quantity, 2);
  assert.equal(item.locked, true);
}

const { mockCharacters } = await import('../src/data/mockCharacters.ts');
const sourceHero = mockCharacters[0];
const legacyCharacterRow = {
  id: sourceHero.id, name: sourceHero.name, vocation: sourceHero.vocation, level: sourceHero.level,
  experience: sourceHero.experience, experience_to_next_level: sourceHero.experienceToNextLevel,
  status: 'idle', city: sourceHero.city, stamina_hours: 42, capacity_used: 0,
  current_action_json: null, attributes_json: '{}', completed_quest_ids_json: 'null',
  access_ids_json: '{}', quest_progress_json: '42', boss_cooldowns_json: '{broken',
  blessings_json: 'null', created_at: '2020-01-01T00:00:00.000Z',
};
const recoveredHero = mapCharacter(legacyCharacterRow, [], [], mapGuild(legacyGuildRow));
for (const key of ['completedQuestIds', 'accessIds', 'questProgress', 'bossCooldowns', 'blessings', 'inventory']) {
  assert.deepEqual(recoveredHero[key], [], `recovered ${key}`);
}
assert.ok(Number.isFinite(recoveredHero.attributes.capacity));
assert.ok(recoveredHero.skills.sword.level > 0);
assert.equal(recoveredHero.currentAction, undefined);
assert.equal(mapGuild(legacyGuildRow).gold, 123);
const validHero = mapCharacter({ ...legacyCharacterRow,
  completed_quest_ids_json: '["quest-old"]', access_ids_json: '["access-old"]',
  current_action_json: JSON.stringify({ type: 'training', label: 'Sword', startedAt: '23:50', endsAt: '00:20', targetSkill: 'sword' }),
}, [], [], mapGuild(legacyGuildRow));
assert.deepEqual(validHero.completedQuestIds, ['quest-old']);
assert.deepEqual(validHero.accessIds, ['access-old']);
assert.equal(validHero.currentAction.endsAt, '00:20');
console.log('PASS: synthetic legacy rows, missing skills/inventory, invalid JSON shapes, unknown item preserved without sale value');
const { hunts } = await import('../src/data/hunts.ts');
const { startHunt, finishHunt } = await import('../src/game-services/huntService.ts');
const { startTraining } = await import('../src/game-services/trainingService.ts');
const { getActionCompletionStatus } = await import('../src/game-engine/offline/getActionCompletionStatus.ts');
const { sellFromCharacterInventory } = await import('../src/game-services/marketService.ts');
const { renderToStaticMarkup } = await import('react-dom/server');
const { createElement } = await import('react');
const { CharmStatusSummary } = await import('../src/components/bestiary/CharmStatusSummary.tsx');
const { ActionPanel } = await import('../src/components/action/ActionPanel.tsx');

const hero = { ...structuredClone(mockCharacters[0]), status: 'idle', currentAction: undefined, inventory: [], capacityMax: 100000 };
const bestiary = { progress: [{ monsterId: 'monster-sewer-rat', monsterName: 'Sewer Rat', kills: 100, stage: 'completed' }], charmPoints: 0,
  unlockedCharmIds: ['charm-scavenger'], activeCharms: [{ charmId: 'charm-scavenger', monsterId: 'monster-sewer-rat' }] };
const guild = { id: 'audit', name: 'Audit', gold: 1000, level: 1, renown: 0, rank: 'Recruit' };
const { buyFromNpcShop, sellFromCharacterDepot, sellFromGuildDepot } = await import('../src/game-services/marketService.ts');
const emptyDepot = { goldStored: 0, items: [] };
for (const target of ['character_inventory', 'character_depot', 'guild_depot']) {
  const buyer = { ...structuredClone(hero), characterDepot: [] };
  const before = JSON.stringify(buyer);
  const purchase = buyFromNpcShop(buyer, guild, emptyDepot, 'small-backpack', 2, 125, target);
  assert.equal(purchase.success, true);
  assert.equal(purchase.guild.gold, 750);
  const delivered = target === 'character_inventory' ? purchase.character.inventory
    : target === 'character_depot' ? purchase.character.characterDepot : purchase.guildDepot.items;
  assert.equal(delivered.length, 2, `${target}: nonstackable purchases need separate identities`);
  assert.equal(new Set(delivered.map(item => item.id)).size, 2);
  assert.ok(delivered.every(item => item.quantity === 1));
  assert.equal(JSON.stringify(buyer), before);
  const sell = (character, currentGuild, depot, ids) => target === 'character_inventory'
    ? sellFromCharacterInventory(character, currentGuild, ids)
    : target === 'character_depot' ? sellFromCharacterDepot(character, currentGuild, ids)
    : sellFromGuildDepot(depot, currentGuild, ids);
  const ids = delivered.map(item => item.id);
  const sold = sell(purchase.character, purchase.guild, purchase.guildDepot, [...ids, ...ids]);
  assert.equal(sold.result.soldItems.length, 2);
  const again = sell(sold.character ?? purchase.character, sold.guild, sold.guildDepot ?? purchase.guildDepot, ids);
  assert.equal(again.result.totalGold, 0);
  assert.equal(again.guild.gold, sold.guild.gold);
}
const noSpace = buyFromNpcShop({ ...hero, capacityMax: 0 }, guild, emptyDepot, 'small-backpack', 2, 125, 'character_inventory');
assert.equal(noSpace.success, false);
assert.equal(noSpace.guild.gold, guild.gold);
assert.deepEqual(noSpace.character.inventory, hero.inventory);
const suppliesPurchase = buyFromNpcShop(hero, guild, emptyDepot, 'minor-health-potion', 5, 30, 'guild_depot');
assert.equal(suppliesPurchase.success, true);
assert.equal(suppliesPurchase.guildDepot.items.length, 1);
assert.equal(suppliesPurchase.guildDepot.items[0].quantity, 5);
assert.equal(suppliesPurchase.guild.gold, 850);
for (const [quantity, price] of [[0, 125], [NaN, 125], [2, 1], [1000, 125]]) {
  const rejected = buyFromNpcShop(hero, { ...guild, gold: 1000000 }, emptyDepot, 'small-backpack', quantity, price, 'guild_depot');
  assert.equal(rejected.success, false);
  assert.equal(rejected.guild.gold, 1000000);
  assert.deepEqual(rejected.guildDepot.items, []);
}
const lockedPurchase = buyFromNpcShop(hero, guild, emptyDepot, 'small-backpack', 1, 125, 'character_inventory');
const lockedHero = { ...lockedPurchase.character, inventory: lockedPurchase.character.inventory.map(item => ({ ...item, locked: true })) };
assert.equal(sellFromCharacterInventory(lockedHero, guild, lockedHero.inventory.map(item => item.id)).result.totalGold, 0);
console.log('PASS: NPC delivery identities in three destinations, repeated sale, locks, capacity rollback and immutable input');
const started = startHunt(hero, hunts[0], 30);
const training = startTraining(hero, 'offline', 'sword', 30, 0);
const { cancelCurrentAction, finishTravel } = await import('../src/game-services/actionService.ts');
for (const status of ['hunting', 'training', 'questing', 'bossing']) {
  const actor = { ...structuredClone(hero), status, questProgress: [], currentAction: { ...started.currentAction, type: status } };
  const before = JSON.stringify(actor);
  const canceled = cancelCurrentAction(actor);
  assert.equal(canceled.success, true);
  const travel = canceled.character.currentAction;
  assert.equal(Date.parse(travel.endsAt) - Date.parse(travel.startedAt), 10000, 'return uses dated 10s timer');
  assert.equal(finishTravel(canceled.character).success, false);
  assert.equal(cancelCurrentAction(canceled.character).success, false);
  const arrived = finishTravel({ ...canceled.character, currentAction: { ...travel, endsAt: new Date(Date.now() - 86400000).toISOString() } });
  assert.equal(arrived.success, true);
  assert.equal(arrived.character.status, 'idle');
  assert.equal(arrived.character.currentAction, undefined);
  assert.equal(finishTravel(arrived.character).success, false);
  assert.equal(arrived.character.experience, actor.experience);
  assert.deepEqual(arrived.character.inventory, actor.inventory);
  assert.equal(JSON.stringify(actor), before);
}
console.log('PASS: cancellation of four action types, dated return, early/repeated arrival blocked and resources unchanged');
const noop = () => {};
const controls = { characters: [hero], hunts, quests: [], bosses: [], bossParty: { bossId: '', members: [] },
  onCancelAction: noop, onFinishTravel: noop, onFinishHunt: noop, onFinishTraining: noop,
  onFinishQuest: noop, onFinishBoss: noop, onReviveCharacter: noop, onStopHuntAutoRepeat: noop, onChangeTab: noop };
assert.match(renderToStaticMarkup(createElement(ActionPanel, { ...controls, selectedCharacter: started })), /<button disabled=""[^>]*>Hunt em andamento/);
assert.match(renderToStaticMarkup(createElement(ActionPanel, { ...controls, selectedCharacter: training })), /<button disabled=""[^>]*>Treino em andamento/);
const completed = { ...started, currentAction: { ...started.currentAction, readyToResolve: true } };
assert.match(renderToStaticMarkup(createElement(ActionPanel, { ...controls, selectedCharacter: completed })), /<button type="button">Coletar resultado da Hunt/);
for (const actor of [started, training]) {
  const action = actor.currentAction;
  assert.equal(Date.parse(action.endsAt) - Date.parse(action.startedAt), 1800000);
  assert.equal(getActionCompletionStatus(actor, new Date(action.startedAt)), 'running');
  assert.equal(getActionCompletionStatus(actor, new Date(Date.parse(action.endsAt) + 86400000)), 'completed_offline');
}
const baseline = finishHunt(structuredClone(started), hunts[0], 30, guild.gold);
const enhanced = finishHunt(structuredClone(started), hunts[0], 30, guild.gold, bestiary);
assert.ok(enhanced.result.lootBonusGold > 0, 'bonus must be nonzero, not a vacuous equality');
assert.equal(enhanced.result.totalLootValue, baseline.result.totalLootValue);
assert.equal(enhanced.result.goldGained - baseline.result.goldGained, enhanced.result.lootBonusGold);
assert.equal(enhanced.result.netProfit - baseline.result.netProfit, enhanced.result.lootBonusGold);
const sale = (outcome) => sellFromCharacterInventory(outcome.character, { ...guild, gold: guild.gold + outcome.result.netProfit }, outcome.character.inventory.map(item => item.id));
assert.equal(sale(enhanced).guild.gold - sale(baseline).guild.gold, enhanced.result.lootBonusGold);
const full = finishHunt({ ...structuredClone(started), capacityMax: 0 }, hunts[0], 30, guild.gold, bestiary);
assert.ok(full.result.rejectedLoot.length > 0);
assert.equal(full.result.lootBonusGold, 0, 'discarded loot cannot pay a bonus');
for (const [id, label] of [['charm-fortify', '-5% death risk'], ['charm-conservation', '-5% supplies']]) {
  const state = { ...bestiary, unlockedCharmIds: [id], activeCharms: [{ charmId: id, monsterId: 'monster-sewer-rat' }] };
  assert.ok(renderToStaticMarkup(createElement(CharmStatusSummary, { bestiary: state, hunt: hunts[0] })).includes(label));
}
console.log('PASS: dated Hunt/training timers, next-day completion, real loot bonus, NPC sale reconciliation, full inventory, reduction labels');

const { resolveActionEndsAt } = await import('../src/game-engine/offline/getActionCompletionStatus.ts');
const { markExpiredActionsReady } = await import('../src/game-engine/offline/markExpiredActionsReady.ts');
const anchor = new Date(2026, 8, 12, 23, 50);
assert.equal(resolveActionEndsAt('00:20', anchor).getDate(), 13);
for (const invalid of ['24:00', '12:60', '99:99', '12:00:99', ':', '12:00:00:10', 'invalid']) {
  assert.equal(resolveActionEndsAt(invalid, anchor), undefined);
}
const offlineActors = ['hunting', 'training', 'questing', 'bossing'].map((type, index) => ({
  ...structuredClone(started), id: `offline-${index}`, status: type,
  currentAction: { ...started.currentAction, type, startedAt: anchor.toISOString(), endsAt: new Date(anchor.getTime() + 1800000).toISOString() },
}));
const originalRewards = offlineActors.map(({ experience, inventory }) => ({ experience, inventory }));
const later = new Date(anchor.getTime() + 72 * 3600000);
const firstCatchup = markExpiredActionsReady(offlineActors, later, anchor.toISOString());
assert.equal(firstCatchup.reports.length, 4);
assert.deepEqual(firstCatchup.characters.map(({ experience, inventory }) => ({ experience, inventory })), originalRewards);
const repeatedCatchup = markExpiredActionsReady(firstCatchup.characters, later, anchor.toISOString());
assert.equal(repeatedCatchup.reports.length, 0);
assert.deepEqual(repeatedCatchup.characters, firstCatchup.characters);
console.log('PASS: legacy midnight clock, malformed clocks, 72h offline across four actions, repeat catch-up idempotency');
