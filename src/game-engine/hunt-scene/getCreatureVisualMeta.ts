import type { Monster } from "../../shared/types";

export interface CreatureVisualMeta {
  symbol: string;
  tone: string;
}

export function getCreatureVisualMeta(monster?: Monster): CreatureVisualMeta {
  const name = monster?.name.toLowerCase() ?? "";

  if (!monster) return { symbol: "?", tone: "unknown" };
  if (name.includes("rat")) return { symbol: "RT", tone: "vermin" };
  if (name.includes("spider")) return { symbol: "SP", tone: "venom" };
  if (name.includes("troll")) return { symbol: "TR", tone: "forest" };
  if (name.includes("rot")) return { symbol: "MR", tone: "swamp" };
  if (name.includes("minotaur")) return { symbol: "MN", tone: "brute" };
  if (name.includes("orc")) return { symbol: "OR", tone: "brute" };
  if (name.includes("skeleton")) return { symbol: "SK", tone: "undead" };
  if (name.includes("cult")) return { symbol: "CL", tone: "occult" };
  if (name.includes("cyclops")) return { symbol: "CY", tone: "giant" };
  if (name.includes("dwarf")) return { symbol: "DW", tone: "guard" };
  if (name.includes("dragon")) return { symbol: "DG", tone: "fire" };
  if (name.includes("wyvern")) return { symbol: "WY", tone: "fire" };

  return { symbol: monster.name.slice(0, 2).toUpperCase(), tone: "wild" };
}
