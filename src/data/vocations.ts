import type { SkillName, Vocation } from "../shared/types";

export interface VocationConfig {
  role: string;
  mainSkills: SkillName[];
  healthPerLevel: number;
  manaPerLevel: number;
  capacityPerLevel: number;
  speedPerLevel: number;
  attackMultiplier: number;
  defenseMultiplier: number;
  sustainMultiplier: number;
  description: string;
}

export const VOCATION_CONFIGS: Record<Vocation, VocationConfig> = {
  Guardian: {
    role: "tank/melee",
    mainSkills: ["sword", "axe", "club"],
    healthPerLevel: 18,
    manaPerLevel: 4,
    capacityPerLevel: 18,
    speedPerLevel: 1.2,
    attackMultiplier: 1.05,
    defenseMultiplier: 1.35,
    sustainMultiplier: 1.15,
    description: "High health, low mana, heavy capacity, and strong defense.",
  },
  Ranger: {
    role: "distance/single target",
    mainSkills: ["distance"],
    healthPerLevel: 12,
    manaPerLevel: 8,
    capacityPerLevel: 12,
    speedPerLevel: 1.55,
    attackMultiplier: 1.28,
    defenseMultiplier: 0.95,
    sustainMultiplier: 1,
    description: "Medium health and mana with strong solo ranged damage.",
  },
  Arcanist: {
    role: "offensive magic",
    mainSkills: ["magic"],
    healthPerLevel: 7,
    manaPerLevel: 20,
    capacityPerLevel: 8,
    speedPerLevel: 1.35,
    attackMultiplier: 1.45,
    defenseMultiplier: 0.72,
    sustainMultiplier: 0.85,
    description: "Low health, high mana, high damage, and fragile defenses.",
  },
  Warden: {
    role: "healer/support",
    mainSkills: ["magic"],
    healthPerLevel: 10,
    manaPerLevel: 17,
    capacityPerLevel: 10,
    speedPerLevel: 1.3,
    attackMultiplier: 1.02,
    defenseMultiplier: 0.9,
    sustainMultiplier: 1.35,
    description: "Support-focused caster with strong mana and sustain.",
  },
  Monk: {
    role: "hybrid melee/support",
    mainSkills: ["fist"],
    healthPerLevel: 13,
    manaPerLevel: 10,
    capacityPerLevel: 11,
    speedPerLevel: 1.45,
    attackMultiplier: 1.12,
    defenseMultiplier: 1.05,
    sustainMultiplier: 1.2,
    description: "Balanced melee support with fist scaling and medium sustain.",
  },
};
