import { useEffect, useRef, useState } from "react";
import { CharacterDetails } from "../character/CharacterDetails";
import { ActionPanel } from "../action/ActionPanel";
import { BestiaryPanel } from "../bestiary/BestiaryPanel";
import { MonsterFocusHall } from "../bestiary/MonsterFocusHall";
import { BossPanel } from "../boss/BossPanel";
import { BlessingsHall } from "../death/BlessingsHall";
import { CollectionsHall } from "../collections/CollectionsHall";
import { DailyRewardHall } from "../daily/DailyRewardHall";
import { DestinyHall } from "../destiny/DestinyHall";
import { ExploreWindow } from "../explore/ExploreWindow";
import { SkillsProgressionPanel } from "../character/SkillsProgressionPanel";
import { WeaponProficiencyPanel } from "../character/WeaponProficiencyPanel";
import { EquipmentPanel } from "../equipment/EquipmentPanel";
import { ForgePanel } from "../forge/ForgePanel";
import { CharacterDepotPanel } from "../inventory/CharacterDepotPanel";
import { GuildDepotPanel } from "../inventory/GuildDepotPanel";
import { InventoryPanel } from "../inventory/InventoryPanel";
import { MarketPanel } from "../market/MarketPanel";
import { GuildHeadquartersHall } from "../headquarters/GuildHeadquartersHall";
import { GuildContractsBoard } from "../contracts/GuildContractsBoard";
import { GuildStaffHall } from "../staff/GuildStaffHall";
import { GuildTreasuryHall } from "../treasury/GuildTreasuryHall";
import { GuildProjectsHall } from "../projects/GuildProjectsHall";
import { GuildRecruitmentBoard } from "../recruitment/GuildRecruitmentBoard";
import { QuestPanel } from "../quest/QuestPanel";
import { LocalRankingHall } from "../ranking/LocalRankingHall";
import { RegionProgressionPanel } from "../region/RegionProgressionPanel";
import { CosmeticShowcaseHall } from "../store/CosmeticShowcaseHall";
import { SettingsHall } from "../settings/SettingsHall";
import { TrainingPanel } from "../training/TrainingPanel";
import { UpdatesHall } from "../updates/UpdatesHall";
import { GuildCodexHall } from "../wiki/GuildCodexHall";
import { GameWindow } from "../ui/GameWindow";
import { Panel } from "../ui/Panel";
import { MainPlayArea } from "./MainPlayArea";
import type { TrainingResult } from "../../game-services/trainingService";
import type { ClientPreferences } from "../../client-preferences/clientPreferences";
import type {
  Boss,
  BossParty,
  BossSimulationResult,
  ActivityLogEntry,
  Character,
  EquipmentSlot,
  Guild,
  GuildSpecialistId,
  GuildTreasuryTransactionType,
  GuildDepot,
  HuntArea,
  HuntAutoRepeatConfig,
  HuntSimulationResult,
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
  | "headquarters"
  | "contracts"
  | "staff"
  | "treasury"
  | "projects"
  | "recruitment"
  | "skills"
  | "blessings"
  | "proficiency"
  | "focus"
  | "destiny"
  | "collections"
  | "action"
  | "atlas"
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
  logs: ActivityLogEntry[];
  hunts: HuntArea[];
  quests: Quest[];
  bosses: Boss[];
  selectedHunt?: HuntArea;
  selectedBoss?: Boss;
  bossParty: BossParty;
  durationMinutes: number;
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
  clientPreferences: ClientPreferences;
  onChangeTab: (tab: MainPanelTab) => void;
  onChangeClientPreferences: (updates: Partial<ClientPreferences>) => void;
  onSelectCharacter: (characterId: string) => void;
  onEquipGuildTitle: (titleId: string | null) => void;
  onUpgradeGuildFacility: (facilityId: import("../../shared/types").GuildFacilityId) => void;
  onStartGuildExpedition: (contractId: string, assignedCharacterIds: string[]) => void;
  onCompleteGuildExpedition: () => void;
  onHireGuildSpecialist: (specialistId: GuildSpecialistId) => void;
  onAssignGuildSpecialist: (specialistId: GuildSpecialistId | null) => void;
  onTransferGuildTreasuryGold: (type: GuildTreasuryTransactionType, amount: number) => void;
  onFundGuildProjectPhase: (projectId: string) => void;
  onRecruitGuildCandidate: (candidateId: string) => void;
  onManualSave: () => void;
  onReloadSave: () => void;
  onResetSave: () => void;
  onResetClientPreferences: () => void;
  onSelectHunt: (hunt: HuntArea) => void;
  onClearSelectedHunt: () => void;
  onChangeDuration: (durationMinutes: number) => void;
  onStartHunt: (autoRepeat?: HuntAutoRepeatConfig) => void;
  onFinishHunt: () => void;
  onReturnToCity: () => void;
  onStopHuntAutoRepeat: () => void;
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
  logs,
  hunts,
  quests,
  bosses,
  selectedHunt,
  selectedBoss,
  bossParty,
  durationMinutes,
  lastResult,
  lastTrainingResult,
  lastBossResult,
  lastQuestResult,
  activeTab,
  depot,
  offlineReport,
  saveStatus,
  clientPreferences,
  onChangeTab,
  onChangeClientPreferences,
  onSelectCharacter,
  onEquipGuildTitle,
  onUpgradeGuildFacility,
  onStartGuildExpedition,
  onCompleteGuildExpedition,
  onHireGuildSpecialist,
  onAssignGuildSpecialist,
  onTransferGuildTreasuryGold,
  onFundGuildProjectPhase,
  onRecruitGuildCandidate,
  onManualSave,
  onReloadSave,
  onResetSave,
  onResetClientPreferences,
  onSelectHunt,
  onClearSelectedHunt,
  onChangeDuration,
  onStartHunt,
  onFinishHunt,
  onReturnToCity,
  onStopHuntAutoRepeat,
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
  const tabContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    tabContentRef.current?.scrollTo({ top: 0, left: 0 });
    window.scrollTo({ top: 0, left: 0 });
  }, [activeTab, selectedCharacter.id]);

  return (
    <section className="main-panel">
      {activeTab === "home" ? (
        <MainPlayArea
          character={selectedCharacter}
          characters={characters}
          guild={guild}
          hunts={hunts}
          lastHuntResult={lastResult}
          offlineReport={offlineReport}
          onCollectHunt={onFinishHunt}
          onOpenAction={() => onChangeTab("action")}
          onOpenBlessings={() => onChangeTab("blessings")}
          onOpenExplore={() => onChangeTab("hunts")}
          onOpenInventory={() => onChangeTab("inventory")}
          onOpenQuickSell={() => onChangeTab("market")}
          onOpenQuests={() => onChangeTab("quests")}
          onReturnToCity={onReturnToCity}
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
        size="full"
        subtitle={getWindowSubtitle(activeTab)}
        title={getWindowTitle(activeTab)}
      >
      <div className="tab-content client-window-content" ref={tabContentRef}>
        {activeTab === "character" ? (
          <CharacterDetails
            character={selectedCharacter}
            characters={characters}
            guild={guild}
            logs={logs}
            onOpenTab={onChangeTab}
            onSelectCharacter={onSelectCharacter}
          />
        ) : null}

        {activeTab === "skills" ? (
          <SkillsProgressionPanel character={selectedCharacter} onOpenTab={onChangeTab} />
        ) : null}

        {activeTab === "blessings" ? (
          <BlessingsHall
            character={selectedCharacter}
            guild={guild}
            onBackToCharacter={() => onChangeTab("character")}
            onBuyBlessing={onBuyBlessing}
            onRevive={onReviveCharacter}
          />
        ) : null}

        {activeTab === "collections" ? (
          <CollectionsHall
            character={selectedCharacter}
            guild={guild}
            onEquip={onEquipCollectionItem}
            onMarkSeen={onMarkCollectionsSeen}
          />
        ) : null}

        {activeTab === "proficiency" ? (
          <WeaponProficiencyPanel character={selectedCharacter} onOpenSkills={() => onChangeTab("skills")} />
        ) : null}

        {activeTab === "focus" ? (
          <MonsterFocusHall
            character={selectedCharacter}
            guild={guild}
            onActivate={onActivateMonsterFocus}
            onClear={onClearMonsterFocus}
            onOpenBestiary={() => onChangeTab("bestiary")}
            onReroll={onRerollMonsterFocus}
          />
        ) : null}

        {activeTab === "destiny" ? (
          <DestinyHall
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

        {activeTab === "atlas" ? (
          <Panel title={`${selectedCharacter.name} Region Progression`}>
            <RegionProgressionPanel
              bosses={bosses}
              character={selectedCharacter}
              hunts={hunts}
              quests={quests}
            />
          </Panel>
        ) : null}

        {activeTab === "hunts" ? (
          <ExploreWindow
            bossParty={bossParty}
            bosses={bosses}
            characters={characters}
            character={selectedCharacter}
            durationMinutes={durationMinutes}
            guildGold={guild.gold}
            hunts={hunts}
            lastBossResult={lastBossResult}
            lastQuestResult={lastQuestResult}
            lastTrainingResult={lastTrainingResult}
            onCancelBoss={onCancelBoss}
            onChangeBossPartyRole={onChangeBossPartyRole}
            onChangeDuration={onChangeDuration}
            onClearSelectedHunt={onClearSelectedHunt}
            onClearBossCooldown={onClearBossCooldown}
            onFinishBoss={onFinishBoss}
            onFinishQuest={onFinishQuest}
            onFinishTraining={onFinishTraining}
            onOpenSkills={() => onChangeTab("skills")}
            onSelectBoss={onSelectBoss}
            onSelectHunt={onSelectHunt}
            onStartBoss={onStartBoss}
            onStartHunt={onStartHunt}
            onStartQuest={onStartQuest}
            onStartTraining={onStartTraining}
            onToggleBossPartyMember={onToggleBossPartyMember}
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
          <TrainingPanel
            character={selectedCharacter}
            guildGold={guild.gold}
            lastResult={lastTrainingResult}
            onFinishTraining={onFinishTraining}
            onOpenSkills={() => onChangeTab("skills")}
            onStartTraining={onStartTraining}
          />
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
          <BestiaryPanel
            character={selectedCharacter}
            guild={guild}
            onAssignCharm={onAssignCharm}
            onClaimReward={onClaimBestiaryReward}
            onOpenFocus={() => onChangeTab("focus")}
            onRemoveCharm={onRemoveCharm}
            onUnlockCharm={onUnlockCharm}
          />
        ) : null}

        {activeTab === "daily" ? (
          <DailyRewardHall guild={guild} onClaim={onClaimDailyReward} />
        ) : null}
        {activeTab === "headquarters" ? (
          <GuildHeadquartersHall
            characters={characters}
            guild={guild}
            onUpgradeFacility={onUpgradeGuildFacility}
          />
        ) : null}
        {activeTab === "contracts" ? (
          <GuildContractsBoard
            characters={characters}
            guild={guild}
            onCompleteExpedition={onCompleteGuildExpedition}
            onStartExpedition={onStartGuildExpedition}
          />
        ) : null}
        {activeTab === "staff" ? (
          <GuildStaffHall
            characters={characters}
            guild={guild}
            onAssignSpecialist={onAssignGuildSpecialist}
            onHireSpecialist={onHireGuildSpecialist}
          />
        ) : null}
        {activeTab === "treasury" ? (
          <GuildTreasuryHall guild={guild} onTransfer={onTransferGuildTreasuryGold} />
        ) : null}
        {activeTab === "projects" ? (
          <GuildProjectsHall characters={characters} depot={depot} guild={guild} onFundPhase={onFundGuildProjectPhase} />
        ) : null}
        {activeTab === "recruitment" ? (
          <GuildRecruitmentBoard characters={characters} guild={guild} onRecruit={onRecruitGuildCandidate} />
        ) : null}
        {activeTab === "ranking" ? (
          <LocalRankingHall
            characters={characters}
            guild={guild}
            onEquipGuildTitle={onEquipGuildTitle}
            onSelectCharacter={onSelectCharacter}
            selectedCharacter={selectedCharacter}
          />
        ) : null}
        {activeTab === "store" ? (
          <CosmeticShowcaseHall
            character={selectedCharacter}
            guild={guild}
            onOpenCollections={() => onChangeTab("collections")}
          />
        ) : null}
        {activeTab === "updates" ? <UpdatesHall /> : null}
        {activeTab === "wiki" ? <GuildCodexHall /> : null}
        {activeTab === "settings" ? (
          <SettingsHall
            onChange={onChangeClientPreferences}
            onManualSave={onManualSave}
            onReloadSave={onReloadSave}
            onResetPreferences={onResetClientPreferences}
            onResetSave={onResetSave}
            preferences={clientPreferences}
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
    headquarters: "Guild Headquarters",
    contracts: "Guild Contracts Board",
    staff: "Guild Staff",
    treasury: "Guild Treasury",
    projects: "Guild Projects",
    recruitment: "Guild Recruitment Board",
    skills: "Skills",
    blessings: "Blessings",
    proficiency: "Weapon Proficiency",
    focus: "Hunting Research / Monster Focus",
    destiny: "Path of Destiny",
    collections: "Collections",
    action: "Current Action",
    atlas: "Region Atlas",
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
    bestiary: "Hunting Research / Bestiary",
    daily: "Daily Reward",
    ranking: "Hall of Renown",
    store: "Cosmetic Showcase",
    updates: "Updates",
    wiki: "Wiki",
    settings: "Settings",
  };

  return titles[tab];
}

function getWindowSubtitle(tab: MainPanelTab) {
  if (tab === "hunts") return "Hunts, bosses, training, and quests use the real game systems.";
  if (tab === "atlas") return "Region, area, access and level progression derived from the local save.";
  if (tab === "imbuing") return "Imbuements are available here; upgrade and tier controls remain visible for now.";
  if (tab === "focus") return "Personal target contracts, field studies and temporary hunt bonuses.";
  if (tab === "destiny") return "A real per-character passive wheel powered by level-earned Destiny Points.";
  if (tab === "collections") return "Guild-wide cosmetic unlocks with per-character outfit, mount, and avatar choices.";
  if (tab === "daily") return "Offline local guild rewards with a seven-day cycle and simple streak.";
  if (tab === "ranking") return "Local roster standings and guild career milestones derived from the current save.";
  if (tab === "headquarters") return "Guild-wide facilities, construction costs and small local progression bonuses.";
  if (tab === "contracts") return "Local support expeditions with fixed outcomes, small rewards and SQLite persistence.";
  if (tab === "staff") return "Permanent local specialists with one active duty post and capped expedition bonuses.";
  if (tab === "treasury") return "Protected local reserves and a persistent ledger for the guild's existing gold.";
  if (tab === "projects") return "Permanent local works funded in phases with guild gold and Guild Depot materials.";
  if (tab === "recruitment") return "Fixed local applicants, permanent roster places and modest guild-funded contracts.";
  if (tab === "training") return "Choose a discipline, duration and local training program.";
  if (tab === "proficiency") return "Weapon-specific progression, equipped bonuses and permanent perk milestones.";
  if (tab === "blessings") return "Temple rites that reduce local death penalties and are consumed when protection is used.";
  if (tab === "bestiary") return "Guild creature records, research stages, charm points and active assignments.";
  if (tab === "store") return "Outfits, mounts, avatars and future cosmetic exchanges for the local guild collection.";
  if (tab === "updates") return "Installed release notes for local systems, interface revisions and QA milestones.";
  if (tab === "wiki") return "Local field reference for adventurers, exploration, progression and guild services.";
  if (tab === "settings") return "Device-only client preferences kept separate from the SQLite guild save.";
  return undefined;
}

function getWindowIcon(tab: MainPanelTab) {
  const icons: Partial<Record<MainPanelTab, string>> = {
    character: "D",
    headquarters: "H",
    contracts: "C",
    staff: "S",
    treasury: "G",
    projects: "P",
    recruitment: "R",
    skills: "S",
    training: "T",
    proficiency: "P",
    blessings: "B",
    atlas: "A",
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
