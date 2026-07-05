import { useEffect, useMemo, useState } from "react";
import { CharacterDetails } from "../character/CharacterDetails";
import { ActionPanel } from "../action/ActionPanel";
import { ActionSummaryCard } from "../action/ActionSummaryCard";
import { BestiaryPanel } from "../bestiary/BestiaryPanel";
import { BossPanel } from "../boss/BossPanel";
import { DeathPanel } from "../death/DeathPanel";
import { TempleServicesPanel } from "../death/TempleServicesPanel";
import { ExploreWindow } from "../explore/ExploreWindow";
import { SkillList } from "../character/SkillList";
import { EquipmentPanel } from "../equipment/EquipmentPanel";
import { ForgePanel } from "../forge/ForgePanel";
import { CharacterDepotPanel } from "../inventory/CharacterDepotPanel";
import { GuildDepotPanel } from "../inventory/GuildDepotPanel";
import { InventoryPanel } from "../inventory/InventoryPanel";
import { MarketPanel } from "../market/MarketPanel";
import { QuestPanel } from "../quest/QuestPanel";
import { TrainingPanel } from "../training/TrainingPanel";
import { GameWindow } from "../ui/GameWindow";
import { Panel } from "../ui/Panel";
import { MainPlayArea } from "./MainPlayArea";
import { getCollectionItemById, getCollectionItemsByCategory } from "../../data/collections";
import { dailyRewards } from "../../data/dailyRewards";
import { getActiveCharacterCosmetics } from "../../game-engine/collections/getActiveCharacterCosmetics";
import { isCollectionItemUnlocked } from "../../game-engine/collections/isCollectionItemUnlocked";
import { normalizeCollectionsState } from "../../game-engine/collections/normalizeCollectionsState";
import { canClaimDailyReward } from "../../game-engine/daily-reward/canClaimDailyReward";
import { getCurrentDailyReward } from "../../game-engine/daily-reward/getCurrentDailyReward";
import { getDailyRewardPreview } from "../../game-engine/daily-reward/getDailyRewardPreview";
import { normalizeDailyRewardState } from "../../game-engine/daily-reward/normalizeDailyRewardState";
import {
  monsterFocusBonusDescriptions,
  monsterFocusBonusLabels,
  monsterFocusBonusTypes,
} from "../../data/monsterFocus";
import { getAvailableFocusMonsters } from "../../game-engine/monster-focus/getAvailableFocusMonsters";
import { getMonsterFocusRerollCost } from "../../game-engine/monster-focus/rerollMonsterFocusBonus";
import { normalizeMonsterFocusState } from "../../game-engine/monster-focus/normalizeMonsterFocusState";
import { destinyNodes, getDestinyNodeById } from "../../data/destinyNodes";
import { calculateDestinyBonuses, formatDestinyBonusSummary } from "../../game-engine/destiny/calculateDestinyBonuses";
import { canUnlockDestinyNode } from "../../game-engine/destiny/canUnlockDestinyNode";
import { getDestinyResetCost } from "../../game-engine/destiny/resetDestinyPath";
import { getVisibleDestinyNodes, normalizeDestinyState } from "../../game-engine/destiny/normalizeDestinyState";
import { getEquippedWeaponProficiencyType } from "../../game-engine/weapon-proficiency/getEquippedWeaponProficiencyType";
import {
  WEAPON_PROFICIENCY_LABELS,
  WEAPON_PROFICIENCY_PERKS,
  WEAPON_PROFICIENCY_TYPES,
} from "../../game-engine/weapon-proficiency/weaponProficiencyDefinitions";
import {
  getWeaponProficiencyProgressPercent,
  normalizeWeaponProficiencies,
} from "../../game-engine/weapon-proficiency/weaponProficiencyProgression";
import type { TrainingResult } from "../../game-services/trainingService";
import type {
  Boss,
  BossParty,
  BossSimulationResult,
  Character,
  CollectionCategory,
  EquipmentSlot,
  Guild,
  GuildDepot,
  HuntArea,
  HuntAutoRepeatConfig,
  HuntPreparationResult,
  HuntSimulationResult,
  HuntSupplyPreset,
  InventoryItem,
  MarketItemCategory,
  MonsterFocusBonusType,
  Quest,
  PartyRole,
  SellSource,
  ShopDeliveryTarget,
  TrainingTarget,
  TrainingType,
} from "../../shared/types";

interface LastResultView {
  characterName: string;
  character: Character;
  hunt: HuntArea;
  result: HuntSimulationResult;
}

export type MainPanelTab =
  | "home"
  | "character"
  | "skills"
  | "blessings"
  | "proficiency"
  | "focus"
  | "destiny"
  | "collections"
  | "action"
  | "hunts"
  | "inventory"
  | "equipment"
  | "depot"
  | "market"
  | "forge"
  | "imbuing"
  | "training"
  | "quests"
  | "bosses"
  | "bestiary"
  | "daily"
  | "ranking"
  | "store"
  | "updates"
  | "wiki"
  | "settings";

interface MainPanelProps {
  selectedCharacter: Character;
  characters: Character[];
  guild: Guild;
  hunts: HuntArea[];
  quests: Quest[];
  bosses: Boss[];
  selectedHunt?: HuntArea;
  selectedBoss?: Boss;
  bossParty: BossParty;
  durationMinutes: number;
  lastPreparationResult?: HuntPreparationResult;
  lastResult?: LastResultView;
  lastTrainingResult?: TrainingResult;
  lastBossResult?: BossSimulationResult;
  lastQuestResult?: {
    success: boolean;
    died: boolean;
    accessUnlocked?: string;
    logs: string[];
  };
  activeTab: MainPanelTab;
  depot: GuildDepot;
  offlineReport?: import("../../shared/types").OfflineCatchUpReport;
  saveStatus?: string;
  onChangeTab: (tab: MainPanelTab) => void;
  onManualSave: () => void;
  onReloadSave: () => void;
  onResetSave: () => void;
  onSelectHunt: (hunt: HuntArea) => void;
  onChangeDuration: (durationMinutes: number) => void;
  onStartHunt: (autoRepeat?: HuntAutoRepeatConfig) => void;
  onFinishHunt: () => void;
  onStopHuntAutoRepeat: () => void;
  onCreateRecommendedPreset: () => void;
  onPrepareHunt: (preset: HuntSupplyPreset) => void;
  onDeleteHuntPreset: (presetId: string) => void;
  onSendToDepot: (inventoryItem: InventoryItem) => void;
  onSendToCharacterDepot: (inventoryItem: InventoryItem) => void;
  onSendCharacterDepotToInventory: (inventoryItem: InventoryItem) => void;
  onSendToCharacter: (inventoryItem: InventoryItem) => void;
  onSellMarketItems: (
    source: SellSource,
    inventoryItemIds: string[],
  ) => void;
  onSellMarketCategory: (
    source: SellSource,
    category: MarketItemCategory,
  ) => void;
  onBuyMarketItem: (
    itemId: string,
    quantity: number,
    unitPrice: number,
    deliveryTarget: ShopDeliveryTarget,
  ) => void;
  onClaimDailyReward: () => void;
  onActivateMonsterFocus: (
    slotIndex: number,
    monsterId: string,
    bonusType: MonsterFocusBonusType,
  ) => void;
  onClearMonsterFocus: (slotIndex: number) => void;
  onRerollMonsterFocus: (slotIndex: number) => void;
  onEquipCollectionItem: (itemId: string) => void;
  onMarkCollectionsSeen: () => void;
  onUnlockDestinyNode: (nodeId: string) => void;
  onResetDestinyPath: () => void;
  onToggleMarketItemLock: (source: SellSource, inventoryItemId: string) => void;
  onEquipItem: (inventoryItem: InventoryItem) => void;
  onMoveInventoryItemToContainer: (
    inventoryItem: InventoryItem,
    container: InventoryItem,
  ) => void;
  onMoveInventoryItemOutOfContainer: (inventoryItem: InventoryItem) => void;
  onUnequipItem: (slot: EquipmentSlot) => void;
  onStartTraining: (
    targetSkill: TrainingTarget,
    trainingType: TrainingType,
    durationMinutes: number,
    cost: number,
  ) => void;
  onFinishTraining: () => void;
  onCancelAction: () => void;
  onFinishTravel: () => void;
  onStartQuest: (quest: Quest) => void;
  onFinishQuest: (quest: Quest) => void;
  onSelectBoss: (boss: Boss) => void;
  onToggleBossPartyMember: (characterId: string) => void;
  onChangeBossPartyRole: (characterId: string, role: PartyRole) => void;
  onStartBoss: () => void;
  onFinishBoss: () => void;
  onCancelBoss: () => void;
  onClearBossCooldown: (characterId: string, bossId: string) => void;
  onReviveCharacter: () => void;
  onBuyBlessing: (blessingId: string) => void;
  onClaimBestiaryReward: (monsterId: string) => void;
  onUnlockCharm: (charmId: string) => void;
  onAssignCharm: (charmId: string, monsterId: string) => void;
  onRemoveCharm: (monsterId: string) => void;
  onUpgradeForgeItem: (inventoryItem: InventoryItem) => void;
  onIncreaseForgeTier: (inventoryItem: InventoryItem) => void;
  onApplyForgeImbuement: (inventoryItem: InventoryItem, imbuementId: string) => void;
  onRemoveForgeImbuements: (inventoryItem: InventoryItem, imbuementId?: string) => void;
}

export function MainPanel({
  selectedCharacter,
  characters,
  guild,
  hunts,
  quests,
  bosses,
  selectedHunt,
  selectedBoss,
  bossParty,
  durationMinutes,
  lastPreparationResult,
  lastResult,
  lastTrainingResult,
  lastBossResult,
  lastQuestResult,
  activeTab,
  depot,
  offlineReport,
  saveStatus,
  onChangeTab,
  onManualSave,
  onReloadSave,
  onResetSave,
  onSelectHunt,
  onChangeDuration,
  onStartHunt,
  onFinishHunt,
  onStopHuntAutoRepeat,
  onCreateRecommendedPreset,
  onPrepareHunt,
  onDeleteHuntPreset,
  onSendToDepot,
  onSendToCharacterDepot,
  onSendCharacterDepotToInventory,
  onSendToCharacter,
  onSellMarketItems,
  onSellMarketCategory,
  onBuyMarketItem,
  onClaimDailyReward,
  onActivateMonsterFocus,
  onClearMonsterFocus,
  onRerollMonsterFocus,
  onEquipCollectionItem,
  onMarkCollectionsSeen,
  onUnlockDestinyNode,
  onResetDestinyPath,
  onToggleMarketItemLock,
  onEquipItem,
  onMoveInventoryItemToContainer,
  onMoveInventoryItemOutOfContainer,
  onUnequipItem,
  onStartTraining,
  onFinishTraining,
  onCancelAction,
  onFinishTravel,
  onStartQuest,
  onFinishQuest,
  onSelectBoss,
  onToggleBossPartyMember,
  onChangeBossPartyRole,
  onStartBoss,
  onFinishBoss,
  onCancelBoss,
  onClearBossCooldown,
  onReviveCharacter,
  onBuyBlessing,
  onClaimBestiaryReward,
  onUnlockCharm,
  onAssignCharm,
  onRemoveCharm,
  onUpgradeForgeItem,
  onIncreaseForgeTier,
  onApplyForgeImbuement,
  onRemoveForgeImbuements,
}: MainPanelProps) {
  return (
    <section className="main-panel">
      {activeTab === "home" ? (
        <MainPlayArea
          character={selectedCharacter}
          characters={characters}
          guild={guild}
          lastHuntResult={lastResult}
          offlineReport={offlineReport}
          onOpenAction={() => onChangeTab("action")}
          onOpenExplore={() => onChangeTab("hunts")}
          selectedHunt={selectedHunt}
        />
      ) : null}

      <div className="main-tabs client-legacy-tabs">
        <TabButton activeTab={activeTab} label="Personagem" tab="character" onChangeTab={onChangeTab} />
        <TabButton activeTab={activeTab} label="Acao" tab="action" onChangeTab={onChangeTab} />
        <TabButton activeTab={activeTab} label="Inventario & Equipamento" tab="inventory" onChangeTab={onChangeTab} />
        <TabButton activeTab={activeTab} label="Depot" tab="depot" onChangeTab={onChangeTab} />
        <TabButton activeTab={activeTab} label="Market" tab="market" onChangeTab={onChangeTab} />
        <TabButton activeTab={activeTab} label="Forge" tab="forge" onChangeTab={onChangeTab} />
        <TabButton activeTab={activeTab} label="Hunts" tab="hunts" onChangeTab={onChangeTab} />
        <TabButton activeTab={activeTab} label="Quests" tab="quests" onChangeTab={onChangeTab} />
        <TabButton activeTab={activeTab} label="Bosses" tab="bosses" onChangeTab={onChangeTab} />
        <TabButton activeTab={activeTab} label="Treino" tab="training" onChangeTab={onChangeTab} />
        <TabButton activeTab={activeTab} label="Bestiary" tab="bestiary" onChangeTab={onChangeTab} />
      </div>

      {activeTab !== "home" ? (
      <GameWindow
        icon={getWindowIcon(activeTab)}
        onClose={() => onChangeTab("home")}
        size={activeTab === "character" || activeTab === "skills" || activeTab === "blessings" ? "medium" : "full"}
        subtitle={getWindowSubtitle(activeTab)}
        title={getWindowTitle(activeTab)}
      >
      <div className="tab-content client-window-content">
        {activeTab === "character" ? (
          <>
          <CharacterDetails character={selectedCharacter} guild={guild} />
          {selectedCharacter.status === "dead" ? (
            <Panel title="Death Report">
              <DeathPanel character={selectedCharacter} onRevive={onReviveCharacter} />
            </Panel>
          ) : null}
          <Panel title="Temple Services">
            <TempleServicesPanel
              character={selectedCharacter}
              guild={guild}
              onBuyBlessing={onBuyBlessing}
            />
          </Panel>
          <Panel title="Acao Atual">
            <ActionSummaryCard
              character={selectedCharacter}
              onViewAction={() => onChangeTab("action")}
            />
          </Panel>
          <Panel title="Skills">
            <SkillList character={selectedCharacter} skills={selectedCharacter.skills} />
          </Panel>
          </>
        ) : null}

        {activeTab === "skills" ? (
          <Panel title={`${selectedCharacter.name} Skills`}>
            <SkillList character={selectedCharacter} skills={selectedCharacter.skills} />
          </Panel>
        ) : null}

        {activeTab === "blessings" ? (
          <>
            {selectedCharacter.status === "dead" ? (
              <Panel title="Death Report">
                <DeathPanel character={selectedCharacter} onRevive={onReviveCharacter} />
              </Panel>
            ) : null}
            <Panel title="Temple Services">
              <TempleServicesPanel
                character={selectedCharacter}
                guild={guild}
                onBuyBlessing={onBuyBlessing}
              />
            </Panel>
          </>
        ) : null}

        {activeTab === "collections" ? (
          <CollectionsWindow
            character={selectedCharacter}
            guild={guild}
            onEquip={onEquipCollectionItem}
            onMarkSeen={onMarkCollectionsSeen}
          />
        ) : null}

        {activeTab === "proficiency" ? (
          <WeaponProficiencyWindow character={selectedCharacter} />
        ) : null}

        {activeTab === "focus" ? (
          <MonsterFocusWindow
            character={selectedCharacter}
            guild={guild}
            onActivate={onActivateMonsterFocus}
            onClear={onClearMonsterFocus}
            onReroll={onRerollMonsterFocus}
          />
        ) : null}

        {activeTab === "destiny" ? (
          <DestinyWindow
            character={selectedCharacter}
            onReset={onResetDestinyPath}
            onUnlock={onUnlockDestinyNode}
          />
        ) : null}

        {activeTab === "action" ? (
          <ActionPanel
            bossParty={bossParty}
            bosses={bosses}
            bestiary={guild.bestiary}
            characters={characters}
            hunts={hunts}
            onCancelAction={onCancelAction}
            onChangeTab={onChangeTab}
            onFinishBoss={onFinishBoss}
            onFinishHunt={onFinishHunt}
            onFinishQuest={onFinishQuest}
            onFinishTraining={onFinishTraining}
            onFinishTravel={onFinishTravel}
            onReviveCharacter={onReviveCharacter}
            onStopHuntAutoRepeat={onStopHuntAutoRepeat}
            quests={quests}
            selectedCharacter={selectedCharacter}
          />
        ) : null}

        {activeTab === "hunts" ? (
          <ExploreWindow
            bestiary={guild.bestiary}
            bossParty={bossParty}
            bosses={bosses}
            characters={characters}
            character={selectedCharacter}
            guild={guild}
            guildDepot={depot}
            durationMinutes={durationMinutes}
            hunts={hunts}
            lastBossResult={lastBossResult}
            lastPreparationResult={lastPreparationResult}
            lastQuestResult={lastQuestResult}
            lastResult={lastResult}
            lastTrainingResult={lastTrainingResult}
            onCancelBoss={onCancelBoss}
            onChangeBossPartyRole={onChangeBossPartyRole}
            onChangeDuration={onChangeDuration}
            onClearBossCooldown={onClearBossCooldown}
            onCreateRecommendedPreset={onCreateRecommendedPreset}
            onDeleteHuntPreset={onDeleteHuntPreset}
            onFinishBoss={onFinishBoss}
            onFinishHunt={onFinishHunt}
            onFinishQuest={onFinishQuest}
            onFinishTraining={onFinishTraining}
            onPrepareHunt={onPrepareHunt}
            onSelectBoss={onSelectBoss}
            onSelectHunt={onSelectHunt}
            onStartBoss={onStartBoss}
            onStartHunt={onStartHunt}
            onStartQuest={onStartQuest}
            onStartTraining={onStartTraining}
            onStopHuntAutoRepeat={onStopHuntAutoRepeat}
            onToggleBossPartyMember={onToggleBossPartyMember}
            presets={guild.huntPresets ?? []}
            quests={quests}
            selectedBoss={selectedBoss}
            selectedHunt={selectedHunt}
          />
        ) : null}

        {activeTab === "inventory" ? (
          <>
            <Panel title={`${selectedCharacter.name} Inventory`}>
              <InventoryPanel
                character={selectedCharacter}
                onEquipItem={onEquipItem}
                onMoveOutOfContainer={onMoveInventoryItemOutOfContainer}
                onMoveToContainer={onMoveInventoryItemToContainer}
                onSendToDepot={onSendToCharacterDepot}
                onSendToGuildDepot={onSendToDepot}
                onToggleLock={(inventoryItem) =>
                  onToggleMarketItemLock("character_inventory", inventoryItem.id)
                }
              />
            </Panel>
            <Panel title={`${selectedCharacter.name} Equipment`}>
              <EquipmentPanel character={selectedCharacter} onUnequip={onUnequipItem} />
            </Panel>
          </>
        ) : null}

        {activeTab === "depot" ? (
          <>
            <Panel title={`${selectedCharacter.name} Depot`}>
              <CharacterDepotPanel
                character={selectedCharacter}
                onSendToInventory={onSendCharacterDepotToInventory}
                onToggleLock={(inventoryItem) =>
                  onToggleMarketItemLock("character_depot", inventoryItem.id)
                }
              />
            </Panel>
            <Panel title="Guild Depot">
              <GuildDepotPanel
                depot={depot}
                onSendToCharacter={onSendToCharacter}
                onToggleLock={(inventoryItem) =>
                  onToggleMarketItemLock("guild_depot", inventoryItem.id)
                }
              />
            </Panel>
          </>
        ) : null}

        {activeTab === "market" ? (
          <Panel title="Market NPC">
            <MarketPanel
              character={selectedCharacter}
              guild={guild}
              guildDepot={depot}
              onBuyItem={onBuyMarketItem}
              onSellCategory={onSellMarketCategory}
              onSellItems={onSellMarketItems}
              onToggleLock={onToggleMarketItemLock}
            />
          </Panel>
        ) : null}

        {activeTab === "forge" ? (
          <Panel title="Forge Workshop">
            <ForgePanel
              character={selectedCharacter}
              guild={guild}
              guildDepot={depot}
              onApplyImbuement={onApplyForgeImbuement}
              onIncreaseTier={onIncreaseForgeTier}
              onRemoveImbuements={onRemoveForgeImbuements}
              onUpgradeItem={onUpgradeForgeItem}
            />
          </Panel>
        ) : null}

        {activeTab === "imbuing" ? (
          <Panel title="Imbuing Shrine">
            <ForgePanel
              character={selectedCharacter}
              guild={guild}
              guildDepot={depot}
              onApplyImbuement={onApplyForgeImbuement}
              onIncreaseTier={onIncreaseForgeTier}
              onRemoveImbuements={onRemoveForgeImbuements}
              onUpgradeItem={onUpgradeForgeItem}
            />
          </Panel>
        ) : null}

        {activeTab === "training" ? (
          <Panel title={`${selectedCharacter.name} Training`}>
          <TrainingPanel
            character={selectedCharacter}
            lastResult={lastTrainingResult}
            onFinishTraining={onFinishTraining}
            onStartTraining={onStartTraining}
          />
          </Panel>
        ) : null}

        {activeTab === "quests" ? (
          <Panel title={`${selectedCharacter.name} Quests`}>
            <QuestPanel
              character={selectedCharacter}
              lastResult={lastQuestResult}
              onFinishQuest={onFinishQuest}
              onStartQuest={onStartQuest}
              quests={quests}
            />
          </Panel>
        ) : null}

        {activeTab === "bosses" ? (
          <Panel title="Bosses">
            <BossPanel
              bosses={bosses}
              characters={characters}
              lastResult={lastBossResult}
              onCancelBoss={onCancelBoss}
              onChangeRole={onChangeBossPartyRole}
              onClearCooldown={onClearBossCooldown}
              onFinishBoss={onFinishBoss}
              onSelectBoss={onSelectBoss}
              onStartBoss={onStartBoss}
              onToggleMember={onToggleBossPartyMember}
              party={bossParty}
              selectedBoss={selectedBoss}
              selectedCharacter={selectedCharacter}
            />
          </Panel>
        ) : null}

        {activeTab === "bestiary" ? (
          <Panel title="Guild Bestiary">
            <BestiaryPanel
              guild={guild}
              onAssignCharm={onAssignCharm}
              onClaimReward={onClaimBestiaryReward}
              onRemoveCharm={onRemoveCharm}
              onUnlockCharm={onUnlockCharm}
            />
          </Panel>
        ) : null}

        {activeTab === "daily" ? (
          <DailyRewardWindow guild={guild} onClaim={onClaimDailyReward} />
        ) : null}
        {activeTab === "ranking" ? <RankingWindow characters={characters} /> : null}
        {activeTab === "store" ? <StoreWindow /> : null}
        {activeTab === "updates" ? <UpdatesWindow /> : null}
        {activeTab === "wiki" ? <WikiWindow /> : null}
        {activeTab === "settings" ? (
          <SettingsWindow
            onManualSave={onManualSave}
            onReloadSave={onReloadSave}
            onResetSave={onResetSave}
            saveStatus={saveStatus}
          />
        ) : null}
      </div>
      </GameWindow>
      ) : null}
    </section>
  );
}

function getWindowTitle(tab: MainPanelTab) {
  const titles: Record<MainPanelTab, string> = {
    home: "Guild Hunt Idle",
    character: "Character Details",
    skills: "Skills",
    blessings: "Blessings",
    proficiency: "Weapon Proficiency",
    focus: "Monster Focus",
    destiny: "Path of Destiny",
    collections: "Collections",
    action: "Current Action",
    hunts: "Explorar / Modos de Jogo",
    inventory: "Inventory & Equipment",
    equipment: "Equipment",
    depot: "Depot",
    market: "Market NPC",
    forge: "Forge",
    imbuing: "Imbuing Shrine",
    training: "Training",
    quests: "Quests",
    bosses: "Bosses",
    bestiary: "Bestiary & Charms",
    daily: "Daily Reward",
    ranking: "Local Ranking",
    store: "Store",
    updates: "Updates",
    wiki: "Wiki",
    settings: "Settings",
  };

  return titles[tab];
}

function getWindowSubtitle(tab: MainPanelTab) {
  if (tab === "hunts") return "Hunts, bosses, training, and quests use the real game systems.";
  if (tab === "imbuing") return "Imbuements are available here; upgrade and tier controls remain visible for now.";
  if (tab === "focus") return "Per-character prey contracts with Bestiary targets and temporary hunt bonuses.";
  if (tab === "destiny") return "A real per-character passive wheel powered by level-earned Destiny Points.";
  if (tab === "collections") return "Guild-wide cosmetic unlocks with per-character outfit, mount, and avatar choices.";
  if (tab === "daily") return "Offline local guild rewards with a seven-day cycle and simple streak.";
  if (tab === "store") return "Client-style preview for a future system.";
  return undefined;
}

function getWindowIcon(tab: MainPanelTab) {
  const icons: Partial<Record<MainPanelTab, string>> = {
    character: "D",
    skills: "S",
    blessings: "B",
    hunts: "E",
    market: "M",
    forge: "F",
    imbuing: "I",
    daily: "D",
    ranking: "R",
    store: "S",
    updates: "U",
    wiki: "W",
    settings: "G",
  };

  return icons[tab];
}

function CollectionsWindow({
  character,
  guild,
  onEquip,
  onMarkSeen,
}: {
  character: Character;
  guild: Guild;
  onEquip: (itemId: string) => void;
  onMarkSeen: () => void;
}) {
  const [activeCategory, setActiveCategory] = useState<CollectionCategory>("outfit");
  const collections = normalizeCollectionsState(guild.collections);
  const activeCosmetics = getActiveCharacterCosmetics(character, collections);
  const categories: CollectionCategory[] = ["outfit", "mount", "avatar"];
  const newCount = collections.newlyUnlockedCollectionItemIds.length;

  useEffect(() => {
    if (newCount > 0) onMarkSeen();
  }, [newCount, onMarkSeen]);

  const categoryItems = getCollectionItemsByCategory(activeCategory);

  return (
    <div className="collections-window">
      <div className="client-summary-grid">
        <div>
          <span>Character</span>
          <strong>{character.name}</strong>
        </div>
        <div>
          <span>Active Outfit</span>
          <strong>{activeCosmetics.outfit?.name ?? "None"}</strong>
        </div>
        <div>
          <span>Active Mount</span>
          <strong>{activeCosmetics.mount?.name ?? "None"}</strong>
        </div>
        <div>
          <span>Active Avatar</span>
          <strong>{activeCosmetics.avatar?.name ?? "None"}</strong>
        </div>
      </div>

      <div className="collection-tabs">
        {categories.map((category) => {
          const items = getCollectionItemsByCategory(category);
          const unlocked = items.filter((item) =>
            collections.unlockedCollectionItemIds.includes(item.id),
          ).length;

          return (
            <button
              className={activeCategory === category ? "is-selected" : ""}
              key={category}
              onClick={() => setActiveCategory(category)}
              type="button"
            >
              {formatCollectionCategory(category)} {unlocked}/{items.length}
            </button>
          );
        })}
      </div>

      <Panel title={formatCollectionCategory(activeCategory)}>
        <div className="collection-card-grid">
          {categoryItems.map((item) => {
            const unlocked = isCollectionItemUnlocked(collections, item.id);
            const equipped = isCosmeticEquipped(activeCosmetics.cosmetics, item.id);
            const vocationAllowed = !item.allowedVocations || item.allowedVocations.includes(character.vocation);

            return (
              <div
                className={`collection-card rarity-${item.rarity} ${unlocked ? "is-unlocked" : "is-locked"} ${equipped ? "is-equipped" : ""}`.trim()}
                key={item.id}
              >
                <div className="collection-preview">
                  <strong>{item.previewValue}</strong>
                </div>
                <div>
                  <span>{item.rarity} / {item.unlockSource}</span>
                  <strong>{item.name}</strong>
                  <p>{item.description}</p>
                  <small>
                    {equipped
                      ? "Equipped"
                      : unlocked
                        ? "Unlocked"
                        : item.unlockRequirementText ?? "Locked for a future unlock"}
                  </small>
                  {item.allowedVocations ? <em>{item.allowedVocations.join(", ")}</em> : null}
                </div>
                <button
                  disabled={!unlocked || equipped || !vocationAllowed}
                  onClick={() => onEquip(item.id)}
                  type="button"
                >
                  {equipped ? "Equipped" : unlocked && vocationAllowed ? "Equip" : "Locked"}
                </button>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

function isCosmeticEquipped(cosmetics: ReturnType<typeof getActiveCharacterCosmetics>["cosmetics"], itemId: string) {
  return cosmetics.activeOutfitId === itemId || cosmetics.activeMountId === itemId || cosmetics.activeAvatarId === itemId;
}

function formatCollectionCategory(category: CollectionCategory) {
  if (category === "outfit") return "Outfits";
  if (category === "mount") return "Mounts";
  return "Avatars";
}

function WeaponProficiencyWindow({ character }: { character: Character }) {
  const proficiencies = normalizeWeaponProficiencies(character.weaponProficiencies);
  const activeWeaponType = getEquippedWeaponProficiencyType(character.equipment.weapon);
  const activeShieldType = getEquippedWeaponProficiencyType(character.equipment.offhand);

  return (
    <div className="weapon-proficiency-window">
      <div className="client-summary-grid">
        <div>
          <span>Main mastery</span>
          <strong>{activeWeaponType ? WEAPON_PROFICIENCY_LABELS[activeWeaponType] : "None"}</strong>
        </div>
        <div>
          <span>Shield mastery</span>
          <strong>{activeShieldType === "shield" ? "Shield Mastery" : "None"}</strong>
        </div>
      </div>

      <div className="weapon-proficiency-grid">
        {WEAPON_PROFICIENCY_TYPES.map((type) => {
          const progress = proficiencies[type];
          const progressPercent = Math.round(getWeaponProficiencyProgressPercent(progress));
          const perks = WEAPON_PROFICIENCY_PERKS[type];
          const isActive = type === activeWeaponType || type === activeShieldType;

          return (
            <div
              className={`weapon-proficiency-card ${isActive ? "is-active" : ""}`.trim()}
              key={type}
            >
              <div className="weapon-proficiency-heading">
                <div>
                  <span>{isActive ? "Equipped" : "Mastery"}</span>
                  <strong>{WEAPON_PROFICIENCY_LABELS[type]}</strong>
                </div>
                <em>Lv {progress.level}</em>
              </div>
              <div className="level-progress-track" aria-hidden="true">
                <span style={{ width: `${progressPercent}%` }} />
              </div>
              <p>
                {progress.experience.toLocaleString("en-US")} XP /{" "}
                {progress.level >= 20
                  ? "Max level"
                  : `${progress.experienceToNextLevel.toLocaleString("en-US")} to next`}
              </p>
              <div className="weapon-perk-list">
                {perks.map((perk) => {
                  const unlocked = progress.unlockedPerkIds.includes(perk.id);

                  return (
                    <div className={unlocked ? "is-unlocked" : ""} key={perk.id}>
                      <span>Level {perk.requiredLevel}</span>
                      <strong>{perk.name}</strong>
                      <small>{unlocked ? "Unlocked" : "Locked"} / {perk.description}</small>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonsterFocusWindow({
  character,
  guild,
  onActivate,
  onClear,
  onReroll,
}: {
  character: Character;
  guild: Guild;
  onActivate: (slotIndex: number, monsterId: string, bonusType: MonsterFocusBonusType) => void;
  onClear: (slotIndex: number) => void;
  onReroll: (slotIndex: number) => void;
}) {
  const focus = normalizeMonsterFocusState(character.monsterFocus);
  const knownMonsters = getAvailableFocusMonsters(guild.bestiary);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);
  const [selectedMonsterId, setSelectedMonsterId] = useState(
    knownMonsters[0]?.monsterId ?? "",
  );
  const [selectedBonusType, setSelectedBonusType] = useState<MonsterFocusBonusType>("experience");
  const selectedSlot = focus.slots[selectedSlotIndex] ?? focus.slots[0];
  const canActivate =
    Boolean(selectedMonsterId) &&
    (selectedSlot?.status === "empty" || selectedSlot?.status === "expired");

  useEffect(() => {
    if (!focus.slots[selectedSlotIndex] || focus.slots[selectedSlotIndex].status === "locked") {
      setSelectedSlotIndex(focus.slots.find((slot) => slot.status !== "locked")?.slotIndex ?? 0);
    }
  }, [character.id, focus.slots, selectedSlotIndex]);

  useEffect(() => {
    if (knownMonsters.length === 0) {
      if (selectedMonsterId !== "") setSelectedMonsterId("");
      return;
    }

    if (!knownMonsters.some((monster) => monster.monsterId === selectedMonsterId)) {
      setSelectedMonsterId(knownMonsters[0]?.monsterId ?? "");
    }
  }, [knownMonsters, selectedMonsterId]);

  return (
    <div className="monster-focus-window">
      <div className="client-summary-grid">
        <div>
          <span>Character</span>
          <strong>{character.name}</strong>
        </div>
        <div>
          <span>Known targets</span>
          <strong>{knownMonsters.length}</strong>
        </div>
        <div>
          <span>Reroll cost</span>
          <strong>
            {selectedSlot?.status === "active"
              ? `${getMonsterFocusRerollCost(character, selectedSlot.slotIndex).toLocaleString("en-US")}g`
              : "-"}
          </strong>
        </div>
      </div>

      <Panel title="Focus Slots">
        <div className="monster-focus-slots">
          {focus.slots.map((slot) => (
            <button
              className={`monster-focus-slot is-${slot.status} ${selectedSlotIndex === slot.slotIndex ? "is-selected" : ""}`.trim()}
              disabled={slot.status === "locked"}
              key={slot.slotIndex}
              onClick={() => setSelectedSlotIndex(slot.slotIndex)}
              type="button"
            >
              <span>Slot {slot.slotIndex + 1}</span>
              <strong>{formatFocusSlotTitle(slot, knownMonsters)}</strong>
              <small>{formatFocusSlotDetail(slot)}</small>
            </button>
          ))}
        </div>
      </Panel>

      {selectedSlot?.status === "active" ? (
        <Panel title="Active Contract">
          <div className="monster-focus-active">
            <div>
              <span>Target</span>
              <strong>{formatFocusSlotTitle(selectedSlot, knownMonsters)}</strong>
            </div>
            <div>
              <span>Bonus</span>
              <strong>
                {selectedSlot.bonusType ? monsterFocusBonusLabels[selectedSlot.bonusType] : "-"}
              </strong>
            </div>
            <div>
              <span>Power</span>
              <strong>{selectedSlot.bonusPercent ?? 0}%</strong>
            </div>
            <div>
              <span>Remaining</span>
              <strong>{selectedSlot.remainingHunts ?? 0}/10</strong>
            </div>
            <div className="hunt-action-buttons">
              <button onClick={() => onReroll(selectedSlot.slotIndex)} type="button">
                Reroll Bonus
              </button>
              <button onClick={() => onClear(selectedSlot.slotIndex)} type="button">
                Clear
              </button>
            </div>
          </div>
        </Panel>
      ) : null}

      <Panel title="Activate Focus">
        {knownMonsters.length > 0 ? (
          <div className="monster-focus-activate">
            <label>
              <span>Known creature</span>
              <select
                onChange={(event) => setSelectedMonsterId(event.target.value)}
                value={selectedMonsterId}
              >
                {knownMonsters.map((monster) => (
                  <option key={monster.monsterId} value={monster.monsterId}>
                    {monster.monsterName} - {monster.stage} - {monster.kills} kills
                  </option>
                ))}
              </select>
            </label>
            <div className="monster-focus-bonus-grid">
              {monsterFocusBonusTypes.map((type) => (
                <button
                  className={selectedBonusType === type ? "is-selected" : ""}
                  key={type}
                  onClick={() => setSelectedBonusType(type)}
                  type="button"
                >
                  <strong>{monsterFocusBonusLabels[type]}</strong>
                  <span>{monsterFocusBonusDescriptions[type]}</span>
                </button>
              ))}
            </div>
            <button
              className="action-command-button"
              disabled={!canActivate}
              onClick={() =>
                onActivate(selectedSlot?.slotIndex ?? 0, selectedMonsterId, selectedBonusType)
              }
              type="button"
            >
              {selectedSlot?.status === "active" ? "Clear Slot First" : "Activate Focus"}
            </button>
          </div>
        ) : (
          <div className="client-info-card">
            <strong>No known creatures yet</strong>
            <p>Discover creatures through hunts to unlock Monster Focus targets.</p>
          </div>
        )}
      </Panel>
    </div>
  );
}

function formatFocusSlotTitle(
  slot: ReturnType<typeof normalizeMonsterFocusState>["slots"][number],
  knownMonsters: ReturnType<typeof getAvailableFocusMonsters>,
) {
  if (slot.status === "locked") return "Locked";
  if (slot.status === "empty") return "Empty";
  if (!slot.monsterId) return "Invalid target";

  return knownMonsters.find((monster) => monster.monsterId === slot.monsterId)?.monsterName ?? slot.monsterId;
}

function formatFocusSlotDetail(
  slot: ReturnType<typeof normalizeMonsterFocusState>["slots"][number],
) {
  if (slot.status === "locked") return "Future slot";
  if (slot.status === "empty") return "Ready for a target";
  if (!slot.bonusType) return "Invalid bonus";

  return `${monsterFocusBonusLabels[slot.bonusType]} / ${slot.bonusPercent ?? 0}% / ${slot.remainingHunts ?? 0} hunts`;
}

function DestinyWindow({
  character,
  onUnlock,
  onReset,
}: {
  character: Character;
  onUnlock: (nodeId: string) => void;
  onReset: () => void;
}) {
  const destiny = normalizeDestinyState(character);
  const visibleNodes = useMemo(
    () => getVisibleDestinyNodes(character.vocation),
    [character.vocation],
  );
  const [selectedNodeId, setSelectedNodeId] = useState(
    visibleNodes[0]?.id ?? destinyNodes[0]?.id ?? "",
  );
  const selectedNode =
    visibleNodes.find((node) => node.id === selectedNodeId) ??
    visibleNodes[0] ??
    destinyNodes[0];
  const unlockStatus = selectedNode
    ? canUnlockDestinyNode({ ...character, destiny }, selectedNode.id)
    : { canUnlock: false, reason: "No node selected." };
  const activeBonuses = calculateDestinyBonuses({ ...character, destiny });
  const resetCost = getDestinyResetCost({ ...character, destiny });

  useEffect(() => {
    if (!visibleNodes.some((node) => node.id === selectedNodeId)) {
      setSelectedNodeId(visibleNodes[0]?.id ?? "");
    }
  }, [character.id, selectedNodeId, visibleNodes]);

  return (
    <div className="destiny-window">
      <div className="client-summary-grid">
        <div>
          <span>Character</span>
          <strong>{character.name}</strong>
        </div>
        <div>
          <span>Vocation</span>
          <strong>{character.vocation}</strong>
        </div>
        <div>
          <span>Level</span>
          <strong>{character.level}</strong>
        </div>
        <div>
          <span>Destiny Points</span>
          <strong>
            {destiny.availablePoints} available / {destiny.totalEarnedPoints} earned
          </strong>
        </div>
      </div>

      <div className="destiny-layout">
        <Panel title="Path of Destiny">
          <div className="destiny-wheel" role="list">
            <svg aria-hidden="true" className="destiny-links" viewBox="0 0 100 100">
              {visibleNodes.flatMap((node) =>
                node.prerequisiteNodeIds
                  .map((requiredId) => {
                    const prerequisite = visibleNodes.find((candidate) => candidate.id === requiredId);
                    if (!prerequisite) return null;

                    return (
                      <line
                        className={
                          destiny.unlockedNodeIds.includes(node.id) &&
                          destiny.unlockedNodeIds.includes(prerequisite.id)
                            ? "is-unlocked"
                            : ""
                        }
                        key={`${requiredId}-${node.id}`}
                        x1={prerequisite.position.x}
                        x2={node.position.x}
                        y1={prerequisite.position.y}
                        y2={node.position.y}
                      />
                    );
                  })
                  .filter(Boolean),
              )}
            </svg>
            {visibleNodes.map((node) => {
              const status = destiny.unlockedNodeIds.includes(node.id)
                ? "unlocked"
                : canUnlockDestinyNode({ ...character, destiny }, node.id).canUnlock
                  ? "available"
                  : "locked";

              return (
                <button
                  className={`destiny-node is-${node.shape} is-${node.category} is-${status} ${selectedNode.id === node.id ? "is-selected" : ""}`.trim()}
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  role="listitem"
                  style={{ left: `${node.position.x}%`, top: `${node.position.y}%` }}
                  type="button"
                >
                  <span>{node.shape}</span>
                  <strong>{node.name}</strong>
                </button>
              );
            })}
          </div>
        </Panel>

        <Panel title="Node Details">
          {selectedNode ? (
            <div className="destiny-details">
              <span>{selectedNode.category} / {selectedNode.shape}</span>
              <strong>{selectedNode.name}</strong>
              <p>{selectedNode.description}</p>
              <div className="destiny-detail-grid">
                <div>
                  <span>Cost</span>
                  <strong>{selectedNode.cost}</strong>
                </div>
                <div>
                  <span>Required Level</span>
                  <strong>{selectedNode.requiredLevel}</strong>
                </div>
                <div>
                  <span>Vocation</span>
                  <strong>{selectedNode.allowedVocations?.join(", ") ?? "Any"}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>
                    {destiny.unlockedNodeIds.includes(selectedNode.id)
                      ? "Unlocked"
                      : unlockStatus.reason}
                  </strong>
                </div>
              </div>
              <p>
                Bonus: {formatDestinyBonusSummary(selectedNode.bonus)}
              </p>
              <p>
                Prerequisites:{" "}
                {selectedNode.prerequisiteNodeIds
                  .map((nodeId) => getDestinyNodeById(nodeId)?.name ?? nodeId)
                  .join(", ") || "None"}
              </p>
              <button
                className="action-command-button"
                disabled={!unlockStatus.canUnlock}
                onClick={() => onUnlock(selectedNode.id)}
                type="button"
              >
                Unlock Node
              </button>
              <button
                className="destiny-reset-button"
                disabled={resetCost <= 0}
                onClick={onReset}
                type="button"
              >
                Reset Path ({resetCost.toLocaleString("en-US")}g)
              </button>
            </div>
          ) : null}
        </Panel>
      </div>

      <Panel title="Active Destiny Bonuses">
        <div className="client-info-card">
          <strong>{destiny.unlockedNodeIds.length} node(s) unlocked</strong>
          <p>{formatDestinyBonusSummary(activeBonuses)}</p>
        </div>
      </Panel>
    </div>
  );
}

function DailyRewardWindow({
  guild,
  onClaim,
}: {
  guild: Guild;
  onClaim: () => void;
}) {
  const dailyReward = normalizeDailyRewardState(guild.dailyReward);
  const currentReward = getCurrentDailyReward(dailyReward);
  const canClaim = canClaimDailyReward(dailyReward);
  const latestClaim = dailyReward.claimHistory.at(-1);
  const latestClaimedToday = dailyReward.claimedToday ? latestClaim : undefined;

  return (
    <div className="daily-reward-window">
      <div className="client-summary-grid">
        <div>
          <span>Status</span>
          <strong>{canClaim ? "Available today" : "Already claimed today"}</strong>
        </div>
        <div>
          <span>Current Streak</span>
          <strong>{dailyReward.currentStreak} day{dailyReward.currentStreak === 1 ? "" : "s"}</strong>
        </div>
        <div>
          <span>Total Claims</span>
          <strong>{dailyReward.totalClaims}</strong>
        </div>
        <div>
          <span>{canClaim ? "Reward" : "Next Reward"}</span>
          <strong>{currentReward?.label ?? "Gold fallback"}</strong>
        </div>
      </div>

      <Panel title="Seven Day Cycle">
        <div className="daily-reward-grid">
          {dailyRewards.map((reward) => {
            const status = getDailyRewardCardStatus(reward.day, dailyReward.cycleDay, latestClaimedToday?.day);

            return (
              <div className={`daily-reward-card is-${status}`} key={reward.day}>
                <span>Day {reward.day}</span>
                <strong>{getDailyRewardPreview(reward)}</strong>
                <em>{status}</em>
                <h3>{reward.label}</h3>
                <p>{reward.description}</p>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel title="Claim">
        <div className="client-info-card daily-claim-card">
          <strong>{currentReward?.label ?? "Daily Reward"}</strong>
          <p>{currentReward?.description ?? "Fallback gold if reward data is unavailable."}</p>
          <button
            className="action-command-button"
            disabled={!canClaim}
            onClick={onClaim}
            type="button"
          >
            {canClaim ? "Claim Reward" : "Claimed Today"}
          </button>
        </div>
      </Panel>

      <Panel title="Recent Claims">
        {dailyReward.claimHistory.length > 0 ? (
          <div className="daily-history-list">
            {[...dailyReward.claimHistory].reverse().slice(0, 6).map((claim) => (
              <div key={`${claim.claimedAt}-${claim.day}`}>
                <span>Day {claim.day}</span>
                <strong>{claim.label}</strong>
                <small>{new Date(claim.claimedAt).toLocaleDateString("en-US")}</small>
              </div>
            ))}
          </div>
        ) : (
          <div className="client-info-card">
            <strong>No claims yet</strong>
            <p>Claim the available reward to start the guild streak.</p>
          </div>
        )}
      </Panel>
    </div>
  );
}

function getDailyRewardCardStatus(day: number, cycleDay: number, claimedTodayDay?: number) {
  if (claimedTodayDay === day) return "claimed";
  if (cycleDay === day) return "current";

  return "upcoming";
}

function RankingWindow({ characters }: { characters: Character[] }) {
  const ranked = [...characters].sort((a, b) => b.experience - a.experience);

  return (
    <Panel title="Experience Ranking">
      <div className="ranking-list">
        {ranked.map((character, index) => (
          <div key={character.id}>
            <span>#{index + 1}</span>
            <strong>{character.name}</strong>
            <em>Level {character.level} / {character.experience.toLocaleString("en-US")} XP</em>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function StoreWindow() {
  const storeItems = ["outfit-noble-adventurer", "mount-merchant-cart"]
    .map((itemId) => getCollectionItemById(itemId))
    .filter(Boolean);

  return (
    <Panel title="Cosmetic Store">
      <div className="client-placeholder-grid">
        <div className="client-info-card">
          <strong>Cosmetics</strong>
          <p>Cosmetic store planned for future versions.</p>
        </div>
        {storeItems.map((item) => (
          <div className="client-info-card" key={item?.id}>
            <strong>{item?.name}</strong>
            <p>{item?.unlockRequirementText ?? "Future store placeholder. No purchase is available."}</p>
          </div>
        ))}
        <div className="client-info-card">
          <strong>Boosts</strong>
          <p>Future placeholder only; progression is not pay-gated.</p>
        </div>
      </div>
    </Panel>
  );
}

function UpdatesWindow() {
  return (
    <Panel title="Changelog">
      <div className="client-info-card">
        <strong>Etapa 20</strong>
        <p>Client-style layout, topbar navigation, character side menu, right character panel, and game windows.</p>
      </div>
    </Panel>
  );
}

function WikiWindow() {
  return (
    <Panel title="Guild Wiki">
      <div className="client-placeholder-grid">
        {["Hunts", "Supplies", "Auto-repeat", "Bless", "Bestiary", "Forge", "Imbuing"].map((entry) => (
          <div className="client-info-card" key={entry}>
            <strong>{entry}</strong>
            <p>Local guide entry planned for a future content pass.</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function SettingsWindow({
  saveStatus,
  onManualSave,
  onReloadSave,
  onResetSave,
}: {
  saveStatus?: string;
  onManualSave: () => void;
  onReloadSave: () => void;
  onResetSave: () => void;
}) {
  return (
    <Panel title="Settings">
      <div className="client-info-card settings-save-card">
        <strong>{saveStatus ?? "SQLite local save"}</strong>
        <p>Local save controls for this offline client.</p>
        <div className="settings-command-row">
          <button onClick={onManualSave} type="button">Save now</button>
          <button onClick={onReloadSave} type="button">Reload save</button>
          <button onClick={onResetSave} type="button">Reset save</button>
        </div>
      </div>
    </Panel>
  );
}

function PlaceholderCards({
  entries,
  locked = false,
}: {
  entries: string[];
  locked?: boolean;
}) {
  return (
    <div className="collection-grid">
      {entries.map((entry) => (
        <div className={locked ? "is-locked" : ""} key={entry}>
          <strong>{entry}</strong>
          <span>{locked ? "Future" : "Preview"}</span>
        </div>
      ))}
    </div>
  );
}

function TabButton({
  activeTab,
  label,
  tab,
  onChangeTab,
}: {
  activeTab: MainPanelTab;
  label: string;
  tab: MainPanelTab;
  onChangeTab: (tab: MainPanelTab) => void;
}) {
  return (
    <button
      className={activeTab === tab ? "is-selected" : ""}
      onClick={() => onChangeTab(tab)}
      type="button"
    >
      {label}
    </button>
  );
}
