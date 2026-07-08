import { useEffect, useMemo, useState } from "react";
import { calculateBossRisk } from "../../game-engine/boss/calculateBossRisk";
import { calculateCharmBonusesForHunt } from "../../game-engine/bestiary/calculateCharmBonusesForHunt";
import { calculateMonsterFocusBonuses } from "../../game-engine/monster-focus/calculateMonsterFocusBonuses";
import { calculateDestinyBonuses } from "../../game-engine/destiny/calculateDestinyBonuses";
import { calculateSupplyUsage } from "../../game-engine/supplies/calculateSupplyUsage";
import { calculateTrainingGain } from "../../game-engine/progression/calculateTrainingGain";
import { getItemById } from "../../data/items";
import { SKILL_LABELS } from "../../shared/constants";
import { formatDuration, getClockElapsedMs, getClockRemainingMs } from "../../shared/time";
import type { Boss, BossParty, Character, GuildBestiaryState, HuntArea, Quest } from "../../shared/types";

interface ActionAnalyzerProps {
  character: Character;
  characters: Character[];
  hunts: HuntArea[];
  quests: Quest[];
  bosses: Boss[];
  bossParty: BossParty;
  bestiary?: GuildBestiaryState;
}

export function ActionAnalyzer({
  character,
  characters,
  hunts,
  quests,
  bosses,
  bossParty,
  bestiary,
}: ActionAnalyzerProps) {
  const action = character.currentAction;
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!action && !character.deathState) return undefined;

    const interval = window.setInterval(() => setTick((current) => current + 1), 1000);

    return () => window.clearInterval(interval);
  }, [action, character.deathState]);

  const rows = useMemo(() => {
    if (character.status === "dead" && character.deathState) {
      const recoveryEndsAt = character.deathState.recoveryEndsAt
        ? new Date(character.deathState.recoveryEndsAt).getTime()
        : Date.now();
      const diedAt = new Date(character.deathState.diedAt).getTime();

      return [
        ["Morreu em", character.deathState.sourceName ?? "Desconhecido"],
        ["Causa", formatDeathCause(character.deathState.cause)],
        ["Desde a morte", formatDuration(Math.max(0, Date.now() - diedAt))],
        ["Recovery", formatDuration(Math.max(0, recoveryEndsAt - Date.now()))],
        ["XP perdida", character.deathState.penalty.experienceLost.toLocaleString("en-US")],
        ["Gold perdido", character.deathState.penalty.goldLost.toLocaleString("en-US")],
        ["Bless", character.deathState.penalty.blessProtected ? "Usada" : "Nenhuma"],
        ["Templo", character.deathState.templeName],
      ];
    }

    if (!action) return [];

    const totalMs = Math.max(1, (action.durationMinutes ?? 1) * 60_000);
    const isReadyToResolve = action.readyToResolve === true;
    const elapsedMs = isReadyToResolve ? totalMs : getClockElapsedMs(action.startedAt);
    const remainingMs = isReadyToResolve ? 0 : getClockRemainingMs(action.endsAt);
    const progress = isReadyToResolve ? 1 : Math.min(1, elapsedMs / totalMs);
    const common = [
      ["Tempo", `${formatDuration(elapsedMs)} / ${formatDuration(totalMs)}`],
      ["Restante", formatDuration(remainingMs)],
      ["Progresso", `${Math.round(progress * 100)}%`],
    ];

    if (action.type === "hunting") {
      const hunt = hunts.find((candidate) => candidate.id === action.targetId);
      const xpNow = Math.round((action.expectedXp ?? 0) * progress);
      const goldNow = Math.round((action.expectedGold ?? 0) * progress);
      const suppliesTotal = hunt
        ? calculateSupplyUsage(character, hunt, action.durationMinutes ?? 0)
            .reduce((sum, usage) => sum + usage.valueUsed, 0)
        : 0;
      const supplies = Math.round(suppliesTotal * progress);
      const supplyText = hunt
        ? calculateSupplyUsage(character, hunt, action.durationMinutes ?? 0)
            .map((usage) => `${usage.itemName} x${Math.ceil(usage.quantityUsed * progress)}`)
            .join(", ") || "Nenhum"
        : "Nenhum";
      const averageMonsterXp = hunt
        ? hunt.monsters.reduce((sum, monster) => sum + monster.experience, 0) / Math.max(1, hunt.monsters.length)
        : 1;
      const expectedKillsTotal = Math.max(1, Math.round((action.expectedXp ?? 0) / Math.max(1, averageMonsterXp)));
      const kills = Math.max(1, Math.round(expectedKillsTotal * progress));
      const lootValue = hunt ? Math.round(kills * estimateLootValuePerKill(hunt)) : 0;
      const liquidGold = goldNow - supplies;
      const charmBonuses = hunt ? calculateCharmBonusesForHunt(bestiary, hunt) : undefined;
      const focusBonuses = hunt ? calculateMonsterFocusBonuses(character, hunt) : undefined;
      const destinyBonuses = calculateDestinyBonuses(character);
      const focusSummary = focusBonuses?.applied[0];
      const estimatedMonsterKills = hunt
        ? hunt.monsters
            .map((monster) => `${monster.name} ~${Math.round(kills / Math.max(1, hunt.monsters.length))}`)
            .join(", ")
        : "Nenhum";

      return [
        ...common,
        ["XP atual", xpNow.toLocaleString("en-US")],
        ["Gold", goldNow.toLocaleString("en-US")],
        ["Loot est.", lootValue.toLocaleString("en-US")],
        ["Supplies", `-${supplies.toLocaleString("en-US")}`],
        ["Supply list", supplyText],
        ["Liquid gold", `${liquidGold >= 0 ? "+" : ""}${liquidGold.toLocaleString("en-US")}`],
        ["XP/h", (hunt?.estimatedXpPerHour ?? 0).toLocaleString("en-US")],
        ["Liquid/h", ((hunt?.estimatedGoldPerHour ?? 0) - (hunt?.supplyCostPerHour ?? 0)).toLocaleString("en-US")],
        ["Skill", `+${(progress * 1.25).toFixed(2)}%`],
        ["Kills", kills.toLocaleString("en-US")],
        ["Bestiary", estimatedMonsterKills],
        ["Charms", charmBonuses && charmBonuses.logs.length > 0 ? charmBonuses.logs.length.toString() : "Nenhum"],
        [
          "Monster Focus",
          focusSummary
            ? `${focusSummary.monsterName} / +${focusSummary.effectivePercent}% ${focusSummary.bonusType} / ${Math.max(0, focusSummary.remainingHunts - 1)} after`
            : "No active target",
        ],
        [
          "Destiny",
          [
            destinyBonuses.xpBonusPercent ? `XP +${destinyBonuses.xpBonusPercent}%` : undefined,
            destinyBonuses.goldBonusPercent ? `Gold +${destinyBonuses.goldBonusPercent}%` : undefined,
            destinyBonuses.supplyReductionPercent ? `Supplies -${destinyBonuses.supplyReductionPercent}%` : undefined,
            destinyBonuses.deathRiskReductionPercent ? `Risk -${destinyBonuses.deathRiskReductionPercent}%` : undefined,
          ].filter(Boolean).join(" / ") || "No hunt bonus",
        ],
      ];
    }

    if (action.type === "training" && action.targetSkill) {
      const gain = calculateTrainingGain(
        character,
        action.targetSkill,
        action.durationMinutes ?? 30,
        action.trainingType ?? "offline",
      );
      const expectedXp = action.expectedXp ?? 0;

      return [
        ...common,
        ["Skill alvo", SKILL_LABELS[action.targetSkill]],
        ["Ganho atual", `+${(gain * progress).toFixed(2)}%`],
        ["Ganho/h", `+${((gain / Math.max(1, action.durationMinutes ?? 1)) * 60).toFixed(2)}%`],
        ...(expectedXp > 0
          ? [
              ["XP atual", Math.round(expectedXp * progress).toLocaleString("en-US")],
              ["XP esperado", expectedXp.toLocaleString("en-US")],
            ]
          : []),
        ["Custo", `${(action.cost ?? 0).toLocaleString("en-US")}g`],
      ];
    }

    if (action.type === "questing") {
      const quest = quests.find((candidate) => candidate.id === action.targetId);
      const expectedXp = action.expectedXp ?? quest?.rewards.experience ?? 0;
      const xpNow = Math.round(expectedXp * progress);

      return [
        ...common,
        ["Quest", quest?.name ?? action.label],
        ["XP atual", xpNow.toLocaleString("en-US")],
        ["XP esperado", expectedXp.toLocaleString("en-US")],
        ["Gold esperado", (action.expectedGold ?? quest?.rewards.gold ?? 0).toLocaleString("en-US")],
        ["Acesso", quest?.unlocksAccess ?? "Nenhum"],
        ["Risco", quest?.risk ?? action.risk ?? "safe"],
      ];
    }

    if (action.type === "bossing") {
      const boss = bosses.find((candidate) => candidate.id === action.targetId);
      const risk = boss ? calculateBossRisk(characters, bossParty, boss) : undefined;
      const partyNames =
        action.partyMemberIds
          ?.map((characterId) => characters.find((candidate) => candidate.id === characterId)?.name)
          .filter(Boolean)
          .join(", ") ?? character.name;
      const expectedXp = action.expectedXp ?? boss?.reward.experience ?? 0;
      const xpNow = Math.round(expectedXp * progress);

      return [
        ...common,
        ["Boss", boss?.name ?? action.label],
        ["Party", partyNames],
        ["Sucesso", risk ? `${Math.round(risk.successChance * 100)}%` : "-"],
        ["Morte", risk ? `${Math.round(risk.deathChance * 100)}%` : "-"],
        ["XP atual", xpNow.toLocaleString("en-US")],
        ["XP esperado", expectedXp.toLocaleString("en-US")],
        ["Gold max", (boss?.reward.goldMax ?? 0).toLocaleString("en-US")],
      ];
    }

    if (action.type === "traveling") {
      return [
        ...common,
        ["Destino", action.targetName ?? character.city],
      ];
    }

    return common;
  }, [action, bestiary, bosses, bossParty, character, characters, hunts, quests, tick]);

  if (!action) {
    if (character.status === "dead") {
      return (
        <div className="action-analyzer">
          {rows.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="empty-list">
        Personagem parado. Escolha uma hunt, quest, boss ou treino nas abas correspondentes.
      </div>
    );
  }

  return (
    <div className="action-analyzer">
      {rows.map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

function formatDeathCause(cause: string) {
  if (cause === "hunt") return "Hunt";
  if (cause === "boss") return "Boss";
  if (cause === "quest") return "Quest";
  return "Desconhecida";
}

function estimateLootValuePerKill(hunt: HuntArea) {
  const totalValue = hunt.monsters.reduce((sum, monster) => {
    const monsterValue = monster.lootTable.reduce((lootSum, loot) => {
      if (loot.itemId === "gold-coin") return lootSum;

      const item = getItemById(loot.itemId);
      const averageQuantity = (loot.minQuantity + loot.maxQuantity) / 2;

      return lootSum + loot.chance * averageQuantity * item.value;
    }, 0);

    return sum + monsterValue;
  }, 0);

  return totalValue / Math.max(1, hunt.monsters.length);
}
