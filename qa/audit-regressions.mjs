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

const { mockCharacters } = await import('../src/data/mockCharacters.ts');
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
const started = startHunt(hero, hunts[0], 30);
const training = startTraining(hero, 'offline', 'sword', 30, 0);
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
