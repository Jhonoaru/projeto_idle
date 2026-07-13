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
import { QuestPanel } from "../quest/QuestPanel";
import { RegionProgressionPanel } from "../region/RegionProgressionPanel";
import { TrainingPanel } from "../training/TrainingPanel";
import { GameWindow } from "../ui/GameWindow";
import { Panel } from "../ui/Panel";
import { MainPlayArea } from "./MainPlayArea";
import { getCollectionItemById } from "../../data/collections";
import type { TrainingResult } from "../../game-services/trainingService";
import type {
  Boss,
  BossParty,
  BossSimulationResult,
  Character,
  EquipmentSlot,
  Guild,
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
  onChangeTab: (tab: MainPanelTab) => void;
  onSelectCharacter: (characterId: string) => void;
  onManualSave: () => void;
  onReloadSave: () => void;
  onResetSave: () => void;
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
  onChangeTab,
  onSelectCharacter,
  onManualSave,
  onReloadSave,
  onResetSave,
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
          onOpenExplore={() => onChangeTab("hunts")}
          onOpenInventory={() => onChangeTab("inventory")}
          onOpenQuickSell={() => onChangeTab("market")}
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
  if (tab === "atlas") return "Region, area, access and level progression derived from the local save.";
  if (tab === "imbuing") return "Imbuements are available here; upgrade and tier controls remain visible for now.";
  if (tab === "focus") return "Personal target contracts, field studies and temporary hunt bonuses.";
  if (tab === "destiny") return "A real per-character passive wheel powered by level-earned Destiny Points.";
  if (tab === "collections") return "Guild-wide cosmetic unlocks with per-character outfit, mount, and avatar choices.";
  if (tab === "daily") return "Offline local guild rewards with a seven-day cycle and simple streak.";
  if (tab === "training") return "Choose a discipline, duration and local training program.";
  if (tab === "proficiency") return "Weapon-specific progression, equipped bonuses and permanent perk milestones.";
  if (tab === "blessings") return "Temple rites that reduce local death penalties and are consumed when protection is used.";
  if (tab === "bestiary") return "Guild creature records, research stages, charm points and active assignments.";
  if (tab === "store") return "Client-style preview for a future system.";
  return undefined;
}

function getWindowIcon(tab: MainPanelTab) {
  const icons: Partial<Record<MainPanelTab, string>> = {
    character: "D",
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
