import type { Vocation } from "../shared/types";

export type CombatEffectKind = "melee" | "ranged" | "arcane" | "nature" | "spirit";

export interface CombatEffectProfile {
  kind: CombatEffectKind;
  accent: string;
  secondary: string;
}

export const combatEffectProfiles: Readonly<Record<Vocation, CombatEffectProfile>> = {
  Guardian: { kind: "melee", accent: "#f2c15e", secondary: "#fff0b0" },
  Ranger: { kind: "ranged", accent: "#8ed36f", secondary: "#d9ef9a" },
  Arcanist: { kind: "arcane", accent: "#74bff1", secondary: "#b891ff" },
  Warden: { kind: "nature", accent: "#63d29b", secondary: "#d8df7a" },
  Monk: { kind: "spirit", accent: "#f19b58", secondary: "#72d7cf" },
};

export function getCombatEffectProfile(vocation: Vocation): CombatEffectProfile {
  return combatEffectProfiles[vocation];
}

export function getHuntEffectTarget(position?: string): { x: number; y: number } {
  const targets: Record<string, { x: number; y: number }> = {
    "top-left": { x: 14, y: 16 },
    "top-right": { x: 86, y: 16 },
    left: { x: 11, y: 50 },
    right: { x: 89, y: 50 },
    "bottom-left": { x: 18, y: 82 },
    "bottom-right": { x: 82, y: 82 },
  };

  return targets[position ?? ""] ?? { x: 73, y: 34 };
}
