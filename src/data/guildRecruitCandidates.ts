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
  minimumGuildLevel: number;
  minimumCareerPoints: number;
  skills: Record<SkillName, number>;
  equipment: Partial<Record<EquipmentSlot, string>>;
  inventory: Array<{ itemId: string; quantity: number }>;
}

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
    minimumGuildLevel: 1,
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
    minimumGuildLevel: 2,
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
    minimumGuildLevel: 3,
    minimumCareerPoints: 250,
    skills: skillLevels({ magic: 28, shielding: 18, club: 14 }),
    equipment: { weapon: "novice-wand", helmet: "mystic-cap", armor: "apprentice-robe" },
    inventory: [{ itemId: "mana-potion", quantity: 3 }],
  },
  {
    id: "bram-reed",
    characterId: "recruit-bram-reed",
    name: "Bram Reed",
    vocation: "Monk",
    title: "Road Disciple",
    description: "A measured close-combat specialist seeking a veteran hall with work beyond arena drills.",
    sigil: "BR",
    city: "Eldenroot",
    level: 14,
    hireCost: 1_800,
    minimumGuildLevel: 4,
    minimumCareerPoints: 400,
    skills: skillLevels({ fist: 38, shielding: 26, magic: 12 }),
    equipment: { weapon: "iron-handwraps", armor: "leather-armor", amulet: "cloth-sash" },
    inventory: [{ itemId: "health-potion", quantity: 3 }],
  },
  {
    id: "veyra-rune",
    characterId: "recruit-veyra-rune",
    name: "Veyra Rune",
    vocation: "Arcanist",
    title: "Seal Reader",
    description: "An arcane field reader drawn by a guild whose name now carries across regional archives.",
    sigil: "VR",
    city: "Eldoria",
    level: 18,
    hireCost: 3_000,
    minimumGuildLevel: 5,
    minimumCareerPoints: 600,
    skills: skillLevels({ magic: 45, shielding: 25, club: 20 }),
    equipment: { weapon: "runed-wand", helmet: "mystic-cap", armor: "apprentice-robe" },
    inventory: [{ itemId: "mana-potion", quantity: 5 }],
  },
  {
    id: "sable-rook",
    characterId: "recruit-sable-rook",
    name: "Sable Rook",
    vocation: "Ranger",
    title: "Frontier Pathfinder",
    description: "A veteran pathfinder willing to sign only with a master guild capable of sustaining long routes.",
    sigil: "SR",
    city: "Greenport",
    level: 22,
    hireCost: 4_500,
    minimumGuildLevel: 6,
    minimumCareerPoints: 900,
    skills: skillLevels({ distance: 52, shielding: 31, magic: 10 }),
    equipment: { weapon: "ironwood-bow", offhand: "ranger-gloves", boots: "leather-boots" },
    inventory: [{ itemId: "mana-potion", quantity: 5 }],
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
