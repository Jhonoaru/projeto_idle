import type { EquipmentSlot, SkillName, Vocation } from "../shared/types";

export interface GuildRecruitCandidateDefinition {
  id: string;
  characterId: string;
  name: string;
  vocation: Vocation;
  title: string;
  description: string;
  sigil: string;
  city: string;
  level: number;
  hireCost: number;
  minimumCareerPoints: number;
  skills: Record<SkillName, number>;
  equipment: Partial<Record<EquipmentSlot, string>>;
  inventory: Array<{ itemId: string; quantity: number }>;
}

export const MAX_GUILD_ROSTER_SIZE = 8;

export const guildRecruitCandidates: GuildRecruitCandidateDefinition[] = [
  {
    id: "tessa-vale",
    characterId: "recruit-tessa-vale",
    name: "Tessa Vale",
    vocation: "Guardian",
    title: "Road Warden",
    description: "A disciplined caravan guard looking for steady work and a hall worth defending.",
    sigil: "TV",
    city: "Thaeron",
    level: 4,
    hireCost: 300,
    minimumCareerPoints: 0,
    skills: skillLevels({ sword: 18, shielding: 16 }),
    equipment: { weapon: "worn-sword", offhand: "wooden-shield", armor: "leather-armor" },
    inventory: [{ itemId: "minor-health-potion", quantity: 2 }],
  },
  {
    id: "corin-fletch",
    characterId: "recruit-corin-fletch",
    name: "Corin Fletch",
    vocation: "Ranger",
    title: "Trail Scout",
    description: "A patient trail scout who favors careful routes over risky promises of quick fortune.",
    sigil: "CF",
    city: "Greenport",
    level: 7,
    hireCost: 650,
    minimumCareerPoints: 100,
    skills: skillLevels({ distance: 24, shielding: 15, magic: 3 }),
    equipment: { weapon: "simple-bow", offhand: "light-quiver", boots: "leather-boots" },
    inventory: [{ itemId: "mana-potion", quantity: 2 }],
  },
  {
    id: "elis-dawn",
    characterId: "recruit-elis-dawn",
    name: "Elis Dawn",
    vocation: "Warden",
    title: "Wayside Healer",
    description: "A young field healer prepared to support long expeditions without eclipsing veteran adventurers.",
    sigil: "ED",
    city: "Eldenroot",
    level: 10,
    hireCost: 1_100,
    minimumCareerPoints: 250,
    skills: skillLevels({ magic: 28, shielding: 18, club: 14 }),
    equipment: { weapon: "novice-wand", helmet: "mystic-cap", armor: "apprentice-robe" },
    inventory: [{ itemId: "mana-potion", quantity: 3 }],
  },
];

export function getGuildRecruitCandidate(candidateId: string | undefined) {
  return guildRecruitCandidates.find((candidate) => candidate.id === candidateId);
}

function skillLevels(overrides: Partial<Record<SkillName, number>>): Record<SkillName, number> {
  return {
    sword: overrides.sword ?? 8,
    axe: overrides.axe ?? 8,
    club: overrides.club ?? 8,
    distance: overrides.distance ?? 7,
    fist: overrides.fist ?? 10,
    shielding: overrides.shielding ?? 10,
    magic: overrides.magic ?? 1,
  };
}
