import { useEffect, useMemo, useState } from "react";
import { calculateBossRisk } from "../../game-engine/boss/calculateBossRisk";
import { calculateSupplyUsage } from "../../game-engine/supplies/calculateSupplyUsage";
import { calculateTrainingGain } from "../../game-engine/progression/calculateTrainingGain";
import { SKILL_LABELS } from "../../shared/constants";
import { formatDuration, getClockElapsedMs, getClockRemainingMs } from "../../shared/time";
import type { Boss, BossParty, Character, HuntArea, Quest } from "../../shared/types";

interface ActionAnalyzerProps {
  character: Character;
  characters: Character[];
  hunts: HuntArea[];
  quests: Quest[];
  bosses: Boss[];
  bossParty: BossParty;
}

export function ActionAnalyzer({
  character,
  characters,
  hunts,
  quests,
  bosses,
  bossParty,
}: ActionAnalyzerProps) {
  const action = character.currentAction;
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!action) return undefined;

    const interval = window.setInterval(() => setTick((current) => current + 1), 1000);

    return () => window.clearInterval(interval);
  }, [action]);

  const rows = useMemo(() => {
    if (!action) return [];

    const elapsedMs = getClockElapsedMs(action.startedAt);
    const remainingMs = getClockRemainingMs(action.endsAt);
    const totalMs = Math.max(1, (action.durationMinutes ?? 1) * 60_000);
    const progress = Math.min(1, elapsedMs / totalMs);
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
      const lootValue = Math.round(goldNow * 1.8);
      const profit = goldNow + lootValue - supplies;
      const kills = Math.max(1, Math.round(((action.durationMinutes ?? 0) * progress) * 5));

      return [
        ...common,
        ["XP atual", xpNow.toLocaleString("en-US")],
        ["Gold", goldNow.toLocaleString("en-US")],
        ["Loot", lootValue.toLocaleString("en-US")],
        ["Supplies", `-${supplies.toLocaleString("en-US")}`],
        ["Supply list", supplyText],
        ["Balance", `${profit >= 0 ? "+" : ""}${profit.toLocaleString("en-US")}`],
        ["XP/h", (hunt?.estimatedXpPerHour ?? 0).toLocaleString("en-US")],
        ["Profit/h", ((hunt?.estimatedGoldPerHour ?? 0) - (hunt?.supplyCostPerHour ?? 0)).toLocaleString("en-US")],
        ["Skill", `+${(progress * 1.25).toFixed(2)}%`],
        ["Kills", kills.toLocaleString("en-US")],
      ];
    }

    if (action.type === "training" && action.targetSkill) {
      const gain = calculateTrainingGain(
        character,
        action.targetSkill,
        action.durationMinutes ?? 30,
        action.trainingType ?? "offline",
      );

      return [
        ...common,
        ["Skill alvo", SKILL_LABELS[action.targetSkill]],
        ["Ganho atual", `+${(gain * progress).toFixed(2)}%`],
        ["Ganho/h", `+${((gain / Math.max(1, action.durationMinutes ?? 1)) * 60).toFixed(2)}%`],
        ["Custo", `${(action.cost ?? 0).toLocaleString("en-US")}g`],
      ];
    }

    if (action.type === "questing") {
      const quest = quests.find((candidate) => candidate.id === action.targetId);

      return [
        ...common,
        ["Quest", quest?.name ?? action.label],
        ["XP esperado", (quest?.rewards.experience ?? 0).toLocaleString("en-US")],
        ["Gold esperado", (quest?.rewards.gold ?? 0).toLocaleString("en-US")],
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

      return [
        ...common,
        ["Boss", boss?.name ?? action.label],
        ["Party", partyNames],
        ["Sucesso", risk ? `${Math.round(risk.successChance * 100)}%` : "-"],
        ["Morte", risk ? `${Math.round(risk.deathChance * 100)}%` : "-"],
        ["XP esperado", (boss?.reward.experience ?? 0).toLocaleString("en-US")],
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
  }, [action, bosses, bossParty, character, characters, hunts, quests, tick]);

  if (!action) {
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
