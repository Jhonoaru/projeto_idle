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

export type WeaponProficiencyType =
  | "sword"
  | "axe"
  | "club"
  | "bow"
  | "wand"
  | "staff"
  | "fist"
  | "shield";

export type MonsterFocusBonusType =
  | "experience"
  | "loot"
  | "gold"
  | "supplies"
  | "risk";

export type DestinyNodeCategory =
  | "core"
  | "offense"
  | "defense"
  | "utility"
  | "vocation";

export type DestinyNodeShape =
  | "small"
  | "medium"
  | "major";

export type MonsterFocusSlotStatus =
  | "locked"
  | "empty"
  | "active"
  | "expired";

export type TrainingType = "offline" | "exercise" | "dummy";

export type TrainingTarget = SkillName;

export type SupplyType = "health_potion" | "mana_potion" | "rune" | "ammo" | "utility";

export type HuntRisk = "safe" | "low" | "medium" | "high" | "deadly";

export type BossType = "solo" | "party" | "world";

export type BossRisk = "safe" | "low" | "medium" | "high" | "deadly";

export type BossStatus = "locked" | "available" | "cooldown" | "in_progress";

export type PartyRole = "tank" | "healer" | "damage" | "support";

export type QuestStatus = "locked" | "available" | "in_progress" | "completed" | "failed";

export type QuestType = "access" | "story" | "daily" | "boss_access" | "tutorial";

export type QuestRisk = "safe" | "low" | "medium" | "high" | "deadly";

export type ItemRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";
export type EquipmentFamilyId = "field-kit" | "vanguard" | "pathfinder" | "arcanum" | "discipline" | "artifact";
export type EquipmentProgressionBandId = "novice" | "adventurer" | "veteran" | "elite" | "mythic";
export type EquipmentSetId = "iron-expedition" | "cryptwarden" | "emberforged";
export type CraftingRecipeCategory = "weapon" | "armor";
export type GuildWorkshopRank = 1 | 2 | 3 | 4;

export type DeathCause = "hunt" | "boss" | "quest" | "unknown";

export type BestiaryStage = "unknown" | "started" | "revealed" | "completed";

export type CharmType = "xp" | "gold" | "loot" | "defense" | "supply";

export type EquipmentUpgradeLevel = number;

export type EquipmentTier = number;

export type ImbuementPowerLevel = "basic" | "intricate" | "powerful";

export type HuntAutoRepeatMode =
  | "off"
  | "repeat_count"
  | "until_supplies_end"
  | "until_capacity_full"
  | "until_death_or_stop";

export type AutoRepeatStopReason =
  | "completed_max_repeats"
  | "missing_supplies"
  | "capacity_full"
  | "stamina_low"
  | "character_dead"
  | "invalid_hunt"
  | "manual_stop"
  | "offline_cap_reached";

export type ImbuementType =
  | "strike"
  | "focus"
  | "precision"
  | "fortification"
  | "wisdom"
  | "capacity"
  | "efficiency";

export type ImbuementSlot =
  | "weapon"
  | "armor"
  | "helmet"
  | "boots"
  | "backpack"
  | "offhand";

export type ItemType =
  | "gold"
  | "creature_product"
  | "equipment"
  | "consumable"
  | "material"
  | "quest"
  | "misc";

export type MarketItemCategory =
  | "creature_product"
  | "equipment"
  | "consumable"
  | "material"
  | "misc"
  | "all";

export type MarketPriceMode = "npc_fixed" | "simulated_market";

export type SellSource = "character_inventory" | "character_depot" | "guild_depot";

/** @deprecated Gold now always goes to guild.gold. */
export type SellDestination = "character_gold" | "guild_gold";

export type ShopCategory = "potions" | "runes" | "ammo" | "containers" | "utilities";

export type ShopDeliveryTarget = "character_inventory" | "character_depot" | "guild_depot";

export type BazaarOfferGrade = "standard" | "uncommon" | "rare" | "relic";

export interface BazaarOffer {
  id: string;
  itemId: string;
  quantity: number;
  price: number;
  grade: BazaarOfferGrade;
  upgradeLevel: number;
  tier: number;
  purchasedAt?: string;
}

export interface BazaarPurchaseRecord {
  offerId: string;
  rotationKey: string;
  itemId: string;
  quantity: number;
  totalCost: number;
  purchasedAt: string;
}

export interface GuildBazaarState {
  rotationKey: string;
  generatedAt: string;
  expiresAt: string;
  offers: BazaarOffer[];
  purchaseHistory: BazaarPurchaseRecord[];
  totalPurchases: number;
  totalSpentGold: number;
}

export type CollectionCategory =
  | "outfit"
  | "mount"
  | "avatar";

export type CollectionUnlockSource =
  | "starter"
  | "quest"
  | "achievement"
  | "bestiary"
  | "boss"
  | "daily"
  | "store_placeholder"
  | "event_placeholder";

export type CollectionRarity =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary";

export type DailyRewardType =
  | "gold"
  | "item"
  | "material"
  | "supply"
  | "collection"
  | "xp_boost_placeholder";

export type EquipmentSlot =
  | "helmet"
  | "armor"
  | "legs"
  | "boots"
  | "weapon"
  | "offhand"
  | "amulet"
  | "ring"
  | "backpack";

export type OffhandType = "shield" | "quiver" | "secondaryWeapon" | "focus";

export type ContainerType =
  | "backpack"
  | "loot_bag"
  | "supply_bag"
  | "rune_pouch"
  | "quiver"
  | "generic";

export interface Guild {
  id: string;
  name: string;
  gold: number;
  renown: number;
  rank: string;
  level: number;
  bestiary?: GuildBestiaryState;
  huntPresets?: HuntSupplyPreset[];
  collections?: GuildCollectionsState;
  dailyReward?: DailyRewardState;
  careerIdentity?: GuildCareerIdentity;
  headquarters?: GuildHeadquartersState;
  expeditions?: GuildExpeditionState;
  operationOutcomes?: GuildOperationOutcomesState;
  staff?: GuildStaffState;
  treasury?: GuildTreasuryState;
  projects?: GuildProjectsState;
  logistics?: GuildLogisticsState;
  bazaar?: GuildBazaarState;
  crafting?: GuildCraftingState;
  progressionRewards?: GuildProgressionRewardState;
  renownObjectives?: GuildRenownObjectivesState;
  directives?: GuildDirectivesState;
  squads?: GuildSquadsState;
  deploymentOrders?: GuildDeploymentOrdersState;
  loadoutTemplates?: GuildLoadoutTemplatesState;
}

export interface GuildLevelRewardClaim {
  level: number;
  label: string;
  claimedAt: string;
}

export interface GuildProgressionRewardState {
  claimedLevels: number[];
  claimHistory: GuildLevelRewardClaim[];
}

export interface GuildRenownObjectiveClaim {
  objectiveId: string;
  renownGained: number;
  claimedAt: string;
}

export interface GuildRenownObjectivesState {
  claimedObjectiveIds: string[];
  claimHistory: GuildRenownObjectiveClaim[];
}

export type GuildDirectiveId =
  | "vanguard-orders"
  | "training-charter"
  | "contract-mandate"
  | "merchant-compact"
  | "expedition-standard"
  | "grand-strategy";

export interface GuildDirectiveActivation {
  directiveId: GuildDirectiveId;
  activatedAt: string;
}

export interface GuildDirectivesState {
  activeDirectiveId: GuildDirectiveId | null;
  activationHistory: GuildDirectiveActivation[];
}

export type GuildSquadSlotId = "squad-one" | "squad-two" | "squad-three";

export interface GuildSquadMember {
  characterId: string;
  role: PartyRole;
}

export interface GuildSquadPreset {
  id: GuildSquadSlotId;
  name: string;
  members: GuildSquadMember[];
  updatedAt: string;
}

export interface GuildSquadsState {
  squads: GuildSquadPreset[];
}

export type GuildDeploymentOrderSlotId = "order-one" | "order-two" | "order-three";
export type GuildDeploymentOrderKind = "boss" | "contract";

export interface GuildDeploymentOrder {
  id: GuildDeploymentOrderSlotId;
  kind: GuildDeploymentOrderKind;
  targetId: string;
  squadSlotId: GuildSquadSlotId;
  updatedAt: string;
}

export interface GuildDeploymentOrdersState {
  orders: GuildDeploymentOrder[];
}

export type GuildLoadoutTemplateSlotId = "loadout-one" | "loadout-two" | "loadout-three";

export interface GuildLoadoutTemplateTarget {
  slot: EquipmentSlot;
  itemId: string;
  minimumTier: EquipmentTier;
  minimumUpgradeLevel: EquipmentUpgradeLevel;
}

export interface GuildLoadoutTemplate {
  id: GuildLoadoutTemplateSlotId;
  characterId: string;
  name: string;
  targets: GuildLoadoutTemplateTarget[];
  updatedAt: string;
}

export interface GuildLoadoutActiveAssignment {
  characterId: string;
  templateId: GuildLoadoutTemplateSlotId;
  assignedAt: string;
}

export interface GuildLoadoutProcurementOrder {
  characterId: string;
  templateId: GuildLoadoutTemplateSlotId;
  slot: EquipmentSlot;
  itemId: string;
  queuedAt: string;
}

export interface GuildLoadoutProcurementAlertsState {
  notifiedReadyKeys: string[];
  unreadReadyKeys: string[];
}

export interface GuildLoadoutProcurementReservation {
  characterId: string;
  templateId: GuildLoadoutTemplateSlotId;
  slot: EquipmentSlot;
  itemId: string;
  inventoryItemId: string;
  reservedAt: string;
}

export interface GuildLoadoutFulfillmentRecord {
  id: string;
  characterId: string;
  characterName: string;
  templateId: GuildLoadoutTemplateSlotId;
  templateName: string;
  slot: EquipmentSlot;
  itemId: string;
  itemName: string;
  inventoryItemId: string;
  previousItemId?: string;
  previousItemName?: string;
  fulfilledAt: string;
}

export interface GuildLoadoutTemplatesState {
  templates: GuildLoadoutTemplate[];
  activeAssignments: GuildLoadoutActiveAssignment[];
  procurementOrders: GuildLoadoutProcurementOrder[];
  procurementReservations: GuildLoadoutProcurementReservation[];
  procurementAlerts: GuildLoadoutProcurementAlertsState;
  fulfillmentHistory: GuildLoadoutFulfillmentRecord[];
}

export interface GuildLogisticsState {
  pinnedObjectiveIds: string[];
  notifiedReadyKeys: string[];
  unreadReadyKeys: string[];
}

export interface CraftingRecipeDefinition {
  id: string;
  name: string;
  description: string;
  category: CraftingRecipeCategory;
  outputItemId: string;
  outputQuantity: number;
  goldCost: number;
  requiredWorkshopRank: GuildWorkshopRank;
  materials: ForgeMaterialRequirement[];
}

export interface GuildCraftingHistoryEntry {
  id: string;
  recipeId: string;
  itemId: string;
  itemName: string;
  quantity: number;
  goldSpent: number;
  materialsConsumed: number;
  craftedAt: string;
}

export interface SalvageMaterialResult {
  itemId: string;
  quantity: number;
}

export interface GuildSalvageHistoryEntry {
  id: string;
  sourceInventoryItemId: string;
  itemId: string;
  itemName: string;
  recoveredMaterials: SalvageMaterialResult[];
  salvagedAt: string;
}

export interface GuildCraftingState {
  totalCrafts: number;
  totalGoldSpent: number;
  totalMaterialsConsumed: number;
  history: GuildCraftingHistoryEntry[];
  totalSalvages: number;
  totalRecoveredMaterials: number;
  salvageHistory: GuildSalvageHistoryEntry[];
}

export interface GuildProjectMaterialRequirement {
  itemId: string;
  quantity: number;
}

export interface GuildProjectPhaseDefinition {
  name: string;
  description: string;
  goldCost: number;
  materials: GuildProjectMaterialRequirement[];
}

export interface GuildProjectDefinition {
  id: string;
  name: string;
  description: string;
  sigil: string;
  minimumCareerPoints: number;
  prerequisiteProjectId?: string;
  phases: GuildProjectPhaseDefinition[];
  rewardRenown: number;
  rewardCollectionItemId: string;
}

export interface GuildProjectProgress {
  projectId: string;
  completedPhases: number;
  completedAt?: string;
}

export interface GuildProjectsState {
  progress: GuildProjectProgress[];
  totalCompleted: number;
  totalInvestedGold: number;
  totalDonatedMaterials: number;
}

export type GuildTreasuryTransactionType = "deposit" | "withdrawal";

export interface GuildTreasuryTransaction {
  id: string;
  type: GuildTreasuryTransactionType;
  amount: number;
  balanceAfter: number;
  createdAt: string;
}

export interface GuildTreasuryState {
  reservedGold: number;
  totalDeposited: number;
  totalWithdrawn: number;
  transactions: GuildTreasuryTransaction[];
}

export type GuildFacilityId = "war_room" | "training_yard" | "quartermaster" | "contract_archive";

export interface GuildHeadquartersState {
  facilityLevels: Record<GuildFacilityId, number>;
  totalInvestedGold: number;
  totalInvestedMaterials: number;
}

export interface GuildFacilityMaterialRequirement {
  itemId: string;
  quantity: number;
}

export interface GuildFacilityDefinition {
  id: GuildFacilityId;
  name: string;
  description: string;
  sigil: string;
  bonusLabel: string;
  bonusPerLevel: number;
  upgradeCosts: readonly number[];
  careerPointRequirements: readonly number[];
  materialRequirements: readonly (readonly GuildFacilityMaterialRequirement[])[];
}

export type GuildSpecialistId = "scout_captain" | "provisioner" | "guild_envoy" | "field_medic";

export type GuildSpecialistBonusType =
  | "expedition_success"
  | "dispatch_discount"
  | "expedition_gold"
  | "expedition_renown";

export interface GuildStaffState {
  hiredSpecialistIds: GuildSpecialistId[];
  activeSpecialistId: GuildSpecialistId | null;
  totalSpentGold: number;
}

export interface GuildSpecialistDefinition {
  id: GuildSpecialistId;
  name: string;
  title: string;
  description: string;
  sigil: string;
  bonusType: GuildSpecialistBonusType;
  bonusValue: number;
  bonusLabel: string;
  hireCost: number;
  minimumCareerPoints: number;
  requiredFacilityId: GuildFacilityId;
  requiredFacilityLevel: number;
}

export type GuildContractRisk = "routine" | "guarded" | "dangerous";

export interface GuildContractDefinition {
  id: string;
  name: string;
  region: string;
  description: string;
  sigil: string;
  risk: GuildContractRisk;
  durationMinutes: number;
  dispatchCost: number;
  minimumCareerPoints: number;
  minimumHeadquartersLevels: number;
  minimumTeamSize: number;
  maximumTeamSize: number;
  recommendedPower: number;
  rewardGold: number;
  rewardRenown: number;
  rewardItemId?: string;
  rewardItemQuantity?: number;
}

export interface GuildExpeditionRun {
  id: string;
  contractId: string;
  startedAt: string;
  endsAt: string;
  assignedCharacterIds: string[];
  teamPower: number;
  successChance: number;
  outcomeRoll: number;
  dispatchCost: number;
  specialistId?: GuildSpecialistId;
}

export interface GuildExpeditionHistoryEntry {
  id: string;
  contractId: string;
  completedAt: string;
  assignedCharacterIds: string[];
  success: boolean;
  goldGained: number;
  renownGained: number;
  itemId?: string;
  itemQuantity?: number;
  specialistId?: GuildSpecialistId;
  dispatchCost?: number;
}

export interface GuildExpeditionState {
  activeExpedition?: GuildExpeditionRun;
  history: GuildExpeditionHistoryEntry[];
  totalCompleted: number;
  totalSucceeded: number;
}

export interface GuildBossOutcomeLoot {
  itemId: string;
  quantity: number;
}

export interface GuildBossOutcome {
  id: string;
  bossId: string;
  completedAt: string;
  participantCharacterIds: string[];
  defeated: boolean;
  entryCost: number;
  goldGained: number;
  goldLost: number;
  renownGained: number;
  experienceGained: number;
  loot: GuildBossOutcomeLoot[];
}

export interface BossRaidRecord {
  bossId: string;
  attempts: number;
  defeats: number;
  totalEntryCost: number;
  totalGoldGained: number;
  totalGoldLost: number;
  totalRenownGained: number;
  totalExperienceGained: number;
  lootTotals: GuildBossOutcomeLoot[];
  lastAttemptAt: string;
  lastDefeatedAt?: string;
}

export interface BossRaidCodexState {
  records: BossRaidRecord[];
}

export type BossExecutionGrade = "unranked" | "precise" | "disciplined" | "masterful";

export interface BossExecutionPerformanceSummary {
  manualReactions: number;
  perfectReactions: number;
  perfectDodges: number;
  perfectHolds: number;
  bestPerfectChain: number;
  grade: BossExecutionGrade;
}

export interface BossExecutionMasteryRecord {
  bossId: string;
  victoriesWithPerfectReactions: number;
  totalPerfectReactions: number;
  perfectDodges: number;
  perfectHolds: number;
  bestPerfectChain: number;
  lastRecordedAt: string;
}

export interface BossExecutionMasteryState {
  records: BossExecutionMasteryRecord[];
  claimedMilestoneIds: string[];
  recordedOperationIds: string[];
}

export interface GuildOperationOutcomesState {
  bossHistory: GuildBossOutcome[];
  totalBossAttempts: number;
  totalBossDefeats: number;
  regionMastery?: GuildRegionMasteryProgress[];
  regionalOrders?: GuildRegionalOrdersState;
  bossExecutionMastery?: BossExecutionMasteryState;
  bossRaidCodex?: BossRaidCodexState;
}

export type GuildRegionalOrderObjective = "hunt_minutes" | "boss_defeats" | "contract_successes";

export type GuildRegionalOrderDifficulty = "standard" | "veteran" | "elite";

export type GuildRegionalOrderRewardTier = "field" | "quartermaster" | "command";

export interface GuildRegionalOrderRewardItem {
  itemId: string;
  quantity: number;
}

export interface GuildRegionalOrderActive {
  id: string;
  cycleKey: string;
  regionId: string;
  objective: GuildRegionalOrderObjective;
  difficulty?: GuildRegionalOrderDifficulty;
  target: number;
  baseline: number;
  rewardGold: number;
  rewardTier?: GuildRegionalOrderRewardTier;
  rewardTableId?: string;
  rewardItem?: GuildRegionalOrderRewardItem;
  acceptedAt: string;
}

export interface GuildRegionalOrderClaim {
  orderId: string;
  regionId: string;
  objective: GuildRegionalOrderObjective;
  difficulty?: GuildRegionalOrderDifficulty;
  rewardGold: number;
  rewardTier?: GuildRegionalOrderRewardTier;
  rewardTableId?: string;
  rewardItem?: GuildRegionalOrderRewardItem;
  claimedAt: string;
}

export interface GuildRegionalOrdersState {
  activeOrder?: GuildRegionalOrderActive;
  claimedOrderIds: string[];
  claimHistory: GuildRegionalOrderClaim[];
}

export interface GuildRegionMasteryProgress {
  regionId: string;
  successfulHunts: number;
  successfulHuntMinutes: number;
  bossAttempts: number;
  bossDefeats: number;
  contractsCompleted: number;
  contractsSucceeded: number;
}

export interface GuildCareerIdentity {
  activeTitleId: string | null;
}

export interface GuildTitleDefinition {
  id: string;
  title: string;
  description: string;
  sigil: string;
  category: GuildAchievementCategory;
  requiredAchievementId?: string;
  minimumCareerPoints?: number;
}

export interface GuildTitleProgress {
  definition: GuildTitleDefinition;
  unlocked: boolean;
  requirementLabel: string;
}

export type GuildAchievementCategory =
  | "growth"
  | "contracts"
  | "hunting"
  | "mastery"
  | "collections"
  | "legacy";

export type GuildAchievementTier = "bronze" | "silver" | "gold";

export type GuildAchievementMetric =
  | "roster_size"
  | "combined_level"
  | "combined_experience"
  | "completed_contracts"
  | "unlocked_accesses"
  | "monster_kills"
  | "completed_bestiary_entries"
  | "highest_skill"
  | "collection_unlocks"
  | "daily_claims"
  | "guild_renown"
  | "guild_gold";

export interface GuildAchievementDefinition {
  id: string;
  title: string;
  description: string;
  category: GuildAchievementCategory;
  tier: GuildAchievementTier;
  metric: GuildAchievementMetric;
  target: number;
  points: number;
  sigil: string;
}

export interface GuildAchievementProgress {
  definition: GuildAchievementDefinition;
  current: number;
  progressPercent: number;
  unlocked: boolean;
}

export interface CollectionItem {
  id: string;
  category: CollectionCategory;
  name: string;
  description: string;
  rarity: CollectionRarity;
  unlockSource: CollectionUnlockSource;
  previewType: "text" | "badge" | "silhouette" | "placeholder";
  previewValue: string;
  allowedVocations?: Vocation[];
  unlockRequirementText?: string;
  sortOrder?: number;
}

export interface GuildCollectionsState {
  unlockedCollectionItemIds: string[];
  newlyUnlockedCollectionItemIds: string[];
}

export interface CharacterCosmetics {
  activeOutfitId?: string;
  activeMountId?: string;
  activeAvatarId?: string;
}

export interface DailyRewardDefinition {
  day: number;
  rewardType: DailyRewardType;
  label: string;
  description: string;
  goldAmount?: number;
  itemId?: string;
  quantity?: number;
  collectionItemId?: string;
  previewValue?: string;
}

export interface DailyRewardClaim {
  claimedAt: string;
  day: number;
  rewardType: DailyRewardType;
  label: string;
}

export interface DailyRewardState {
  lastClaimedAt?: string | null;
  currentStreak: number;
  totalClaims: number;
  cycleDay: number;
  claimHistory: DailyRewardClaim[];
  claimedToday: boolean;
}

export interface HuntSupplyPresetItem {
  itemId: string;
  quantity: number;
  targetContainerType?: ContainerType;
  targetContainerId?: string;
}

export interface HuntSupplyPreset {
  id: string;
  name: string;
  huntId: string;
  characterId?: string;
  vocation?: Vocation;
  durationMinutes: number;
  items: HuntSupplyPresetItem[];
  createdAt: string;
  updatedAt: string;
}

export interface HuntPreparationItemDelta {
  itemId: string;
  itemName: string;
  quantity: number;
}

export interface HuntPreparationResult {
  success: boolean;
  missingGold?: number;
  missingItems?: HuntPreparationItemDelta[];
  movedItems?: Array<HuntPreparationItemDelta & { from: string; to: string }>;
  boughtItems?: Array<HuntPreparationItemDelta & { totalCost: number }>;
  warnings: string[];
  logs: string[];
}

export interface MonsterBestiaryProgress {
  monsterId: string;
  monsterName: string;
  kills: number;
  stage: BestiaryStage;
  firstSeenAt?: string;
  completedAt?: string;
  charmPointsClaimed?: boolean;
}

export interface BestiaryThreshold {
  revealKills: number;
  completeKills: number;
  charmPointsReward: number;
}

export interface CharmDefinition {
  id: string;
  name: string;
  description: string;
  type: CharmType;
  unlockCost: number;
  effectPercent: number;
  requiredCompletedMonsters?: number;
}

export interface ActiveCharmAssignment {
  charmId: string;
  monsterId: string;
  assignedAt: string;
}

export interface ForgeMaterialRequirement {
  itemId: string;
  quantity: number;
}

export interface ImbuementBonus {
  attackPowerPercent?: number;
  defensePowerPercent?: number;
  magicPowerPercent?: number;
  distancePowerPercent?: number;
  fistPowerPercent?: number;
  maxHealthPercent?: number;
  maxManaPercent?: number;
  capacityFlat?: number;
  speedFlat?: number;
  supplyReductionPercent?: number;
  xpBonusPercent?: number;
  critChancePercent?: number;
  critDamagePercent?: number;
}

export interface WeaponProficiencyBonus {
  attackPowerPercent?: number;
  defensePowerPercent?: number;
  magicPowerPercent?: number;
  distancePowerPercent?: number;
  fistPowerPercent?: number;
  critChancePercent?: number;
  critDamagePercent?: number;
  supplyReductionPercent?: number;
  xpBonusPercent?: number;
}

export interface WeaponProficiencyPerk {
  id: string;
  name: string;
  description: string;
  requiredLevel: number;
  bonus: WeaponProficiencyBonus;
}

export interface WeaponProficiencyProgress {
  type: WeaponProficiencyType;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  unlockedPerkIds: string[];
}

export type WeaponProficiencyState = Record<WeaponProficiencyType, WeaponProficiencyProgress>;

export interface MonsterFocusSlot {
  slotIndex: number;
  status: MonsterFocusSlotStatus;
  monsterId?: string;
  bonusType?: MonsterFocusBonusType;
  bonusPercent?: number;
  remainingHunts?: number;
  createdAt?: string;
  expiresAt?: string | null;
  rerollCount?: number;
}

export interface MonsterFocusState {
  slots: MonsterFocusSlot[];
  lastFreeRerollAt?: string | null;
}

export interface DestinyBonus {
  maxHealthPercent?: number;
  attackPowerPercent?: number;
  magicPowerPercent?: number;
  distancePowerPercent?: number;
  fistPowerPercent?: number;
  defensePowerPercent?: number;
  xpBonusPercent?: number;
  goldBonusPercent?: number;
  supplyReductionPercent?: number;
  capacityBonusFlat?: number;
  deathRiskReductionPercent?: number;
  lootBonusPercent?: number;
  critChancePercent?: number;
  critDamagePercent?: number;
}

export interface DestinyNode {
  id: string;
  name: string;
  description: string;
  category: DestinyNodeCategory;
  shape: DestinyNodeShape;
  requiredLevel: number;
  cost: number;
  prerequisiteNodeIds: string[];
  allowedVocations?: Vocation[];
  position: {
    x: number;
    y: number;
  };
  bonus: DestinyBonus;
}

export interface CharacterDestinyState {
  unlockedNodeIds: string[];
  spentPoints: number;
  availablePoints: number;
  totalEarnedPoints: number;
  lastCalculatedLevel: number;
}

export interface ImbuementDefinition {
  id: string;
  familyId: ImbuementType;
  name: string;
  powerLevel: ImbuementPowerLevel;
  description: string;
  type: ImbuementType;
  allowedEquipmentSlots: EquipmentSlot[];
  goldCost: number;
  requiredMaterials: ForgeMaterialRequirement[];
  bonus: ImbuementBonus;
  durationHunts?: number;
  durationMinutes?: number;
  requiredCharacterLevel?: number;
  requiredForgeTier?: number;
}

export interface ActiveImbuement {
  imbuementId: string;
  appliedAt: string;
  remainingHunts?: number;
  expiresAt?: string;
}

export interface GuildBestiaryState {
  progress: MonsterBestiaryProgress[];
  charmPoints: number;
  unlockedCharmIds: string[];
  activeCharms: ActiveCharmAssignment[];
}

export interface DeathPenalty {
  experienceLost: number;
  goldLost: number;
  itemsLostValue: number;
  skillProgressLost?: Partial<Record<SkillName, number>>;
  blessProtected: boolean;
  blessProtectionPercent?: number;
  consumedBlessingIds?: string[];
  lostItems?: InventoryItem[];
}

export interface Blessing {
  id: string;
  name: string;
  sigil: string;
  domain: string;
  description: string;
  price: number;
  protectionPercent: number;
  consumedOnDeath: boolean;
}

export interface CharacterDeathState {
  diedAt: string;
  cause: DeathCause;
  sourceId?: string;
  sourceName?: string;
  templeCity: string;
  templeName: string;
  recoveryEndsAt?: string;
  penalty: DeathPenalty;
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
  critChancePercent?: number;
  critDamagePercent?: number;
  accuracyPercent?: number;
  dodgePercent?: number;
  armorPenetrationPercent?: number;
  conditionResistancePenetrationPercent?: number;
  blockChancePercent?: number;
  blockMitigationPercent?: number;
}

export type BossDefensiveResponsePriority = "automatic" | "prevent" | "recover";
export type BossDodgeBehavior = "automatic" | "safe_windows" | "hold_position";
export type BossManualReactionType = "dodge" | "hold";
export type BossManualReactionQuality = "early" | "perfect" | "late" | "standard";

export interface BossManualReaction {
  castId: string;
  abilityId: string;
  abilityName: string;
  targetCharacterId: string;
  targetCharacterName: string;
  reactionType: BossManualReactionType;
  recordedAt: string;
  quality?: BossManualReactionQuality;
  timingPercent?: number;
}

export interface CombatSkillLoadout {
  attackSkillIds: string[];
  supportSkillId: string | null;
  customized?: boolean;
  supportDisabled?: boolean;
  defensiveResponsePriority?: BossDefensiveResponsePriority;
  bossDodgeBehavior?: BossDodgeBehavior;
}

export interface CombatSkillCastCount {
  skillId: string;
  casts: number;
}

export interface CombatSkillRotationSummary {
  casts: CombatSkillCastCount[];
  attackEvents: CombatSkillRotationEvent[];
  supportEvents: CombatSkillRotationEvent[];
  totalCasts: number;
  manaSpent: number;
  remainingMana: number;
  activeSkillId?: string;
  nextCastInMs: number;
  cooldownRemainingMs: Record<string, number>;
  timeline: CombatSkillRotationTimeline;
}

export interface CombatSkillRotationEvent {
  sequence: number;
  skillCastIndex: number;
  occurredAtMs: number;
  skillId: string;
  manaCost: number;
}

export interface CombatSkillRotationTimeline {
  durationMs: number;
  totalEvents: number;
  omittedEvents: number;
  events: CombatSkillRotationEvent[];
}

export interface CombatSkillEffectEntry {
  skillId: string;
  skillName: string;
  casts: number;
  attackImpact: number;
  survivalImpact: number;
  supplyImpact: number;
  damageType?: DamageType;
  baseDamageDealt: number;
  landedBaseDamageDealt: number;
  damageAfterDefense: number;
  defenseMitigationPercent: number;
  armorPenetrationPercent: number;
  damageDealt: number;
  elementalModifierPercent: number;
  healingDone: number;
  damagePrevented: number;
  hits: number;
  misses: number;
  dodges: number;
  criticalHits: number;
  conditionType?: CombatConditionType;
  conditionApplications: number;
  conditionTicks: number;
  conditionDamage: number;
  conditionUptimeSeconds: number;
  conditionPotencyPercent: number;
  conditionEligibleHits: number;
  conditionResisted: number;
  conditionImmuneHits: number;
  conditionResistanceTotal: number;
  conditionResistancePenetrationTotal: number;
  conditionEffectiveResistanceTotal: number;
  conditionEffectiveChanceTotal: number;
  conditionsCleansed: number;
  conditionProtectionPercent: number;
  conditionProtectionUptimeSeconds: number;
}

export type CombatConditionType = "burn" | "poison" | "slow";
export type CombatConditionOutcome = "none" | "applied" | "resisted" | "immune" | "failed";
export type ConditionResistances = Partial<Record<CombatConditionType, number>>;

export interface CombatConditionDefinition {
  type: CombatConditionType;
  applicationChancePercent: number;
  durationSeconds: number;
  tickIntervalSeconds?: number;
  damagePercentPerTick?: number;
  potencyPercent?: number;
}

export interface CombatConditionSupportEffect {
  cleanseCount?: number;
  protectionPercent?: number;
  protectionDurationSeconds?: number;
  scope?: "self" | "party";
}

export interface CombatPartyConditionSupportContribution {
  characterId: string;
  characterName: string;
  cleansed: number;
  protectionUptimeSeconds: number;
  telegraphResponses: number;
}

export interface BossDefensiveResponseSummary {
  castId: string;
  abilityId: string;
  abilityName: string;
  targetCharacterId: string;
  targetCharacterName: string;
  sourceCharacterId: string;
  sourceCharacterName: string;
  skillId: string;
  skillName: string;
  responseType: "ward" | "cleanse";
  configuredPriority: BossDefensiveResponsePriority;
  occurredAtMs: number;
  cooldownEndsAtMs: number;
  protectionPercent: number;
  cleanseCount: number;
  reservedEventKey: string;
}

export interface BossInterruptSummary {
  castId: string;
  abilityId: string;
  abilityName: string;
  sourceCharacterId: string;
  sourceCharacterName: string;
  skillId: string;
  skillName: string;
  occurredAtMs: number;
  interruptPowerPercent: number;
  resistancePercent: number;
  successChancePercent: number;
  rollPercent: number;
  interrupted: boolean;
  reservedEventKey: string;
}

export interface BossTelegraphDodgeSummary {
  castId: string;
  abilityId: string;
  abilityName: string;
  targetCharacterId: string;
  targetCharacterName: string;
  occurredAtMs: number;
  dodgePercent: number;
  difficultyPercent: number;
  reactionWindowSeconds: number;
  dodgeBehavior: BossDodgeBehavior;
  telegraphProfile: BossTelegraphProfile;
  profileModifierPercent: number;
  successChancePercent: number;
  rollPercent: number;
  dodged: boolean;
  manualReaction?: boolean;
  manualBonusPercent?: number;
  manualReactionQuality?: BossManualReactionQuality;
  perfectChainStreak?: number;
  perfectChainBonusPercent?: number;
}

export interface BossDodgeTradeOffSummary {
  characterId: string;
  characterName: string;
  dodgeBehavior: BossDodgeBehavior;
  positioning: "mobile" | "selective" | "anchored";
  targetedTelegraphs: number;
  dodgeAttempts: number;
  successfulDodges: number;
  unavoidedTelegraphs: number;
  offensiveBonusPercent: number;
  manualHoldCount: number;
  manualPositionBonusPercent: number;
  manualHoldQualityCounts: Record<BossManualReactionQuality, number>;
  maxPerfectReactionStreak: number;
  perfectHoldChainBonusPercent: number;
}

export interface CombatConditionSummary {
  type: CombatConditionType;
  applications: number;
  ticks: number;
  damage: number;
  uptimePercent: number;
  potencyPercent: number;
  eligibleHits: number;
  resisted: number;
  immuneHits: number;
  averageResistancePercent: number;
  averageResistancePenetrationPercent: number;
  averageEffectiveResistancePercent: number;
  averageEffectiveChancePercent: number;
}

export interface IncomingCombatConditionSummary {
  type: CombatConditionType;
  attempts: number;
  applications: number;
  prevented: number;
  cleansed: number;
  ticks: number;
  damage: number;
  uptimePercent: number;
}

export interface CombatSkillEffectSummary {
  totalCasts: number;
  manaSpent: number;
  attackBonusPercent: number;
  deathRiskReductionPercent: number;
  supplyReductionPercent: number;
  dodgeRiskReductionPercent: number;
  blockRiskReductionPercent: number;
  blockChancePercent: number;
  blockMitigationPercent: number;
  incomingAttacks: number;
  blockedAttacks: number;
  blockRatePercent: number;
  incomingDamage: number;
  blockedDamage: number;
  damageTakenAfterBlock: number;
  blockDamageReductionPercent: number;
  totalAttacks: number;
  totalHits: number;
  totalMisses: number;
  totalDodges: number;
  hitRatePercent: number;
  baseTotalDamage: number;
  landedBaseDamage: number;
  avoidanceDamageDelta: number;
  damageAfterDefense: number;
  defenseDamageDelta: number;
  defenseMitigationPercent: number;
  armorPenetrationPercent: number;
  directDamage: number;
  totalDamage: number;
  elementalDamageDelta: number;
  elementalModifierPercent: number;
  totalHealing: number;
  totalDamagePrevented: number;
  totalCriticalHits: number;
  totalConditionApplications: number;
  totalConditionTicks: number;
  totalConditionDamage: number;
  conditionDamagePercent: number;
  slowUptimePercent: number;
  conditionAttackBonusPercent: number;
  conditionRiskReductionPercent: number;
  conditions: CombatConditionSummary[];
  incomingConditionAttempts: number;
  incomingConditionApplications: number;
  incomingConditionPrevented: number;
  incomingConditionsCleansed: number;
  incomingConditionTicks: number;
  incomingConditionDamage: number;
  incomingSlowUptimePercent: number;
  conditionProtectionUptimePercent: number;
  averageConditionProtectionPercent: number;
  conditionDefenseRiskReductionPercent: number;
  incomingConditions: IncomingCombatConditionSummary[];
  damagePerMinute: number;
  healingPerMinute: number;
  entries: CombatSkillEffectEntry[];
  timeline: CombatSkillTimelineSummary;
}

export interface CombatSkillTimelineEvent {
  sequence: number;
  occurredAtMs: number;
  progressPercent: number;
  skillId: string;
  skillName: string;
  category: "attack" | "support";
  targetId: string;
  targetName: string;
  targetKind: CombatSkillTargetKind;
  outcome: CombatAttackOutcome;
  critical: boolean;
  manaCost: number;
  damageType?: DamageType;
  baseDamageDealt: number;
  damageAfterDefense: number;
  defenseMitigationPercent: number;
  armorPenetrationPercent: number;
  damageDealt: number;
  elementalModifierPercent: number;
  healingDone: number;
  damagePrevented: number;
  conditionType?: CombatConditionType;
  conditionApplied: boolean;
  conditionTicks: number;
  conditionDamage: number;
  conditionDurationSeconds: number;
  conditionPotencyPercent: number;
  conditionOutcome: CombatConditionOutcome;
  conditionResistancePercent: number;
  conditionResistancePenetrationPercent: number;
  conditionEffectiveResistancePercent: number;
  conditionBaseChancePercent: number;
  conditionEffectiveChancePercent: number;
  conditionCleanseCount: number;
  conditionProtectionPercent: number;
  conditionProtectionDurationSeconds: number;
}

export interface CombatSkillTimelineSummary {
  durationMs: number;
  totalEvents: number;
  omittedEvents: number;
  totalHits: number;
  totalMisses: number;
  totalDodges: number;
  totalCriticalHits: number;
  events: CombatSkillTimelineEvent[];
}

export type CombatSkillTargetKind = "monster" | "boss" | "ally" | "self" | "encounter";

export type CombatAttackOutcome = "hit" | "miss" | "dodged" | "support";

export type DamageType = "physical" | "fire" | "ice" | "earth" | "energy" | "holy" | "death";

export type ElementalResistances = Partial<Record<DamageType, number>>;

export interface CombatSkillTarget {
  id: string;
  name: string;
  kind: CombatSkillTargetKind;
  resistances?: ElementalResistances;
  conditionResistances?: ConditionResistances;
  conditionImmunities?: CombatConditionType[];
  conditionAttacks?: CombatConditionDefinition[];
  evasionPercent?: number;
  armor?: number;
  defense?: number;
  level?: number;
  minDamage?: number;
  maxDamage?: number;
}

export interface BossIncomingPressureSegment {
  phaseId: string;
  startPercent: number;
  endPercent: number;
  incomingAttacks: number;
  incomingDamageMultiplier: number;
  conditionChanceMultiplier: number;
  phaseConditionCasts?: BossIncomingConditionCast[];
}

export interface BossIncomingConditionCast {
  castId: string;
  abilityId: string;
  abilityName: string;
  telegraphStartsAtMs: number;
  occurredAtMs: number;
  targetCharacterId: string;
  targetCharacterName: string;
  conditionAttack: CombatConditionDefinition;
}

export interface CombatSkillEffectOptions {
  attackTargets?: CombatSkillTarget[];
  supportTargets?: CombatSkillTarget[];
  partyRoles?: Partial<Record<string, PartyRole>>;
  incomingAttackCountOverride?: number;
  incomingDamageMultiplierOverride?: number;
  incomingConditionChanceMultiplierOverride?: number;
  incomingPressureSegmentsOverride?: BossIncomingPressureSegment[];
  bossPhases?: BossPhaseDefinition[];
}

export interface BossPhaseDefinition {
  id: string;
  name: string;
  durationPercent: number;
  description: string;
  targetRole?: PartyRole;
  targetThreatMultiplier?: number;
  attackRateMultiplier?: number;
  incomingDamageMultiplier?: number;
  conditionChanceMultiplier?: number;
  specialAbility?: BossPhaseAbilityDefinition;
}

export type BossTelegraphProfile = "quick" | "focused" | "heavy";

export interface BossPhaseAbilityDefinition {
  id: string;
  name: string;
  description: string;
  initialDelaySeconds?: number;
  castTimeSeconds?: number;
  cooldownSeconds?: number;
  interruptResistancePercent?: number;
  dodgeDifficultyPercent?: number;
  telegraphProfile?: BossTelegraphProfile;
  conditionAttack?: CombatConditionDefinition;
}

export interface BossAbilityCastSummary {
  castId: string;
  phaseId: string;
  abilityId: string;
  abilityName: string;
  sequence: number;
  telegraphStartsAtMs: number;
  resolvesAtMs: number;
  cooldownEndsAtMs: number;
  interruptResistancePercent: number;
  dodgeDifficultyPercent: number;
  telegraphProfile: BossTelegraphProfile;
  targetCharacterId?: string;
  targetCharacterName?: string;
  conditionType?: CombatConditionType;
}

export interface BossThreatPhaseMemberSummary {
  characterId: string;
  characterName: string;
  role: PartyRole;
  threatPercent: number;
  incomingAttacks: number;
  incomingDamageMultiplier: number;
  conditionChanceMultiplier: number;
  primaryTarget: boolean;
}

export interface BossThreatPhaseSummary {
  phaseId: string;
  phaseName: string;
  description: string;
  startPercent: number;
  endPercent: number;
  incomingAttacks: number;
  attackRateMultiplier: number;
  incomingDamageMultiplier: number;
  conditionChanceMultiplier: number;
  specialAbility?: BossPhaseAbilityDefinition;
  abilityCasts: BossAbilityCastSummary[];
  targetRole?: PartyRole;
  primaryTargetCharacterId?: string;
  members: BossThreatPhaseMemberSummary[];
}

export interface BossThreatMemberSummary {
  characterId: string;
  characterName: string;
  role: PartyRole;
  threatScore: number;
  threatPercent: number;
  incomingAttacks: number;
  incomingDamageMultiplier: number;
  conditionChanceMultiplier: number;
  deathRiskMultiplier: number;
  primaryTarget: boolean;
}

export interface BossThreatSummary {
  baseIncomingAttacks: number;
  totalIncomingAttacks: number;
  attackPressurePercent: number;
  primaryTargetCharacterId?: string;
  tankAggroControlPercent: number;
  aggroRiskReductionPercent: number;
  targetSwitchCount: number;
  abilityCasts: BossAbilityCastSummary[];
  phases: BossThreatPhaseSummary[];
  members: BossThreatMemberSummary[];
}

export interface CombatSkillPartyEffectSummary {
  attackBonusPercent: number;
  deathRiskReductionPercent: number;
  dodgeRiskReductionPercent: number;
  blockRiskReductionPercent: number;
  blockChancePercent: number;
  blockMitigationPercent: number;
  incomingAttacks: number;
  blockedAttacks: number;
  blockRatePercent: number;
  incomingDamage: number;
  blockedDamage: number;
  damageTakenAfterBlock: number;
  blockDamageReductionPercent: number;
  totalCasts: number;
  manaSpent: number;
  totalAttacks: number;
  totalHits: number;
  totalMisses: number;
  totalDodges: number;
  hitRatePercent: number;
  baseTotalDamage: number;
  landedBaseDamage: number;
  avoidanceDamageDelta: number;
  damageAfterDefense: number;
  defenseDamageDelta: number;
  defenseMitigationPercent: number;
  armorPenetrationPercent: number;
  directDamage: number;
  totalDamage: number;
  elementalDamageDelta: number;
  elementalModifierPercent: number;
  totalHealing: number;
  totalDamagePrevented: number;
  totalCriticalHits: number;
  totalConditionApplications: number;
  totalConditionTicks: number;
  totalConditionDamage: number;
  conditionDamagePercent: number;
  slowUptimePercent: number;
  conditionAttackBonusPercent: number;
  conditionRiskReductionPercent: number;
  conditions: CombatConditionSummary[];
  incomingConditionAttempts: number;
  incomingConditionApplications: number;
  incomingConditionPrevented: number;
  incomingConditionsCleansed: number;
  incomingConditionTicks: number;
  incomingConditionDamage: number;
  incomingSlowUptimePercent: number;
  conditionProtectionUptimePercent: number;
  averageConditionProtectionPercent: number;
  conditionDefenseRiskReductionPercent: number;
  incomingConditions: IncomingCombatConditionSummary[];
  conditionSupportContributions: CombatPartyConditionSupportContribution[];
  bossDefensiveResponses: BossDefensiveResponseSummary[];
  bossInterrupts: BossInterruptSummary[];
  bossTelegraphDodges: BossTelegraphDodgeSummary[];
  bossDodgeTradeOffs: BossDodgeTradeOffSummary[];
  positioningAttackBonusPercent: number;
  threat: BossThreatSummary;
  members: Array<{
    characterId: string;
    characterName: string;
    effects: CombatSkillEffectSummary;
  }>;
}

export interface CharacterAction {
  type: CharacterStatus;
  label: string;
  startedAt: string;
  endsAt: string;
  resolvedAt?: string;
  offlineCompletedAt?: string;
  readyToResolve?: boolean;
  offlineElapsedMs?: number;
  durationMinutes?: number;
  targetId?: string;
  targetName?: string;
  risk?: HuntRisk;
  expectedXp?: number;
  guildXpBonusPercent?: number;
  guildGoldBonusPercent?: number;
  expectedGold?: number;
  trainingType?: TrainingType;
  targetSkill?: TrainingTarget;
  secondarySkill?: TrainingTarget;
  cost?: number;
  expectedGainPercent?: number;
  partyMemberIds?: string[];
  partyMembers?: PartyMember[];
  autoRepeat?: HuntAutoRepeatConfig;
  repeatGroupId?: string;
  repeatIndex?: number;
  maxRepeatIndex?: number;
  combatSkillLoadout?: CombatSkillLoadout;
  bossManualReactions?: BossManualReaction[];
}

export interface HuntAutoRepeatConfig {
  enabled: boolean;
  mode: HuntAutoRepeatMode;
  maxRepeats?: number;
  completedRepeats: number;
  stopIfCapacityAbovePercent?: number;
  stopIfSuppliesMissing: boolean;
  stopIfStaminaBelowHours?: number;
  stopIfDeath: boolean;
  usePresetId?: string;
  autoPrepareBetweenRuns?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AutoRepeatSummary {
  startedNextRun: boolean;
  stopReason?: AutoRepeatStopReason;
  message: string;
}

export interface OfflineCharacterReport {
  characterId: string;
  characterName: string;
  actionType: CharacterStatus;
  actionLabel: string;
  completedOffline: boolean;
  readyToResolve: boolean;
  message: string;
}

export interface OfflineCatchUpReport {
  generatedAt: string;
  totalOfflineMs: number;
  consideredOfflineMs: number;
  characterReports: OfflineCharacterReport[];
  logs: string[];
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
  offhandType?: OffhandType;
  weaponProficiencyType?: WeaponProficiencyType;
  isContainer?: boolean;
  containerSlots?: number;
  allowedItemTypes?: ItemType[];
  containerType?: ContainerType;
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
  conditionResistancePenetrationPercent?: number;
  vocationRestriction?: Vocation[];
  levelRequirement?: number;
  equipmentFamily?: EquipmentFamilyId;
  progressionBand?: EquipmentProgressionBandId;
  equipmentSetId?: EquipmentSetId;
}

export interface InventoryItem {
  id: string;
  itemId: string;
  item: Item;
  quantity: number;
  ownerCharacterId?: string;
  parentContainerId?: string | null;
  locked?: boolean;
  location: "character" | "guildDepot";
  upgradeLevel?: EquipmentUpgradeLevel;
  tier?: EquipmentTier;
  imbuements?: ActiveImbuement[];
}

export interface MarketSellEntry {
  inventoryItemId: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unitValue: number;
  totalValue: number;
  source: SellSource;
}

export interface MarketSellResult {
  success: boolean;
  soldItems: MarketSellEntry[];
  totalGold: number;
  destination: SellDestination;
  logs: string[];
}

export interface MarketFilter {
  category: MarketItemCategory;
  rarity?: ItemRarity | "all";
  search?: string;
  source: SellSource;
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
  offhand?: InventoryItem;
  amulet?: InventoryItem;
  ring?: InventoryItem;
  backpack?: InventoryItem;
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
  conditionResistancePenetrationPercent: number;
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

export interface HuntSupplyRequirement {
  itemId: string;
  itemName: string;
  supplyType: SupplyType;
  recommendedQuantityPerHour: number;
  requiredForVocation?: Vocation[];
  optional?: boolean;
}

export interface HuntSupplyUsage {
  itemId: string;
  itemName: string;
  quantityUsed: number;
  valueUsed: number;
  supplyType: SupplyType;
}

export interface SupplyCheckEntry {
  itemId: string;
  itemName: string;
  supplyType: SupplyType;
  requiredQuantity: number;
  availableQuantity: number;
  missingQuantity: number;
  optional: boolean;
}

export interface SupplyCheckResult {
  hasRequiredSupplies: boolean;
  missingSupplies: SupplyCheckEntry[];
  availableSupplies: SupplyCheckEntry[];
  warnings: string[];
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
  entryCost: number;
  risk: BossRisk;
  resistances?: ElementalResistances;
  conditionResistances?: ConditionResistances;
  conditionImmunities?: CombatConditionType[];
  conditionAttacks?: CombatConditionDefinition[];
  evasionPercent?: number;
  armor?: number;
  defense?: number;
  minDamage?: number;
  maxDamage?: number;
  phases?: BossPhaseDefinition[];
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
  deathPenalties?: Record<string, DeathPenalty>;
  defeated: boolean;
  bossId: string;
  bossName: string;
  durationMinutes: number;
  experienceGained: number;
  goldGained: number;
  loot: BossLootResult[];
  renownGained: number;
  cooldownsApplied: BossCooldown[];
  combatSkillEffects?: CombatSkillPartyEffectSummary;
  executionPerformance?: BossExecutionPerformanceSummary;
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
  resistances?: ElementalResistances;
  conditionResistances?: ConditionResistances;
  conditionImmunities?: CombatConditionType[];
  conditionAttacks?: CombatConditionDefinition[];
  evasionPercent?: number;
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
  characterDepot: InventoryItem[];
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
  deathState?: CharacterDeathState;
  blessings?: string[];
  deathCount?: number;
  weaponProficiencies?: WeaponProficiencyState;
  monsterFocus?: MonsterFocusState;
  destiny?: CharacterDestinyState;
  cosmetics?: CharacterCosmetics;
  combatSkillLoadout?: CombatSkillLoadout;
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
  supplies?: HuntSupplyRequirement[];
  requiredAccess?: string;
  recommendedVocations?: Vocation[];
  tags: string[];
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  createdAt?: string;
  title: string;
  message: string;
  tone: "neutral" | "success" | "warning";
}

export interface HuntSimulationInput {
  character: Character;
  hunt: HuntArea;
  durationMinutes: number;
  deathRiskMultiplier?: number;
  combatSkillAttackBonusPercent?: number;
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
  monsterKills?: MonsterKillResult[];
  experienceGained: number;
  goldGained: number;
  lootItems: HuntLootResult[];
  totalLootValue: number;
  totalLootWeight: number;
  supplyCost: number;
  suppliesUsed: HuntSupplyUsage[];
  missingSupplies?: string[];
  supplyValueUsed: number;
  netProfit: number;
  loot: HuntLootResult[];
  rejectedLoot?: HuntLootResult[];
  skillProgress: Partial<Record<SkillName, number>>;
  deathPenalty?: DeathPenalty;
  charmBonusesApplied?: string[];
  monsterFocusBonusesApplied?: string[];
  combatSkillEffects?: CombatSkillEffectSummary;
  bestiaryLogs?: string[];
  deathReason?: string;
  logs: string[];
}

export interface MonsterKillResult {
  monsterId: string;
  monsterName: string;
  kills: number;
}

export interface CharmHuntBonuses {
  xpMultiplier: number;
  goldMultiplier: number;
  lootMultiplier: number;
  deathRiskMultiplier: number;
  supplyMultiplier: number;
  logs: string[];
}
