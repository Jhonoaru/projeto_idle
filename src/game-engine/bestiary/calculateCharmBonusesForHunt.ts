import { normalizeBestiaryState } from "./getBestiaryProgress";
import { getCharmById } from "../../data/charms";
import type { CharmHuntBonuses, GuildBestiaryState, HuntArea } from "../../shared/types";

export function calculateCharmBonusesForHunt(
  bestiary: GuildBestiaryState | undefined,
  hunt: HuntArea,
): CharmHuntBonuses {
  const state = normalizeBestiaryState(bestiary);
  const monsterCount = Math.max(1, hunt.monsters.length);
  let xpBonus = 0;
  let goldBonus = 0;
  let lootBonus = 0;
  let defenseReduction = 0;
  let supplyReduction = 0;
  const logs: string[] = [];

  for (const monster of hunt.monsters) {
    const assignment = state.activeCharms.find((entry) => entry.monsterId === monster.id);
    const charm = getCharmById(assignment?.charmId);
    if (!assignment || !charm) continue;

    const proportionalBonus = charm.effectPercent / 100 / monsterCount;
    const percentLabel = (proportionalBonus * 100).toFixed(1).replace(".0", "");

    if (charm.type === "xp") xpBonus += proportionalBonus;
    if (charm.type === "gold") goldBonus += proportionalBonus;
    if (charm.type === "loot") lootBonus += proportionalBonus;
    if (charm.type === "defense") defenseReduction += proportionalBonus;
    if (charm.type === "supply") supplyReduction += proportionalBonus;

    logs.push(`Charm bonus applied: ${charm.name} em ${monster.name} (${percentLabel}% ${formatCharmType(charm.type)}).`);
  }

  return {
    xpMultiplier: 1 + xpBonus,
    goldMultiplier: 1 + goldBonus,
    lootMultiplier: 1 + lootBonus,
    deathRiskMultiplier: Math.max(0.5, 1 - defenseReduction),
    supplyMultiplier: Math.max(0.5, 1 - supplyReduction),
    logs,
  };
}

function formatCharmType(type: string) {
  if (type === "xp") return "XP";
  if (type === "gold") return "gold";
  if (type === "loot") return "loot";
  if (type === "defense") return "risk reduction";
  if (type === "supply") return "supplies";
  return type;
}
