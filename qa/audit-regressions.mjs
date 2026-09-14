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
const { createInventoryItem } = await import('../src/data/inventoryFactory.ts');
const { items: catalog } = await import('../src/data/items.ts');
const { upgradeItem } = await import('../src/game-engine/forge/upgradeItem.ts');
const { increaseItemTier } = await import('../src/game-engine/forge/increaseItemTier.ts');
const { getItemUpgradeCost } = await import('../src/game-engine/forge/getItemUpgradeCost.ts');
const { getItemTierCost } = await import('../src/game-engine/forge/getItemTierCost.ts');
const gear = createInventoryItem(Object.values(catalog).find(item => item.type === 'equipment' && !item.stackable).id, 1, 'character', hero.id);
const forgeHero = { ...structuredClone(hero), equipment: {}, characterDepot: [], inventory: [gear] };
const forgeGuild = { ...guild, gold: 1000000 };
const forgeDepot = { goldStored: 0, items: ['iron-ore', 'enchanted-dust', 'wyvern-scale'].map(id => createInventoryItem(id, 1000, 'guildDepot')) };
for (const [operation, field, cost] of [[upgradeItem, 'upgradeLevel', getItemUpgradeCost], [increaseItemTier, 'tier', getItemTierCost]]) {
  const before = JSON.stringify([forgeHero, forgeGuild, forgeDepot]);
  assert.throws(() => operation(forgeHero, forgeGuild, forgeDepot, { ...gear, id: 'missing-item' }));
  assert.throws(() => operation(forgeHero, { ...forgeGuild, gold: NaN }, forgeDepot, gear));
  const first = operation(forgeHero, forgeGuild, forgeDepot, gear);
  const second = operation(first.character, first.guild, first.guildDepot, gear);
  assert.equal(second.character.inventory.find(item => item.id === gear.id)[field], 2);
  assert.equal(second.guild.gold, forgeGuild.gold - cost(0).goldCost - cost(1).goldCost);
  assert.equal(JSON.stringify([forgeHero, forgeGuild, forgeDepot]), before);
}
console.log('PASS: forge missing item, invalid gold, stale selection uses current cost/level, immutable inputs');
const { applyImbuement } = await import('../src/game-engine/forge/applyImbuement.ts');
const { imbuements } = await import('../src/data/imbuements.ts');
const imbueDefinition = imbuements.find(entry => entry.familyId === 'strike' && entry.powerLevel === 'basic') ?? imbuements[0];
const weapon = createInventoryItem(Object.values(catalog).find(item => item.type === 'equipment' && item.equipmentSlot === 'weapon' && !item.stackable).id, 1, 'character', hero.id);
const imbueHero = { ...forgeHero, inventory: [weapon] };
const imbueBefore = JSON.stringify([imbueHero, forgeGuild, forgeDepot]);
assert.throws(() => applyImbuement(imbueHero, forgeGuild, forgeDepot, { ...weapon, id: 'missing' }, 'weapon', imbueDefinition.id));
assert.throws(() => applyImbuement(imbueHero, { ...forgeGuild, gold: NaN }, forgeDepot, weapon, 'weapon', imbueDefinition.id));
assert.throws(() => applyImbuement(imbueHero, forgeGuild, forgeDepot, weapon, 'armor', imbueDefinition.id));
const imbued = applyImbuement(imbueHero, forgeGuild, forgeDepot, weapon, 'weapon', imbueDefinition.id);
assert.equal(imbued.guild.gold, forgeGuild.gold - imbueDefinition.goldCost);
assert.equal(imbued.character.inventory[0].imbuements.length, 1);
assert.throws(() => applyImbuement(imbued.character, imbued.guild, imbued.guildDepot, weapon, 'weapon', imbueDefinition.id));
assert.equal(JSON.stringify([imbueHero, forgeGuild, forgeDepot]), imbueBefore);
console.log('PASS: imbuement ownership, invalid gold, slot mismatch, stale repeat and immutable inputs');
const { depositGuildGold, withdrawGuildGold } = await import('../src/game-engine/treasury/transferGuildTreasuryGold.ts');
const treasuryTime = new Date('2026-09-14T15:00:00Z');
const deposit = depositGuildGold(guild, 400, treasuryTime);
assert.equal(deposit.success, true);
assert.equal(deposit.guild.gold + deposit.guild.treasury.reservedGold, guild.gold);
assert.equal(depositGuildGold(deposit.guild, 400, treasuryTime).success, false);
const withdrawal = withdrawGuildGold(deposit.guild, 400, new Date(treasuryTime.getTime() + 1));
assert.equal(withdrawal.success, true);
assert.equal(withdrawal.guild.gold, guild.gold);
assert.equal(withdrawal.guild.treasury.reservedGold, 0);
for (const invalid of [0, -1, 0.5, NaN, Infinity, 1001]) {
  const result = depositGuildGold(guild, invalid, treasuryTime);
  assert.equal(result.success, false);
  assert.equal(result.guild, guild);
}
assert.equal(withdrawGuildGold(deposit.guild, 401, treasuryTime).success, false);
const { guildFacilities } = await import('../src/data/guildFacilities.ts');
const { upgradeGuildFacility } = await import('../src/game-engine/headquarters/upgradeGuildFacility.ts');
for (const facility of guildFacilities) {
  const supplies = { goldStored: 0, items: facility.materialRequirements[0].map(req => createInventoryItem(req.itemId, req.quantity, 'guildDepot')) };
  const before = JSON.stringify([guild, supplies]);
  const upgraded = upgradeGuildFacility(guild, supplies, [hero], facility.id);
  assert.equal(upgraded.success, true, facility.id);
  assert.equal(upgraded.guild.gold, guild.gold - facility.upgradeCosts[0]);
  assert.equal(upgraded.guild.headquarters.facilityLevels[facility.id], 1);
  assert.equal(upgraded.depot.items.length, 0);
  const repeated = upgradeGuildFacility(upgraded.guild, upgraded.depot, [hero], facility.id);
  assert.equal(repeated.success, false);
  assert.equal(repeated.guild, upgraded.guild);
  const locked = upgradeGuildFacility(guild, { ...supplies, items: supplies.items.map(item => ({ ...item, locked: true })) }, [hero], facility.id);
  assert.equal(locked.success, false);
  assert.equal(locked.guild, guild);
  const poor = upgradeGuildFacility({ ...guild, gold: 0 }, supplies, [hero], facility.id);
  assert.equal(poor.success, false);
  assert.equal(poor.depot, supplies);
  assert.equal(JSON.stringify([guild, supplies]), before);
}
console.log('PASS: treasury conservation/duplicate/invalid transfers; all four facilities first upgrade, protected materials and failure without cost');
const { MAX_GUILD_GOLD, GUILD_TREASURY_HISTORY_LIMIT } = await import('../src/game-engine/treasury/normalizeGuildTreasuryState.ts');
const reserve = (reservedGold) => ({ reservedGold, totalDeposited: 0, totalWithdrawn: 0, transactions: [] });
const atReserveLimit = { ...guild, treasury: reserve(MAX_GUILD_GOLD) };
assert.equal(depositGuildGold(atReserveLimit, 1, treasuryTime).success, false);
const exactReserveLimit = depositGuildGold({ ...guild, treasury: reserve(MAX_GUILD_GOLD - 1) }, 1, treasuryTime);
assert.equal(exactReserveLimit.success, true);
assert.equal(exactReserveLimit.guild.treasury.reservedGold, MAX_GUILD_GOLD);
assert.equal(withdrawGuildGold({ ...guild, gold: MAX_GUILD_GOLD, treasury: reserve(1) }, 1, treasuryTime).success, false);
const exactSpendableLimit = withdrawGuildGold({ ...guild, gold: MAX_GUILD_GOLD - 1, treasury: reserve(1) }, 1, treasuryTime);
assert.equal(exactSpendableLimit.success, true);
assert.equal(exactSpendableLimit.guild.gold, MAX_GUILD_GOLD);
assert.equal(depositGuildGold(guild, 1, new Date(NaN)).success, false);
let historyGuild = structuredClone(guild);
for (let index = 0; index < 40; index++) {
  const result = depositGuildGold(historyGuild, 1, new Date(treasuryTime.getTime() + index));
  assert.equal(result.success, true);
  historyGuild = result.guild;
}
assert.equal(historyGuild.treasury.transactions.length, GUILD_TREASURY_HISTORY_LIMIT);
assert.equal(historyGuild.gold + historyGuild.treasury.reservedGold, guild.gold);
const intricate = imbuements.find(entry => entry.familyId === imbueDefinition.familyId && entry.powerLevel === 'intricate');
assert.ok(intricate);
const lowLevel = { ...imbued.character, level: 1 };
assert.throws(() => applyImbuement(lowLevel, imbued.guild, imbued.guildDepot, weapon, 'weapon', intricate.id));
const qualifiedByLevel = { ...imbued.character, level: 60 };
const replaced = applyImbuement(qualifiedByLevel, imbued.guild, imbued.guildDepot, weapon, 'weapon', intricate.id);
assert.deepEqual(replaced.character.inventory[0].imbuements.map(entry => entry.imbuementId), [intricate.id]);
assert.equal(replaced.guild.gold, forgeGuild.gold - imbueDefinition.goldCost - intricate.goldCost);
for (const requirement of intricate.requiredMaterials) {
  const before = imbued.guildDepot.items.find(item => item.itemId === requirement.itemId).quantity;
  const after = replaced.guildDepot.items.find(item => item.itemId === requirement.itemId).quantity;
  assert.equal(before - after, requirement.quantity);
}
const qualifiedByTier = { ...lowLevel, inventory: lowLevel.inventory.map(item => ({ ...item, tier: 1 })) };
assert.equal(applyImbuement(qualifiedByTier, imbued.guild, imbued.guildDepot, weapon, 'weapon', intricate.id).character.inventory[0].imbuements[0].imbuementId, intricate.id);
const poorImbue = { ...imbued.guild, gold: 0 };
const replacementBefore = JSON.stringify([qualifiedByLevel, poorImbue, imbued.guildDepot]);
assert.throws(() => applyImbuement(qualifiedByLevel, poorImbue, imbued.guildDepot, weapon, 'weapon', intricate.id));
assert.equal(JSON.stringify([qualifiedByLevel, poorImbue, imbued.guildDepot]), replacementBefore);
const { getGuildCareer } = await import('../src/game-engine/achievements/getGuildCareer.ts');
const veteranRoster = Array.from({ length: 5 }, (_, index) => ({ ...structuredClone(hero), id: `audit-veteran-${index}`, level: 100,
  experience: 500000, completedQuestIds: ['q1', 'q2', 'q3', 'q4', 'q5'], accessIds: ['a1', 'a2', 'a3'] }));
const veteranGuild = { ...forgeGuild, renown: 100 };
assert.ok(getGuildCareer(veteranGuild, veteranRoster).points >= 350);
for (const facility of guildFacilities) {
  let currentGuild = structuredClone(veteranGuild);
  let totalCost = 0;
  let totalMaterials = 0;
  for (let level = 0; level < 3; level++) {
    const materials = { goldStored: 0, items: facility.materialRequirements[level].map(req => createInventoryItem(req.itemId, req.quantity, 'guildDepot')) };
    const result = upgradeGuildFacility(currentGuild, materials, veteranRoster, facility.id);
    assert.equal(result.success, true, `${facility.id} level ${level + 1}`);
    totalCost += facility.upgradeCosts[level];
    totalMaterials += facility.materialRequirements[level].reduce((sum, req) => sum + req.quantity, 0);
    assert.equal(result.guild.gold, veteranGuild.gold - totalCost);
    assert.equal(result.guild.headquarters.facilityLevels[facility.id], level + 1);
    assert.equal(result.guild.headquarters.totalInvestedGold, totalCost);
    assert.equal(result.guild.headquarters.totalInvestedMaterials, totalMaterials);
    assert.deepEqual(result.depot.items, []);
    currentGuild = result.guild;
  }
  const capped = upgradeGuildFacility(currentGuild, forgeDepot, veteranRoster, facility.id);
  assert.equal(capped.success, false);
  assert.equal(capped.guild, currentGuild);
  assert.equal(capped.depot, forgeDepot);
}
console.log('PASS: treasury exact limits/overflow/history, imbuement replacement/level-or-tier/no refund, four facilities through max level');
const { normalizeGuildBazaarState } = await import('../src/game-engine/bazaar/normalizeGuildBazaarState.ts');
const { purchaseBazaarOffer } = await import('../src/game-engine/bazaar/purchaseBazaarOffer.ts');
const bazaarNow = new Date('2026-09-14T12:01:00Z');
const bazaarGuild = { ...guild, gold: 1000000000, bazaar: normalizeGuildBazaarState(undefined, guild.id, bazaarNow) };
const bazaarOffer = bazaarGuild.bazaar.offers[0];
const bazaarArgs = { character: hero, guild: bazaarGuild, guildDepot: { goldStored: 0, items: [] }, offerId: bazaarOffer.id, deliveryTarget: 'guild_depot', now: bazaarNow };
const bazaarBefore = JSON.stringify(bazaarArgs);
const bazaarPurchase = purchaseBazaarOffer(bazaarArgs);
assert.equal(bazaarPurchase.success, true);
assert.equal(bazaarPurchase.guild.gold, bazaarGuild.gold - bazaarOffer.price);
const bazaarRepeat = purchaseBazaarOffer({ ...bazaarArgs, ...bazaarPurchase });
assert.equal(bazaarRepeat.success, false);
assert.equal(bazaarRepeat.guild.gold, bazaarPurchase.guild.gold);
assert.equal(bazaarRepeat.guild.bazaar.purchaseHistory.length, 1);
const expiredOffer = purchaseBazaarOffer({ ...bazaarArgs, now: new Date(bazaarNow.getTime() + 600000) });
assert.equal(expiredOffer.success, false);
assert.equal(expiredOffer.guild.gold, bazaarGuild.gold);
const noBazaarGold = purchaseBazaarOffer({ ...bazaarArgs, guild: { ...bazaarGuild, gold: 0 } });
assert.equal(noBazaarGold.success, false);
const noBazaarSpace = purchaseBazaarOffer({ ...bazaarArgs, character: { ...hero, capacityMax: -1 }, deliveryTarget: 'character_inventory' });
assert.equal(noBazaarSpace.success, false);
assert.equal(noBazaarSpace.guild.gold, bazaarGuild.gold);
assert.equal(noBazaarSpace.guild.bazaar.purchaseHistory.length, 0);
assert.equal(JSON.stringify(bazaarArgs), bazaarBefore);
console.log('PASS: Bazaar repeat purchase, expired rotation, insufficient gold/capacity and immutable input');
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
