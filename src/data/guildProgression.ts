export interface GuildProgressionMilestoneDefinition {
  level: number;
  rank: string;
  title: string;
  requiredRenown: number;
  rosterCapacity: number;
  candidateId: string;
  description: string;
}

export const guildProgressionMilestones: readonly GuildProgressionMilestoneDefinition[] = [
  {
    level: 1,
    rank: "E",
    title: "Founding Company",
    requiredRenown: 0,
    rosterCapacity: 6,
    candidateId: "tessa-vale",
    description: "Registers the first local contract and one additional roster place.",
  },
  {
    level: 2,
    rank: "D",
    title: "Recognized Company",
    requiredRenown: 10,
    rosterCapacity: 7,
    candidateId: "corin-fletch",
    description: "Recognized field work attracts a regional scout and expands the roster.",
  },
  {
    level: 3,
    rank: "C",
    title: "Established Guild",
    requiredRenown: 25,
    rosterCapacity: 8,
    candidateId: "elis-dawn",
    description: "A stable campaign hall can support a permanent field healer.",
  },
  {
    level: 4,
    rank: "B",
    title: "Veteran Guild",
    requiredRenown: 50,
    rosterCapacity: 9,
    candidateId: "bram-reed",
    description: "Veteran standing opens a disciplined close-combat contract.",
  },
  {
    level: 5,
    rank: "A",
    title: "Renowned Guild",
    requiredRenown: 90,
    rosterCapacity: 10,
    candidateId: "veyra-rune",
    description: "Regional renown brings an experienced arcane specialist to the board.",
  },
  {
    level: 6,
    rank: "S",
    title: "Master Guild",
    requiredRenown: 140,
    rosterCapacity: 11,
    candidateId: "sable-rook",
    description: "Master standing unlocks the final chartered roster place and contract.",
  },
];
