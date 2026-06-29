export type Vocation = "Guardian" | "Ranger" | "Arcanist" | "Warden" | "Monk";

export type CharacterStatus =
  | "idle"
  | "hunting"
  | "training"
  | "questing"
  | "bossing"
  | "traveling"
  | "dead";

export type SkillName =
  | "sword"
  | "axe"
  | "club"
  | "distance"
  | "fist"
  | "shielding"
  | "magic";

export type TrainingType = "offline" | "exercise" | "dummy";

export type TrainingTarget = SkillName;

export type HuntRisk = "safe" | "low" | "medium" | "high" | "deadly";

export type BossType = "solo" | "party" | "world";

export type BossRisk = "safe" | "low" | "medium" | "high" | "deadly";

export type BossStatus = "locked" | "available" | "cooldown" | "in_progress";

export type PartyRole = "tank" | "healer" | "damage" | "support";

export type QuestStatus = "locked" | "available" | "in_progress" | "completed" | "failed";

export type QuestType = "access" | "story" | "daily" | "boss_access" | "tutorial";

export type QuestRisk = "safe" | "low" | "medium" | "high" | "deadly";

export type ItemRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export type ItemType =
  | "gold"
  | "creature_product"
  | "equipment"
  | "consumable"
  | "material"
  | "quest"
  | "misc";

export type EquipmentSlot =
  | "helmet"
  | "armor"
  | "legs"
  | "boots"
  | "weapon"
  | "shield"
  | "amulet"
  | "ring"
  | "backpack"
  | "ammo";

export interface Guild {
  id: string;
  name: string;
  gold: number;
  renown: number;
  rank: string;
  level: number;
}

export interface SkillSet {
  sword: Skill;
  axe: Skill;
  club: Skill;
  distance: Skill;
  fist: Skill;
  shielding: Skill;
  magic: Skill;
}

export interface Skill {
  name: SkillName;
  level: number;
  progressPercent: number;
}

export interface CharacterAttributes {
  maxHealth: number;
  maxMana: number;
  capacity: number;
  speed: number;
  attackPower: number;
  defensePower: number;
  armor: number;
}

export interface CharacterAction {
  type: CharacterStatus;
  label: string;
  startedAt: string;
  endsAt: string;
  durationMinutes?: number;
  targetId?: string;
  targetName?: string;
  risk?: HuntRisk;
  expectedXp?: number;
  expectedGold?: number;
  trainingType?: TrainingType;
  targetSkill?: TrainingTarget;
  secondarySkill?: TrainingTarget;
  cost?: number;
  expectedGainPercent?: number;
  partyMemberIds?: string[];
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  weight: number;
  value: number;
  stackable: boolean;
  description: string;
  equipmentSlot?: EquipmentSlot;
  attack?: number;
  defense?: number;
  armor?: number;
  magicPower?: number;
  distancePower?: number;
  fistPower?: number;
  capacityBonus?: number;
  healthBonus?: number;
  manaBonus?: number;
  speedBonus?: number;
  vocationRestriction?: Vocation[];
  levelRequirement?: number;
}

export interface InventoryItem {
  id: string;
  itemId: string;
  item: Item;
  quantity: number;
  ownerCharacterId?: string;
  location: "character" | "guildDepot";
}

export interface Inventory {
  characterId: string;
  items: InventoryItem[];
  capacityUsed: number;
  capacityMax: number;
}

export interface GuildDepot {
  items: InventoryItem[];
  capacityUsed?: number;
  goldStored: number;
}

export interface EquippedItems {
  helmet?: InventoryItem;
  armor?: InventoryItem;
  legs?: InventoryItem;
  boots?: InventoryItem;
  weapon?: InventoryItem;
  shield?: InventoryItem;
  amulet?: InventoryItem;
  ring?: InventoryItem;
  backpack?: InventoryItem;
  ammo?: InventoryItem;
}

export interface EquipmentBonuses {
  attack: number;
  defense: number;
  armor: number;
  magicPower: number;
  distancePower: number;
  fistPower: number;
  capacityBonus: number;
  healthBonus: number;
  manaBonus: number;
  speedBonus: number;
}

export interface TrainingSession {
  id: string;
  characterId: string;
  type: TrainingType;
  targetSkill: TrainingTarget;
  secondarySkill?: TrainingTarget;
  startedAt: string;
  endsAt: string;
  durationMinutes: number;
  cost: number;
  expectedGainPercent: number;
  label: string;
}

export interface AccessKey {
  id: string;
  name: string;
  description: string;
}

export interface QuestReward {
  gold?: number;
  renown?: number;
  experience?: number;
  itemIds?: string[];
}

export interface QuestRequiredItem {
  itemId: string;
  quantity: number;
}

export interface QuestStep {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  risk: QuestRisk;
  requiredLevel?: number;
  requiredItems?: QuestRequiredItem[];
  consumesItems?: boolean;
  rewards?: QuestReward;
}

export interface Quest {
  id: string;
  name: string;
  type: QuestType;
  city: string;
  description: string;
  requiredLevel: number;
  requiredAccess?: string;
  requiredQuestIds?: string[];
  recommendedVocations?: Vocation[];
  totalDurationMinutes: number;
  risk: QuestRisk;
  steps: QuestStep[];
  rewards: QuestReward;
  unlocksAccess?: string;
  tags: string[];
}

export interface CharacterQuestProgress {
  questId: string;
  status: QuestStatus;
  currentStepIndex: number;
  startedAt?: string;
  endsAt?: string;
  completedAt?: string;
}

export interface LevelUpResult {
  oldLevel: number;
  newLevel: number;
  experienceRemaining: number;
  levelsGained: number;
}

export interface SkillGainResult {
  skillName: SkillName;
  oldLevel: number;
  newLevel: number;
  oldProgressPercent: number;
  newProgressPercent: number;
  levelsGained: number;
}

export interface LootItem {
  itemId: string;
  chance: number;
  minQuantity: number;
  maxQuantity: number;
}

export interface BossReward {
  goldMin: number;
  goldMax: number;
  experience: number;
  lootTable: LootItem[];
  renown?: number;
}

export interface BossRequirement {
  requiredLevel: number;
  requiredAccessIds?: string[];
  requiredQuestIds?: string[];
  requiredVocations?: Vocation[];
  minPartySize: number;
  maxPartySize: number;
  requiredRoles?: Partial<Record<PartyRole, number>>;
}

export interface Boss {
  id: string;
  name: string;
  type: BossType;
  city: string;
  description: string;
  durationMinutes: number;
  cooldownHours: number;
  risk: BossRisk;
  requirements: BossRequirement;
  reward: BossReward;
  tags: string[];
}

export interface BossCooldown {
  bossId: string;
  characterId: string;
  availableAt: string;
  defeatedAt?: string;
}

export interface PartyMember {
  characterId: string;
  role: PartyRole;
}

export interface BossParty {
  bossId: string;
  members: PartyMember[];
}

export interface BossLootResult {
  itemId: string;
  itemName: string;
  quantity: number;
  totalValue: number;
  rarity: ItemRarity;
  weightTotal: number;
  item: Item;
}

export interface BossSimulationResult {
  success: boolean;
  diedCharacterIds: string[];
  defeated: boolean;
  bossId: string;
  bossName: string;
  durationMinutes: number;
  experienceGained: number;
  goldGained: number;
  loot: BossLootResult[];
  renownGained: number;
  cooldownsApplied: BossCooldown[];
  logs: string[];
}

export interface Monster {
  id: string;
  name: string;
  level: number;
  health: number;
  experience: number;
  minDamage: number;
  maxDamage: number;
  armor: number;
  defense: number;
  goldMin: number;
  goldMax: number;
  lootTable: LootItem[];
}

export interface Character {
  id: string;
  name: string;
  vocation: Vocation;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  status: CharacterStatus;
  city: string;
  staminaHours: number;
  gold: number;
  inventory: InventoryItem[];
  equipment: EquippedItems;
  capacityUsed: number;
  capacityMax: number;
  completedQuestIds: string[];
  accessIds: string[];
  bossCooldowns: BossCooldown[];
  questProgress: CharacterQuestProgress[];
  skills: SkillSet;
  attributes: CharacterAttributes;
  currentAction?: CharacterAction;
  createdAt: string;
}

export interface HuntArea {
  id: string;
  name: string;
  city: string;
  recommendedLevel: number;
  minLevel: number;
  risk: HuntRisk;
  description: string;
  monsters: Monster[];
  estimatedXpPerHour: number;
  estimatedGoldPerHour: number;
  supplyCostPerHour: number;
  requiredAccess?: string;
  recommendedVocations?: Vocation[];
  tags: string[];
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  tone: "neutral" | "success" | "warning";
}

export interface HuntSimulationInput {
  character: Character;
  hunt: HuntArea;
  durationMinutes: number;
}

export interface HuntLootResult {
  itemId: string;
  itemName: string;
  quantity: number;
  totalValue: number;
  rarity: ItemRarity;
  weightTotal: number;
  item: Item;
}

export interface HuntSimulationResult {
  success: boolean;
  died: boolean;
  durationMinutes: number;
  killedMonsters: number;
  experienceGained: number;
  goldGained: number;
  lootItems: HuntLootResult[];
  totalLootValue: number;
  totalLootWeight: number;
  supplyCost: number;
  netProfit: number;
  loot: HuntLootResult[];
  rejectedLoot?: HuntLootResult[];
  skillProgress: Partial<Record<SkillName, number>>;
  deathReason?: string;
  logs: string[];
}
