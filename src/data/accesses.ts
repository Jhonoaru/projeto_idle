import type { AccessKey } from "../shared/types";

export const accesses: AccessKey[] = [
  {
    id: "thaeron-sewers-access",
    name: "Thaeron Sewers Access",
    description: "Permission to clear the old tunnels below Thaeron.",
  },
  {
    id: "mudrot-cave-access",
    name: "Mudrot Cave Access",
    description: "A marked route through the wet caves outside Thaeron.",
  },
  {
    id: "ancient-crypt-access",
    name: "Ancient Crypt Permission",
    description: "Eldoria's seal to enter sealed crypt corridors.",
  },
  {
    id: "cyclops-hills-access",
    name: "Cyclops Hills Passage",
    description: "Khazgrim passage papers for the upper hills.",
  },
  {
    id: "ember-dragon-nest-access",
    name: "Ember Dragon Nest Access",
    description: "Ritual clearance to enter the ember nesting grounds.",
  },
  {
    id: "novice-boss-access",
    name: "Novice Boss Trial Access",
    description: "Proof that the guild may challenge a novice trial.",
  },
];

export function getAccessName(accessId?: string) {
  if (!accessId) return undefined;
  return accesses.find((access) => access.id === accessId)?.name ?? accessId;
}
