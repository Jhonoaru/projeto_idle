import { calculateCharacterAttributes } from "../game-engine/character/calculateCharacterAttributes";
import { calculateCapacityUsed } from "../game-engine/inventory/calculateCapacityUsed";
import { normalizeCharacterCosmetics } from "../game-engine/collections/normalizeCharacterCosmetics";
import { normalizeDestinyState } from "../game-engine/destiny/normalizeDestinyState";
import { experienceToNextLevel } from "../game-engine/progression/experienceTable";
import { normalizeWeaponProficiencies } from "../game-engine/weapon-proficiency/weaponProficiencyProgression";
import { normalizeMonsterFocusState } from "../game-engine/monster-focus/normalizeMonsterFocusState";
import { createInventoryItem } from "./inventoryFactory";
import type {
  Character,
  EquipmentSlot,
  EquippedItems,
  InventoryItem,
  SkillName,
  SkillSet,
} from "../shared/types";

function skill(name: SkillName, level: number, progressPercent: number) {
  return { name, level, progressPercent };
}

function skills(levels: Record<SkillName, [number, number]>): SkillSet {
  return {
    sword: skill("sword", ...levels.sword),
    axe: skill("axe", ...levels.axe),
    club: skill("club", ...levels.club),
    distance: skill("distance", ...levels.distance),
    fist: skill("fist", ...levels.fist),
    shielding: skill("shielding", ...levels.shielding),
    magic: skill("magic", ...levels.magic),
  };
}

function createCharacter(
  character: Omit<Character, "attributes" | "capacityUsed" | "capacityMax">,
): Character {
  const characterWithProficiencies = {
    ...character,
    weaponProficiencies: normalizeWeaponProficiencies(character.weaponProficiencies),
    monsterFocus: normalizeMonsterFocusState(character.monsterFocus),
    destiny: normalizeDestinyState(character),
    cosmetics: normalizeCharacterCosmetics(character),
  };
  const attributes = calculateCharacterAttributes(characterWithProficiencies);

  return {
    ...characterWithProficiencies,
    attributes,
    capacityMax: attributes.capacity,
    capacityUsed: calculateCapacityUsed(character.inventory),
    experienceToNextLevel: experienceToNextLevel(character),
  };
}

function inventory(characterId: string, entries: Array<[string, number]>): InventoryItem[] {
  return entries.map(([itemId, quantity]) =>
    createInventoryItem(itemId, quantity, "character", characterId),
  );
}

function characterDepot(characterId: string, entries: Array<[string, number]>): InventoryItem[] {
  return entries.map(([itemId, quantity]) =>
    createInventoryItem(itemId, quantity, "character", characterId),
  );
}

function equipment(
  characterId: string,
  entries: Array<[EquipmentSlot, string]>,
): EquippedItems {
  return Object.fromEntries(
    entries.map(([slot, itemId]) => [
      slot,
      createInventoryItem(itemId, 1, "character", characterId),
    ]),
  ) as EquippedItems;
}

export const mockCharacters: Character[] = [
  createCharacter({
    id: "char-arkon",
    name: "Arkon",
    vocation: "Guardian",
    level: 32,
    experience: 428_500,
    experienceToNextLevel: 471_000,
    status: "hunting",
    city: "Thaeron",
    staminaHours: 35.5,
    gold: 1260,
    inventory: inventory("char-arkon", [
      ["health-potion", 4],
      ["rusty-blade", 1],
      ["rat-tail", 12],
    ]),
    characterDepot: characterDepot("char-arkon", [
      ["orc-leather", 5],
      ["iron-ore", 8],
    ]),
    equipment: equipment("char-arkon", [
      ["weapon", "worn-sword"],
      ["offhand", "wooden-shield"],
      ["armor", "leather-armor"],
    ]),
    completedQuestIds: ["quest-first-contract", "quest-sewer-clearance"],
    accessIds: ["thaeron-sewers-access"],
    bossCooldowns: [],
    questProgress: [],
    skills: skills({
      sword: [71, 42],
      axe: [64, 18],
      club: [58, 76],
      distance: [18, 10],
      fist: [24, 55],
      shielding: [78, 31],
      magic: [6, 12],
    }),
    currentAction: {
      type: "hunting",
      label: "Holding Minotaur Outpost",
      startedAt: "20:44",
      endsAt: "20:56",
      targetId: "hunt-minotaur-outpost",
      targetName: "Minotaur Outpost",
      risk: "medium",
      expectedXp: 3200,
      expectedGold: 120,
    },
    createdAt: "2026-06-28T20:10:00-03:00",
  }),
  createCharacter({
    id: "char-ayla",
    name: "Ayla",
    vocation: "Ranger",
    level: 28,
    experience: 301_200,
    experienceToNextLevel: 337_000,
    status: "training",
    city: "Thaeron",
    staminaHours: 39,
    gold: 840,
    inventory: inventory("char-ayla", [
      ["mana-potion", 5],
      ["light-quiver", 1],
    ]),
    characterDepot: characterDepot("char-ayla", [
      ["spider-silk", 10],
    ]),
    equipment: equipment("char-ayla", [
      ["weapon", "simple-bow"],
      ["offhand", "light-quiver"],
      ["boots", "leather-boots"],
    ]),
    completedQuestIds: ["quest-first-contract"],
    accessIds: ["thaeron-sewers-access"],
    bossCooldowns: [],
    questProgress: [],
    skills: skills({
      sword: [22, 15],
      axe: [18, 40],
      club: [16, 8],
      distance: [82, 64],
      fist: [28, 25],
      shielding: [46, 52],
      magic: [12, 44],
    }),
    currentAction: {
      type: "training",
      label: "Distance drills",
      startedAt: "20:35",
      endsAt: "21:05",
      targetName: "Thaeron Archery Yard",
      expectedXp: 1200,
    },
    createdAt: "2026-06-28T20:10:00-03:00",
  }),
  createCharacter({
    id: "char-mira",
    name: "Mira",
    vocation: "Arcanist",
    level: 24,
    experience: 198_400,
    experienceToNextLevel: 226_000,
    status: "questing",
    city: "Eldoria",
    staminaHours: 31.25,
    gold: 630,
    inventory: inventory("char-mira", [
      ["mana-potion", 8],
      ["mystic-cap", 1],
    ]),
    characterDepot: characterDepot("char-mira", [
      ["enchanted-dust", 1],
      ["ancient-bone", 6],
    ]),
    equipment: equipment("char-mira", [
      ["weapon", "novice-wand"],
      ["armor", "apprentice-robe"],
    ]),
    completedQuestIds: ["quest-first-contract"],
    accessIds: ["thaeron-sewers-access"],
    bossCooldowns: [],
    questProgress: [
      {
        questId: "quest-mudrot-investigation",
        status: "in_progress",
        currentStepIndex: 0,
        startedAt: "2026-06-28T20:28:00-03:00",
        endsAt: "2026-06-28T20:58:00-03:00",
      },
    ],
    skills: skills({
      sword: [12, 5],
      axe: [10, 22],
      club: [19, 48],
      distance: [14, 11],
      fist: [18, 70],
      shielding: [28, 36],
      magic: [67, 58],
    }),
    currentAction: {
      type: "questing",
      label: "Mudrot Investigation",
      startedAt: "20:28",
      endsAt: "20:58",
      durationMinutes: 30,
      targetId: "quest-mudrot-investigation",
      targetName: "Mudrot Investigation",
      risk: "low",
      expectedXp: 2200,
      expectedGold: 1200,
    },
    createdAt: "2026-06-28T20:10:00-03:00",
  }),
  createCharacter({
    id: "char-lyra",
    name: "Lyra",
    vocation: "Warden",
    level: 26,
    experience: 246_900,
    experienceToNextLevel: 279_000,
    status: "idle",
    city: "Greenport",
    staminaHours: 42,
    gold: 910,
    inventory: inventory("char-lyra", [
      ["leather-armor", 1],
      ["mana-potion", 6],
      ["small-amulet", 1],
    ]),
    characterDepot: characterDepot("char-lyra", [
      ["old-cloth", 9],
    ]),
    equipment: equipment("char-lyra", [
      ["weapon", "novice-wand"],
      ["helmet", "mystic-cap"],
    ]),
    completedQuestIds: ["quest-first-contract"],
    accessIds: ["thaeron-sewers-access"],
    bossCooldowns: [],
    questProgress: [],
    skills: skills({
      sword: [18, 14],
      axe: [16, 9],
      club: [21, 20],
      distance: [20, 66],
      fist: [24, 41],
      shielding: [39, 88],
      magic: [61, 27],
    }),
    createdAt: "2026-06-28T20:10:00-03:00",
  }),
  createCharacter({
    id: "char-shen",
    name: "Shen",
    vocation: "Monk",
    level: 22,
    experience: 152_800,
    experienceToNextLevel: 176_000,
    status: "traveling",
    city: "Eldenroot",
    staminaHours: 36.75,
    gold: 520,
    inventory: inventory("char-shen", [
      ["health-potion", 3],
      ["cloth-sash", 1],
    ]),
    characterDepot: characterDepot("char-shen", [
      ["broken-fang", 7],
    ]),
    equipment: equipment("char-shen", [
      ["weapon", "monk-wraps"],
      ["armor", "leather-armor"],
    ]),
    completedQuestIds: ["quest-first-contract"],
    accessIds: ["thaeron-sewers-access"],
    bossCooldowns: [],
    questProgress: [],
    skills: skills({
      sword: [24, 38],
      axe: [19, 15],
      club: [29, 57],
      distance: [17, 42],
      fist: [74, 19],
      shielding: [51, 73],
      magic: [25, 32],
    }),
    currentAction: {
      type: "traveling",
      label: "Crossing to Thaeron",
      startedAt: "20:50",
      endsAt: "21:20",
      targetName: "Thaeron",
    },
    createdAt: "2026-06-28T20:10:00-03:00",
  }),
];
