export const GAME_TITLE = "Guild Hunt Idle";

export const MAX_STAMINA = 100;

export const VOCATION_LABELS = {
  Guardian: "Guardian",
  Ranger: "Ranger",
  Arcanist: "Arcanist",
  Warden: "Warden",
  Monk: "Monk",
} as const;

export const CHARACTER_STATUS_LABELS = {
  idle: "Idle",
  hunting: "Hunting",
  training: "Training",
  questing: "Questing",
  bossing: "Bossing",
  traveling: "Traveling",
  dead: "Dead",
} as const;

export const SKILL_LABELS = {
  sword: "Sword",
  axe: "Axe",
  club: "Club",
  distance: "Distance",
  fist: "Fist",
  shielding: "Shielding",
  magic: "Magic",
} as const;
