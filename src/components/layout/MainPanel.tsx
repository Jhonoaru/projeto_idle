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
          <CharacterDetails character={selectedCharacter} />
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
          <CollectionsWindow character={selectedCharacter} />
        ) : null}

        {activeTab === "proficiency" ? (
          <WeaponProficiencyWindow character={selectedCharacter} />
        ) : null}

        {activeTab === "focus" ? (
          <MonsterFocusWindow guild={guild} />
        ) : null}

        {activeTab === "destiny" ? (
          <DestinyWindow character={selectedCharacter} />
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

        {activeTab === "daily" ? <DailyRewardWindow /> : null}
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
  if (["daily", "store", "focus", "destiny", "collections", "proficiency"].includes(tab)) {
    return "Client-style preview for a future system.";
  }
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

function CollectionsWindow({ character }: { character: Character }) {
  return (
    <div className="client-placeholder-grid">
      <Panel title="Outfits">
        <PlaceholderCards entries={["Wanderer", "Hunter", "Mystic", "Iron Guard", "Noble"]} />
      </Panel>
      <Panel title="Mounts">
        <PlaceholderCards entries={["Trail Runner", "Ash Drake", "Stoneback"]} locked />
      </Panel>
      <Panel title="Avatars">
        <PlaceholderCards entries={[character.name, "Guild Crest", "Temple Mark"]} />
      </Panel>
    </div>
  );
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

function MonsterFocusWindow({ guild }: { guild: Guild }) {
  const knownMonsters = guild.bestiary?.progress.slice(0, 6) ?? [];

  return (
    <Panel title="Prey Contracts / Monster Focus">
      <div className="client-summary-grid">
        <div>
          <span>Slot 1</span>
          <strong>Available</strong>
        </div>
        <div>
          <span>Slot 2</span>
          <strong>Future</strong>
        </div>
        <div>
          <span>Slot 3</span>
          <strong>Future</strong>
        </div>
      </div>
      <div className="client-placeholder-grid">
        {knownMonsters.length > 0 ? (
          knownMonsters.map((monster) => (
            <div className="client-info-card" key={monster.monsterId}>
              <strong>{monster.monsterName}</strong>
              <p>{monster.kills} kills / {monster.stage}</p>
            </div>
          ))
        ) : (
          <div className="client-info-card">
            <strong>No focus target yet</strong>
            <p>Bestiary discoveries will appear here in a future version.</p>
          </div>
        )}
      </div>
    </Panel>
  );
}

function DestinyWindow({ character }: { character: Character }) {
  const points = Math.max(0, Math.floor((character.level - 20) / 10));

  return (
    <Panel title="Guild Destiny">
      <div className="client-summary-grid">
        <div>
          <span>Vocation</span>
          <strong>{character.vocation}</strong>
        </div>
        <div>
          <span>Level</span>
          <strong>{character.level}</strong>
        </div>
        <div>
          <span>Points</span>
          <strong>{points}</strong>
        </div>
      </div>
      <div className="destiny-grid">
        {["Core", "Offense", "Defense", "Utility", "Mastery", "Future"].map((node, index) => (
          <div className={index <= points ? "is-open" : ""} key={node}>
            <span>{node}</span>
            <strong>{index <= points ? "Unlocked" : "Locked"}</strong>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function DailyRewardWindow() {
  return (
    <Panel title="Daily Reward">
      <div className="client-info-card">
        <strong>Offline daily rewards are planned.</strong>
        <p>This window is visual only in Etapa 20 and does not grant items or gold yet.</p>
      </div>
    </Panel>
  );
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
  return (
    <Panel title="Cosmetic Store">
      <div className="client-placeholder-grid">
        <div className="client-info-card">
          <strong>Cosmetics</strong>
          <p>Cosmetic store planned for future versions.</p>
        </div>
        <div className="client-info-card">
          <strong>Outfits</strong>
          <p>No checkout, premium, or paid currency is implemented.</p>
        </div>
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
