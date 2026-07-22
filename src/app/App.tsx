import { useEffect, useMemo, useRef, useState } from "react";
import { GameShell } from "../components/layout/GameShell";
import { CharacterSideMenu } from "../components/layout/CharacterSideMenu";
import { LeftPanel } from "../components/layout/LeftPanel";
import { MainPanel, type MainPanelTab } from "../components/layout/MainPanel";
import { RightCharacterPanel } from "../components/layout/RightCharacterPanel";
import { TopBar } from "../components/layout/TopBar";
import { OfflineReportPanel } from "../components/offline/OfflineReportPanel";
import {
  DEFAULT_CLIENT_PREFERENCES,
  applyClientPreferences,
  loadClientPreferences,
  loadLastClientView,
  normalizeClientPreferences,
  saveClientPreferences,
  saveLastClientView,
  type ClientPreferences,
} from "../client-preferences/clientPreferences";
import { initDatabase } from "../database/db";
import {
  createInitialGameState,
  loadSaveMetadata,
  loadGameState,
  markOfflineCatchUpApplied,
  markSaveLoaded,
  resetSave,
  saveGameState,
  waitForPendingSaves,
  type GameStateSnapshot,
} from "../database/saveGameRepository";
import { bosses } from "../data/bosses";
import { getActiveBlessings, getBlessingById } from "../data/blessings";
import { addMonsterKillsToBestiary } from "../game-engine/bestiary/addMonsterKillsToBestiary";
import { resolveAutoRepeatAfterHunt } from "../game-engine/auto-repeat/resolveAutoRepeatAfterHunt";
import { assignCharmToMonster } from "../game-engine/bestiary/assignCharmToMonster";
import { claimBestiaryReward } from "../game-engine/bestiary/claimBestiaryReward";
import { removeCharmFromMonster } from "../game-engine/bestiary/removeCharmFromMonster";
import { unlockCharm } from "../game-engine/bestiary/unlockCharm";
import { mockCharacters } from "../data/mockCharacters";
import { mockDepot } from "../data/mockDepot";
import { mockGuild } from "../data/mockGuild";
import { hunts } from "../data/hunts";
import { mockLogs } from "../data/mockLogs";
import { quests } from "../data/quests";
import {
  cancelCurrentAction,
  finishTravel,
  getTravelRemainingMs,
} from "../game-services/actionService";
import { equipItem } from "../game-engine/equipment/equipItem";
import { unequipItem } from "../game-engine/equipment/unequipItem";
import { clearNewCollectionFlags } from "../game-engine/collections/clearNewCollectionFlags";
import { equipCollectionItem } from "../game-engine/collections/equipCollectionItem";
import { unlockCollectionItem } from "../game-engine/collections/unlockCollectionItem";
import { claimDailyReward } from "../game-engine/daily-reward/claimDailyReward";
import { exchangeCosmetic } from "../game-engine/cosmetic-exchange/exchangeCosmetic";
import { equipGuildTitle, getGuildIdentity, getPersistedGuildTitle } from "../game-engine/achievements/getGuildIdentity";
import { getHeadquartersBonuses } from "../game-engine/headquarters/getHeadquartersBonuses";
import { upgradeGuildFacility } from "../game-engine/headquarters/upgradeGuildFacility";
import { startGuildExpedition } from "../game-engine/expeditions/startGuildExpedition";
import { finishGuildExpedition } from "../game-engine/expeditions/finishGuildExpedition";
import { assignGuildSpecialist, hireGuildSpecialist } from "../game-engine/staff/manageGuildStaff";
import { depositGuildGold, withdrawGuildGold } from "../game-engine/treasury/transferGuildTreasuryGold";
import { fundGuildProjectPhase } from "../game-engine/projects/fundGuildProjectPhase";
import { recruitGuildCandidate } from "../game-engine/recruitment/recruitGuildCandidate";
import { claimGuildLevelReward } from "../game-engine/guild-progression/claimGuildLevelReward";
import { claimGuildRenownObjective } from "../game-engine/guild-progression/claimGuildRenownObjective";
import { activateGuildDirective } from "../game-engine/guild-directives/activateGuildDirective";
import { getGuildDirectiveBonuses } from "../game-engine/guild-directives/getGuildDirectiveStatus";
import { saveGuildSquad } from "../game-engine/guild-squads/saveGuildSquad";
import { createBossPartyFromGuildSquad } from "../game-engine/guild-squads/createBossPartyFromGuildSquad";
import { clearGuildDeploymentOrder, saveGuildDeploymentOrder } from "../game-engine/deployment-orders/updateGuildDeploymentOrder";
import { updateGuildLogisticsPin, type GuildLogisticsPinAction } from "../game-engine/logistics/updateGuildLogisticsPin";
import { buildGuildLogisticsPlan } from "../game-engine/logistics/buildGuildLogisticsPlan";
import { acknowledgeGuildLogisticsAlerts, syncGuildLogisticsAlerts } from "../game-engine/logistics/syncGuildLogisticsAlerts";
import { normalizeGuildBazaarState } from "../game-engine/bazaar/normalizeGuildBazaarState";
import { purchaseBazaarOffer } from "../game-engine/bazaar/purchaseBazaarOffer";
import { unlockDestinyNode } from "../game-engine/destiny/unlockDestinyNode";
import { getDestinyResetCost, resetDestinyPath } from "../game-engine/destiny/resetDestinyPath";
import { getContainerContents } from "../game-engine/container/getContainerContents";
import { calculateCharacterAttributes } from "../game-engine/character/calculateCharacterAttributes";
import { moveItemOutOfContainer } from "../game-engine/container/moveItemOutOfContainer";
import { moveItemToContainer } from "../game-engine/container/moveItemToContainer";
import { calculateCapacityUsed } from "../game-engine/inventory/calculateCapacityUsed";
import { mergeStackableItems } from "../game-engine/inventory/mergeStackableItems";
import { transferItem } from "../game-engine/inventory/transferItem";
import { createPresetFromHunt } from "../game-engine/hunt-prep/createPresetFromHunt";
import { prepareHuntSupplies } from "../game-engine/hunt-prep/prepareHuntSupplies";
import { activateMonsterFocus } from "../game-engine/monster-focus/activateMonsterFocus";
import { clearMonsterFocusSlot } from "../game-engine/monster-focus/clearMonsterFocusSlot";
import {
  getMonsterFocusRerollCost,
  rerollMonsterFocusBonus,
} from "../game-engine/monster-focus/rerollMonsterFocusBonus";
import { applyOfflineCatchUp } from "../game-engine/offline/applyOfflineCatchUp";
import { applyImbuement } from "../game-engine/forge/applyImbuement";
import { findCharacterItem, updateCharacterItem } from "../game-engine/forge/forgeInventoryHelpers";
import { increaseItemTier } from "../game-engine/forge/increaseItemTier";
import { upgradeItem } from "../game-engine/forge/upgradeItem";
import { craftEquipment } from "../game-engine/crafting/craftEquipment";
import { salvageEquipment } from "../game-engine/crafting/salvageEquipment";
import { reviveCharacter } from "../game-engine/death/reviveCharacter";
import { cancelBoss, finishBoss, startBoss } from "../game-services/bossService";
import { finishHunt, startHunt } from "../game-services/huntService";
import {
  buyFromNpcShop,
  sellAllByCategory,
  sellFromCharacterDepot,
  sellFromCharacterInventory,
  sellFromGuildDepot,
  toggleInventoryItemLock,
} from "../game-services/marketService";
import { finishQuest, startQuest } from "../game-services/questService";
import {
  finishTraining,
  formatSkillName,
  startTraining,
  type TrainingResult,
} from "../game-services/trainingService";
import type {
  ActivityLogEntry,
  Boss,
  BossParty,
  BossSimulationResult,
  Character,
  HuntArea,
  HuntAutoRepeatConfig,
  OfflineCatchUpReport,
  HuntPreparationResult,
  HuntSupplyPreset,
  HuntSimulationResult,
  EquipmentSlot,
  GuildFacilityId,
  GuildDeploymentOrderKind,
  GuildDeploymentOrderSlotId,
  GuildSpecialistId,
  GuildSquadMember,
  GuildSquadSlotId,
  GuildTreasuryTransactionType,
  InventoryItem,
  MarketItemCategory,
  MonsterFocusBonusType,
  PartyRole,
  Quest,
  SellSource,
  ShopDeliveryTarget,
  TrainingTarget,
  TrainingType,
} from "../shared/types";

interface LastHuntResult {
  characterName: string;
  character: (typeof mockCharacters)[number];
  hunt: HuntArea;
  result: HuntSimulationResult;
}

export function App() {
  const [guild, setGuild] = useState(mockGuild);
  const [characters, setCharacters] = useState(mockCharacters);
  const activeGuildTitle = useMemo(
    () => getGuildIdentity(guild, characters).activeTitle?.definition.title,
    [characters, guild],
  );
  const headquartersBonuses = useMemo(
    () => getHeadquartersBonuses(guild.headquarters),
    [guild.headquarters],
  );
  const directiveBonuses = useMemo(() => getGuildDirectiveBonuses(guild), [guild]);
  const guildOperationBonuses = useMemo(() => ({
    huntXpBonusPercent: headquartersBonuses.huntXpBonusPercent + directiveBonuses.huntXpBonusPercent,
    trainingProgressBonusPercent: headquartersBonuses.trainingProgressBonusPercent + directiveBonuses.trainingProgressBonusPercent,
    questXpBonusPercent: headquartersBonuses.questXpBonusPercent + directiveBonuses.questXpBonusPercent,
  }), [directiveBonuses, headquartersBonuses]);
  const [depot, setDepot] = useState(mockDepot);
  const [logs, setLogs] = useState<ActivityLogEntry[]>(mockLogs);
  const [database, setDatabase] = useState<Awaited<ReturnType<typeof initDatabase>>>();
  const [isLoadingSave, setIsLoadingSave] = useState(true);
  const [saveStatus, setSaveStatus] = useState("Carregando save...");
  const [offlineReport, setOfflineReport] = useState<OfflineCatchUpReport>();
  const [selectedHunt, setSelectedHunt] = useState<HuntArea | undefined>();
  const [durationMinutes, setDurationMinutes] = useState(1);
  const [lastHuntResult, setLastHuntResult] = useState<LastHuntResult>();
  const [lastPreparationResult, setLastPreparationResult] = useState<HuntPreparationResult>();
  const [lastTrainingResult, setLastTrainingResult] = useState<TrainingResult>();
  const [lastQuestResult, setLastQuestResult] = useState<{
    success: boolean;
    died: boolean;
    accessUnlocked?: string;
    logs: string[];
  }>();
  const [selectedBoss, setSelectedBoss] = useState<Boss | undefined>(bosses[0]);
  const [bossParty, setBossParty] = useState<BossParty>({
    bossId: bosses[0].id,
    members: [{ characterId: mockCharacters[0].id, role: "tank" }],
  });
  const [lastBossResult, setLastBossResult] = useState<BossSimulationResult>();
  const [clientPreferences, setClientPreferences] = useState(loadClientPreferences);
  const [activeTab, setActiveTab] = useState<MainPanelTab>(() =>
    clientPreferences.restoreLastView
      ? (loadLastClientView() ?? clientPreferences.startupView)
      : clientPreferences.startupView,
  );
  const [selectedCharacterId, setSelectedCharacterId] = useState(
    mockCharacters[0].id,
  );

  const selectedCharacter = useMemo(
    () =>
      characters.find((character) => character.id === selectedCharacterId) ??
      characters[0],
    [characters, selectedCharacterId],
  );

  const saveReadyRef = useRef(false);
  const charactersRef = useRef(characters);
  const resolvingActionRef = useRef(new Set<string>());
  const resolvingDestinyRef = useRef(new Set<string>());
  const resolvingResearchRef = useRef(new Set<string>());
  const resolvingCollectionsRef = useRef(new Set<string>());
  const claimingDailyRewardRef = useRef(false);
  const buyingBlessingRef = useRef(false);
  const upgradingFacilityRef = useRef(false);
  const dispatchingExpeditionRef = useRef(false);
  const completingExpeditionRef = useRef(false);
  const managingStaffRef = useRef(false);
  const transferringTreasuryGoldRef = useRef(false);
  const fundingGuildProjectRef = useRef(false);
  const recruitingGuildMemberRef = useRef(false);
  const claimingGuildLevelRewardRef = useRef(false);
  const claimingGuildRenownObjectiveRef = useRef(false);
  const activatingGuildDirectiveRef = useRef(false);
  const savingGuildSquadRef = useRef(false);
  const loadingGuildSquadRef = useRef(false);
  const updatingDeploymentOrderRef = useRef(false);
  const buyingBazaarOfferRef = useRef(false);
  const exchangingCosmeticRef = useRef(false);
  const craftingEquipmentRef = useRef(false);
  const salvagingEquipmentRef = useRef(false);
  const updatingLogisticsPinRef = useRef(false);
  const acknowledgingLogisticsAlertsRef = useRef(false);
  const startingBossRef = useRef(false);

  useEffect(() => {
    applyClientPreferences(clientPreferences);
    saveClientPreferences(clientPreferences);
  }, [clientPreferences]);

  useEffect(() => {
    saveLastClientView(activeTab);
  }, [activeTab]);

  useEffect(() => {
    let canceled = false;

    async function bootstrapSave() {
      try {
        const db = await initDatabase();
        const loadedState = await loadGameState(db);
        const metadata = await loadSaveMetadata(db);
        const catchUp = loadedState
          ? applyLoadedOfflineCatchUp(loadedState, metadata?.lastSavedAt)
          : undefined;
        const stateToApply = catchUp?.state ?? createInitialGameState();

        if (canceled) return;

        applyGameState(stateToApply);
        setSelectedCharacterId(stateToApply.characters[0]?.id ?? mockCharacters[0].id);
        setDatabase(db);
        if (!loadedState) {
          await saveGameState(db, stateToApply);
        } else {
          await markSaveLoaded(db);
          if (catchUp && catchUp.report.characterReports.length > 0) {
            setOfflineReport(catchUp.report);
            await saveGameState(db, catchUp.state);
            await markOfflineCatchUpApplied(db);
          }
        }
        saveReadyRef.current = true;
        setSaveStatus(loadedState ? "Save carregado." : "Save inicial criado.");
      } catch (error) {
        console.error("Failed to load local SQLite save.", error);

        if (canceled) return;

        const initialState = createInitialGameState();
        applyGameState(initialState);
        setSelectedCharacterId(initialState.characters[0]?.id ?? mockCharacters[0].id);
        saveReadyRef.current = false;
        setSaveStatus("Falha ao carregar save. Usando mock local.");
      } finally {
        if (!canceled) {
          setIsLoadingSave(false);
        }
      }
    }

    bootstrapSave();

    return () => {
      canceled = true;
    };
  }, []);

  useEffect(() => {
    if (!database || !saveReadyRef.current || isLoadingSave) return undefined;

    setSaveStatus("Salvando...");

    const timeout = window.setTimeout(() => {
      saveGameState(database, { guild, characters, depot, logs })
        .then(() => setSaveStatus("Save salvo."))
        .catch((error) => {
          console.error("Failed to auto-save game state.", error);
          setSaveStatus("Falha ao salvar.");
        });
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [characters, database, depot, guild, isLoadingSave, logs]);

  useEffect(() => {
    if (isLoadingSave) return;
    const plan = buildGuildLogisticsPlan(guild, depot, characters);
    const result = syncGuildLogisticsAlerts(guild, plan.objectives);
    if (!result.changed) return;
    setGuild(result.guild);
    if (result.newlyReadyObjectives.length === 0) return;
    const names = result.newlyReadyObjectives.map((objective) => `${objective.title} (${objective.targetLabel})`);
    setLogs((currentLogs) => [
      createLogEntry(
        "Logistics priority ready",
        `${names.join(", ")} ${names.length === 1 ? "is" : "are"} ready for review.`,
        "success",
      ),
      ...currentLogs,
    ]);
  }, [characters, depot, guild, isLoadingSave]);

  useEffect(() => {
    charactersRef.current = characters;
  }, [characters]);

  useEffect(() => {
    if (isLoadingSave) return undefined;

    function finishExpiredTravelingCharacters() {
      const arrivals: ActivityLogEntry[] = [];
      let changed = false;
      const updatedCharacters = charactersRef.current.map((character) => {
        if (
          character.status !== "traveling" ||
          !character.currentAction ||
          getTravelRemainingMs(character) > 0
        ) {
          return character;
        }

        const destination = character.currentAction.targetName ?? character.city;
        changed = true;
        arrivals.push(
          createLogEntry(
            "Travel finished",
            `${character.name} chegou em ${destination} e esta disponivel.`,
            "success",
          ),
        );

        return {
          ...character,
          city: destination,
          status: "idle" as const,
          currentAction: undefined,
        };
      });

      if (!changed) return;

      charactersRef.current = updatedCharacters;
      setCharacters(updatedCharacters);
      setLogs((currentLogs) => [...arrivals, ...currentLogs]);
    }

    finishExpiredTravelingCharacters();
    const interval = window.setInterval(finishExpiredTravelingCharacters, 1000);

    return () => window.clearInterval(interval);
  }, [isLoadingSave]);

  function updateSelectedCharacter(updatedCharacter: typeof selectedCharacter) {
    setCharacters((currentCharacters) =>
      currentCharacters.map((character) =>
        character.id === updatedCharacter.id ? updatedCharacter : character,
      ),
    );
  }

  function prependLog(title: string, message: string, tone: ActivityLogEntry["tone"]) {
    setLogs((currentLogs) => [
      {
        id: `log-${Date.now()}-${currentLogs.length}`,
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        title,
        message,
        tone,
      },
      ...currentLogs,
    ]);
  }

  function handleEquipGuildTitle(titleId: string | null) {
    const updatedGuild = equipGuildTitle(guild, characters, titleId);
    if (updatedGuild === guild) {
      prependLog("Guild identity", "This title is not available in the current Career Ledger.", "warning");
      return;
    }

    setGuild(updatedGuild);
    const equippedTitle = getPersistedGuildTitle(updatedGuild);
    prependLog(
      "Guild identity",
      equippedTitle
        ? `${equippedTitle.title} is now displayed by ${updatedGuild.name}.`
        : `${updatedGuild.name} is no longer displaying a career title.`,
      "success",
    );
  }

  function handleUpgradeGuildFacility(facilityId: GuildFacilityId) {
    if (upgradingFacilityRef.current) return;
    upgradingFacilityRef.current = true;
    const result = upgradeGuildFacility(guild, depot, characters, facilityId);
    if (result.success) {
      setGuild(result.guild);
      setDepot(result.depot);
    }
    prependLog(
      result.success ? "Headquarters upgraded" : "Headquarters blocked",
      result.message,
      result.success ? "success" : "warning",
    );
    window.setTimeout(() => {
      upgradingFacilityRef.current = false;
    }, 250);
  }

  function handleStartGuildExpedition(contractId: string, assignedCharacterIds: string[]) {
    if (dispatchingExpeditionRef.current) return;
    dispatchingExpeditionRef.current = true;
    const result = startGuildExpedition(guild, characters, contractId, assignedCharacterIds);
    if (result.success) setGuild(result.guild);
    prependLog(
      result.success ? "Expedition dispatched" : "Expedition blocked",
      result.message,
      result.success ? "success" : "warning",
    );
    window.setTimeout(() => {
      dispatchingExpeditionRef.current = false;
    }, 250);
  }

  function handleCompleteGuildExpedition() {
    if (completingExpeditionRef.current) return;
    completingExpeditionRef.current = true;
    const result = finishGuildExpedition(guild, depot);
    if (result.success) {
      setGuild(result.guild);
      setDepot(result.depot);
    }
    prependLog(
      result.success ? (result.succeeded ? "Expedition completed" : "Expedition returned") : "Expedition blocked",
      result.message,
      result.success && result.succeeded ? "success" : result.success ? "neutral" : "warning",
    );
    window.setTimeout(() => {
      completingExpeditionRef.current = false;
    }, 250);
  }

  function handleHireGuildSpecialist(specialistId: GuildSpecialistId) {
    if (managingStaffRef.current) return;
    managingStaffRef.current = true;
    const result = hireGuildSpecialist(guild, characters, specialistId);
    if (result.success) setGuild(result.guild);
    prependLog(result.success ? "Specialist hired" : "Staff request blocked", result.message, result.success ? "success" : "warning");
    window.setTimeout(() => { managingStaffRef.current = false; }, 250);
  }

  function handleAssignGuildSpecialist(specialistId: GuildSpecialistId | null) {
    if (managingStaffRef.current) return;
    managingStaffRef.current = true;
    const result = assignGuildSpecialist(guild, specialistId);
    if (result.success) setGuild(result.guild);
    prependLog(result.success ? "Staff duty changed" : "Staff request blocked", result.message, result.success ? "success" : "warning");
    window.setTimeout(() => { managingStaffRef.current = false; }, 250);
  }

  function handleTransferGuildTreasuryGold(type: GuildTreasuryTransactionType, amount: number) {
    if (transferringTreasuryGoldRef.current) return;
    transferringTreasuryGoldRef.current = true;
    const result = type === "deposit" ? depositGuildGold(guild, amount) : withdrawGuildGold(guild, amount);
    if (result.success) setGuild(result.guild);
    prependLog(result.success ? "Treasury transfer" : "Treasury request blocked", result.message, result.success ? "success" : "warning");
    window.setTimeout(() => { transferringTreasuryGoldRef.current = false; }, 250);
  }

  function handleFundGuildProjectPhase(projectId: string) {
    if (fundingGuildProjectRef.current) return;
    fundingGuildProjectRef.current = true;
    const result = fundGuildProjectPhase(guild, depot, characters, projectId);
    if (result.success) {
      setGuild(result.guild);
      setDepot(result.depot);
    }
    prependLog(result.success ? (result.completed ? "Guild project completed" : "Guild project funded") : "Guild project blocked", result.message, result.success ? "success" : "warning");
    if (result.collectionUnlockedName) prependLog("Collection unlocked", `${result.collectionUnlockedName} joined the guild collection.`, "success");
    window.setTimeout(() => { fundingGuildProjectRef.current = false; }, 250);
  }

  function handleRecruitGuildCandidate(candidateId: string) {
    if (recruitingGuildMemberRef.current) return;
    recruitingGuildMemberRef.current = true;
    const result = recruitGuildCandidate(guild, characters, candidateId);
    if (result.success && result.character) {
      setGuild(result.guild);
      setCharacters(result.characters);
      setSelectedCharacterId(result.character.id);
    }
    prependLog(result.success ? "Adventurer recruited" : "Recruitment blocked", result.message, result.success ? "success" : "warning");
    window.setTimeout(() => { recruitingGuildMemberRef.current = false; }, 250);
  }

  function handleClaimGuildLevelReward(level: number) {
    if (claimingGuildLevelRewardRef.current) return;
    claimingGuildLevelRewardRef.current = true;
    const result = claimGuildLevelReward(guild, depot, level);
    if (result.success) {
      setGuild(result.guild);
      setDepot(result.depot);
    }
    prependLog(result.success ? "Guild milestone claimed" : "Guild milestone blocked", result.message, result.success ? "success" : "warning");
    window.setTimeout(() => { claimingGuildLevelRewardRef.current = false; }, 250);
  }

  function handleClaimGuildRenownObjective(objectiveId: string) {
    if (claimingGuildRenownObjectiveRef.current) return;
    claimingGuildRenownObjectiveRef.current = true;
    const result = claimGuildRenownObjective(guild, characters, objectiveId);
    if (result.success) setGuild(result.guild);
    prependLog(result.success ? "Renown objective claimed" : "Renown objective blocked", result.message, result.success ? "success" : "warning");
    window.setTimeout(() => { claimingGuildRenownObjectiveRef.current = false; }, 250);
  }

  function handleActivateGuildDirective(directiveId: string) {
    if (activatingGuildDirectiveRef.current) return;
    activatingGuildDirectiveRef.current = true;
    const result = activateGuildDirective(guild, characters, directiveId);
    if (result.success) setGuild(result.guild);
    prependLog(result.success ? "Guild directive activated" : "Guild directive blocked", result.message, result.success ? "success" : "warning");
    window.setTimeout(() => { activatingGuildDirectiveRef.current = false; }, 250);
  }

  function handleSaveGuildSquad(slotId: GuildSquadSlotId, name: string, members: GuildSquadMember[]) {
    if (savingGuildSquadRef.current) return;
    savingGuildSquadRef.current = true;
    const result = saveGuildSquad(guild, characters, slotId, name, members);
    if (result.success) setGuild(result.guild);
    prependLog(result.success ? "Guild Squad saved" : "Guild Squad blocked", result.message, result.success ? "success" : "warning");
    window.setTimeout(() => { savingGuildSquadRef.current = false; }, 200);
  }

  function handleLoadGuildSquad(slotId: GuildSquadSlotId, bossId?: string) {
    if (loadingGuildSquadRef.current) return;
    loadingGuildSquadRef.current = true;
    const boss = bosses.find((entry) => entry.id === bossId) ?? selectedBoss ?? bosses[0];
    const result = createBossPartyFromGuildSquad(guild, characters, boss, slotId);
    if (result.success) {
      setSelectedBoss(boss);
      setBossParty(result.party);
      setActiveTab("bosses");
    }
    prependLog(result.success ? "Guild Squad loaded" : "Guild Squad blocked", result.message, result.success ? "success" : "warning");
    window.setTimeout(() => { loadingGuildSquadRef.current = false; }, 200);
  }

  function handleSaveDeploymentOrder(orderSlotId: GuildDeploymentOrderSlotId, kind: GuildDeploymentOrderKind, targetId: string, squadSlotId: GuildSquadSlotId) {
    if (updatingDeploymentOrderRef.current) return;
    updatingDeploymentOrderRef.current = true;
    const result = saveGuildDeploymentOrder(guild, characters, orderSlotId, kind, targetId, squadSlotId);
    if (result.success) setGuild(result.guild);
    prependLog(result.success ? "Deployment order assigned" : "Deployment order blocked", result.message, result.success ? "success" : "warning");
    window.setTimeout(() => { updatingDeploymentOrderRef.current = false; }, 200);
  }

  function handleClearDeploymentOrder(orderSlotId: GuildDeploymentOrderSlotId) {
    if (updatingDeploymentOrderRef.current) return;
    updatingDeploymentOrderRef.current = true;
    const result = clearGuildDeploymentOrder(guild, orderSlotId);
    if (result.success) setGuild(result.guild);
    prependLog(result.success ? "Deployment order cleared" : "Deployment order unchanged", result.message, result.success ? "neutral" : "warning");
    window.setTimeout(() => { updatingDeploymentOrderRef.current = false; }, 200);
  }

  function handleUpdateGuildLogisticsPin(objectiveId: string, action: GuildLogisticsPinAction, activeObjectiveIds: string[]) {
    if (updatingLogisticsPinRef.current) return;
    updatingLogisticsPinRef.current = true;
    const result = updateGuildLogisticsPin(guild, objectiveId, action, activeObjectiveIds);
    if (result.changed) setGuild(result.guild);
    prependLog(result.changed ? "Campaign pinboard updated" : "Campaign pinboard unchanged", result.message, result.changed ? "success" : "warning");
    window.setTimeout(() => { updatingLogisticsPinRef.current = false; }, 150);
  }

  function handleAcknowledgeGuildLogisticsAlerts() {
    if (acknowledgingLogisticsAlertsRef.current) return;
    acknowledgingLogisticsAlertsRef.current = true;
    const nextGuild = acknowledgeGuildLogisticsAlerts(guild);
    if (nextGuild !== guild) {
      setGuild(nextGuild);
      prependLog("Logistics priorities reviewed", "Ready campaign priorities were marked as reviewed.", "neutral");
    }
    window.setTimeout(() => { acknowledgingLogisticsAlertsRef.current = false; }, 150);
  }

  function handleOpenTab(tab: MainPanelTab) {
    if (tab === "hunts") {
      setSelectedHunt(undefined);
    }
    setActiveTab(tab);
  }

  function handleOpenTrackedHunt(hunt: HuntArea) {
    const readyHunter = [selectedCharacter, ...characters].find((character, index, roster) => (
      roster.findIndex((entry) => entry.id === character.id) === index
      && character.level >= hunt.minLevel
      && (!hunt.requiredAccess || character.accessIds.includes(hunt.requiredAccess))
      && character.status === "idle"
      && !character.currentAction
    ));
    if (readyHunter) setSelectedCharacterId(readyHunter.id);
    setSelectedHunt(hunt);
    setActiveTab("hunts");
  }

  function handleChangeClientPreferences(updates: Partial<ClientPreferences>) {
    setClientPreferences((current) => normalizeClientPreferences({ ...current, ...updates }));
  }

  function handleResetClientPreferences() {
    setClientPreferences(DEFAULT_CLIENT_PREFERENCES);
  }

  function applyGameState(state: GameStateSnapshot) {
    setGuild(state.guild);
    setCharacters(state.characters);
    setDepot(state.depot);
    setLogs(state.logs);
  }

  async function handleManualSave() {
    if (!database) {
      setSaveStatus("Database indisponivel.");
      return;
    }

    try {
      setSaveStatus("Salvando...");
      await saveGameState(database, { guild, characters, depot, logs });
      setSaveStatus("Save salvo com sucesso.");
      prependLog("Save", "Save salvo com sucesso.", "success");
    } catch (error) {
      console.error("Failed to manually save game state.", error);
      setSaveStatus("Falha ao salvar.");
      prependLog("Save", "Falha ao salvar save local.", "warning");
    }
  }

  async function handleReloadSave() {
    if (!database) {
      setSaveStatus("Database indisponivel.");
      return;
    }

    try {
      saveReadyRef.current = false;
      setSaveStatus("Carregando save...");
      await waitForPendingSaves();
      const loadedState = await loadGameState(database);
      const metadata = await loadSaveMetadata(database);
      const catchUp = loadedState
        ? applyLoadedOfflineCatchUp(loadedState, metadata?.lastSavedAt)
        : undefined;
      const stateToApply = catchUp?.state ?? createInitialGameState();
      applyGameState({
        ...stateToApply,
        logs: [
          createLogEntry("Save", loadedState ? "Save carregado." : "Save inicial carregado.", "success"),
          ...stateToApply.logs,
        ],
      });
      if (!loadedState) {
        await saveGameState(database, stateToApply);
      } else {
        await markSaveLoaded(database);
        if (catchUp && catchUp.report.characterReports.length > 0) {
          setOfflineReport(catchUp.report);
          await saveGameState(database, {
            ...stateToApply,
            logs: [
              createLogEntry("Save", "Save carregado.", "success"),
              ...stateToApply.logs,
            ],
          });
          await markOfflineCatchUpApplied(database);
        }
      }
      const selectedCharacterStillExists = stateToApply.characters.some(
        (character) => character.id === selectedCharacterId,
      );
      setSelectedCharacterId(
        selectedCharacterStillExists
          ? selectedCharacterId
          : (stateToApply.characters[0]?.id ?? mockCharacters[0].id),
      );
      setActiveTab("character");
      saveReadyRef.current = true;
      setSaveStatus(loadedState ? "Save carregado." : "Save inicial criado.");
    } catch (error) {
      console.error("Failed to reload local save.", error);
      saveReadyRef.current = true;
      setSaveStatus("Falha ao recarregar.");
      prependLog("Save", "Falha ao recarregar save local.", "warning");
    }
  }

  async function handleResetSave() {
    if (!database) {
      setSaveStatus("Database indisponivel.");
      return;
    }

    if (!window.confirm("Resetar o save local e voltar ao estado inicial?")) {
      return;
    }

    try {
      saveReadyRef.current = false;
      setSaveStatus("Resetando save...");
      await waitForPendingSaves();
      const resetState = await resetSave(database);
      applyGameState({
        ...resetState,
        logs: [
          createLogEntry("Save", "Save resetado.", "warning"),
          ...resetState.logs,
        ],
      });
      setSelectedCharacterId(resetState.characters[0]?.id ?? mockCharacters[0].id);
      setActiveTab("character");
      saveReadyRef.current = true;
      setSaveStatus("Save resetado.");
    } catch (error) {
      console.error("Failed to reset local save.", error);
      saveReadyRef.current = true;
      setSaveStatus("Falha ao resetar.");
      prependLog("Save", "Falha ao resetar save local.", "warning");
    }
  }

  function handleSelectBoss(boss: Boss) {
    setSelectedBoss(boss);
    setBossParty((currentParty) => {
      if (currentParty.bossId === boss.id) return currentParty;

      return {
        bossId: boss.id,
        members:
          boss.type === "solo"
            ? [{ characterId: selectedCharacter.id, role: getDefaultPartyRole(selectedCharacter.vocation) }]
            : [],
      };
    });
  }

  function handleToggleBossPartyMember(characterId: string) {
    if (!selectedBoss) return;

    setBossParty((currentParty) => {
      const party =
        currentParty.bossId === selectedBoss.id
          ? currentParty
          : { bossId: selectedBoss.id, members: [] };
      const existingMember = party.members.find((member) => member.characterId === characterId);

      if (existingMember) {
        return {
          ...party,
          members: party.members.filter((member) => member.characterId !== characterId),
        };
      }

      const character = characters.find((candidate) => candidate.id === characterId);

      if (!character || party.members.length >= selectedBoss.requirements.maxPartySize) {
        return party;
      }

      return {
        ...party,
        members: [
          ...party.members,
          { characterId, role: getDefaultPartyRole(character.vocation) },
        ],
      };
    });
  }

  function handleChangeBossPartyRole(characterId: string, role: PartyRole) {
    setBossParty((currentParty) => ({
      ...currentParty,
      members: currentParty.members.map((member) =>
        member.characterId === characterId ? { ...member, role } : member,
      ),
    }));
  }

  function handleStartHunt(autoRepeat?: HuntAutoRepeatConfig) {
    if (!selectedHunt) return;

    try {
      let updatedCharacter = startHunt(
        selectedCharacter,
        selectedHunt,
        durationMinutes,
        guildOperationBonuses.huntXpBonusPercent,
      );
      if (autoRepeat?.enabled) {
        const now = new Date().toISOString();
        updatedCharacter = {
          ...updatedCharacter,
          currentAction: updatedCharacter.currentAction
            ? {
                ...updatedCharacter.currentAction,
                autoRepeat: {
                  ...autoRepeat,
                  completedRepeats: 0,
                  createdAt: autoRepeat.createdAt || now,
                  updatedAt: now,
                },
                repeatGroupId: `repeat-${selectedCharacter.id}-${selectedHunt.id}-${Date.now()}`,
                repeatIndex: 1,
                maxRepeatIndex: autoRepeat.mode === "repeat_count" ? autoRepeat.maxRepeats ?? 3 : 10,
              }
            : updatedCharacter.currentAction,
        };
      }
      updateSelectedCharacter(updatedCharacter);
      setSelectedHunt(undefined);
      setActiveTab("home");
      prependLog(
        "Hunt started",
        autoRepeat?.enabled
          ? `Auto-repeat enabled for ${selectedHunt.name}: ${autoRepeat.maxRepeats ?? 3} runs.`
          : `${selectedCharacter.name} iniciou hunt em ${selectedHunt.name}. Acompanhe a cena de combate.`,
        "neutral",
      );
    } catch (error) {
      prependLog(
        "Action blocked",
        error instanceof Error ? error.message : "Character cannot start this hunt.",
        "warning",
      );
    }
  }

  function handleCancelAction() {
    const result = cancelCurrentAction(selectedCharacter);
    updateSelectedCharacter(result.character);
    prependLog(result.success ? "Action canceled" : "Action blocked", result.message, result.success ? "neutral" : "warning");
  }

  function handleReturnToCityFromHuntScene() {
    const result = cancelCurrentAction(selectedCharacter);
    updateSelectedCharacter(result.character);
    setActiveTab("home");
    prependLog(
      result.success ? "Return to city" : "Action blocked",
      result.message,
      result.success ? "neutral" : "warning",
    );
  }

  function handleStopHuntAutoRepeat() {
    if (selectedCharacter.currentAction?.type !== "hunting" || !selectedCharacter.currentAction.autoRepeat?.enabled) {
      prependLog("Auto-repeat", "Nenhum auto-repeat ativo para parar.", "warning");
      return;
    }

    updateSelectedCharacter({
      ...selectedCharacter,
      currentAction: {
        ...selectedCharacter.currentAction,
        autoRepeat: {
          ...selectedCharacter.currentAction.autoRepeat,
          enabled: false,
          updatedAt: new Date().toISOString(),
        },
      },
    });
    prependLog("Auto-repeat", "Auto-repeat disabled manually. Hunt atual continua.", "neutral");
  }

  function handleFinishTravel() {
    const result = finishTravel(selectedCharacter);
    updateSelectedCharacter(result.character);
    prependLog(result.success ? "Travel finished" : "Traveling", result.message, result.success ? "success" : "warning");
  }

  function handleFinishHunt() {
    if (selectedCharacter.status !== "hunting" || !selectedCharacter.currentAction?.targetId) {
      prependLog("Hunt blocked", "Nenhuma hunt ativa para finalizar.", "warning");
      return;
    }
    if (selectedCharacter.currentAction.resolvedAt) {
      prependLog("Hunt blocked", "Resultado da hunt ja foi coletado.", "warning");
      return;
    }

    const resolutionKey = getActionResolutionKey(selectedCharacter);
    if (!beginActionResolution(resolutionKey, resolvingActionRef.current)) {
      prependLog("Hunt blocked", "Resultado da hunt ja esta sendo coletado.", "warning");
      return;
    }

    const activeHunt =
      hunts.find((hunt) => hunt.id === selectedCharacter.currentAction?.targetId);

    if (!activeHunt) {
      endActionResolution(resolutionKey, resolvingActionRef.current);
      prependLog("Hunt blocked", "Hunt atual nao encontrada no catalogo.", "warning");
      return;
    }

    try {
      const activeDuration = selectedCharacter.currentAction.durationMinutes ?? durationMinutes;

      const previousAutoRepeat = selectedCharacter.currentAction?.autoRepeat;
      const { character, result } = finishHunt(
        selectedCharacter,
        activeHunt,
        activeDuration,
        guild.gold,
        guild.bestiary,
        guildOperationBonuses.huntXpBonusPercent,
      );
      const bestiaryUpdate = addMonsterKillsToBestiary(guild.bestiary, result.monsterKills ?? []);
      result.bestiaryLogs = bestiaryUpdate.logs;
      result.logs = [...result.logs, ...bestiaryUpdate.logs];

      const autoRepeatResult = resolveAutoRepeatAfterHunt({
        character,
        hunt: activeHunt,
        guild,
        depot,
        previousConfig: previousAutoRepeat,
        durationMinutes: activeDuration,
        guildXpBonusPercent: guildOperationBonuses.huntXpBonusPercent,
      });

      updateSelectedCharacter(autoRepeatResult.character);
      setGuild((currentGuild) => ({
        ...currentGuild,
        gold: Math.max(0, currentGuild.gold + result.netProfit),
        bestiary: bestiaryUpdate.bestiary,
      }));
      setLastHuntResult({
        characterName: selectedCharacter.name,
        character: autoRepeatResult.character,
        hunt: activeHunt,
        result,
      });

      for (const message of [...result.logs].reverse()) {
        prependLog(result.died ? "Hunt failed" : "Hunt result", message, result.died ? "warning" : "success");
      }

      if (result.rejectedLoot && result.rejectedLoot.length > 0) {
        prependLog(
          "Capacity full",
          `${selectedCharacter.name} deixou loot para tras por falta de capacity.`,
          "warning",
        );
      }

      if (result.netProfit > 0) {
        prependLog(
          "Guild gold",
          `${selectedCharacter.name} retornou da hunt com ${result.netProfit.toLocaleString("en-US")}g para a Guilda ${guild.name}.`,
          "success",
        );
      }
      for (const message of [...autoRepeatResult.logs].reverse()) {
        prependLog("Auto-repeat", message, autoRepeatResult.summary.startedNextRun ? "success" : "warning");
      }
    } catch (error) {
      endActionResolution(resolutionKey, resolvingActionRef.current);
      prependLog(
        "Hunt blocked",
        error instanceof Error ? error.message : "Hunt cannot be finished.",
        "warning",
      );
    }
  }

  function handleReviveSelectedCharacter() {
    try {
      const revived = reviveCharacter(selectedCharacter);
      updateSelectedCharacter(revived);
      prependLog(
        "Temple revival",
        `${revived.name} foi revivido em ${revived.city} e esta disponivel.`,
        "success",
      );
    } catch (error) {
      prependLog(
        "Temple",
        error instanceof Error ? error.message : "Aguardando recuperacao no templo.",
        "warning",
      );
    }
  }

  function handleBuyBlessing(blessingId: string) {
    if (buyingBlessingRef.current) return;

    const blessing = getBlessingById(blessingId);

    if (!blessing) {
      prependLog("Temple Services", "Bless nao encontrada.", "warning");
      return;
    }

    if (selectedCharacter.status === "dead") {
      prependLog("Temple Services", "Personagem morto. Reviva no templo antes de receber bless.", "warning");
      return;
    }

    const activeBlessings = getActiveBlessings(selectedCharacter.blessings);

    if (activeBlessings.some((activeBlessing) => activeBlessing.domain === "Legacy")) {
      prependLog("Temple Services", `${selectedCharacter.name} possui uma bless legada ativa.`, "warning");
      return;
    }

    if ((selectedCharacter.blessings ?? []).includes(blessing.id)) {
      prependLog("Temple Services", `${selectedCharacter.name} ja possui ${blessing.name}.`, "warning");
      return;
    }

    if (guild.gold < blessing.price) {
      prependLog("Temple Services", `Gold insuficiente para ${blessing.name}.`, "warning");
      return;
    }

    buyingBlessingRef.current = true;

    try {
      updateSelectedCharacter({
        ...selectedCharacter,
        blessings: [...(selectedCharacter.blessings ?? []), blessing.id],
      });
      setGuild((currentGuild) => ({
        ...currentGuild,
        gold: Math.max(0, currentGuild.gold - blessing.price),
      }));
      prependLog(
        "Temple Services",
        `${selectedCharacter.name} recebeu ${blessing.name}. Gold da guilda reduzido em ${blessing.price.toLocaleString("en-US")}.`,
        "success",
      );
    } finally {
      window.setTimeout(() => {
        buyingBlessingRef.current = false;
      }, 0);
    }
  }

  function handleCreateRecommendedPreset() {
    if (!selectedHunt) return;

    const preset = createPresetFromHunt(selectedCharacter, selectedHunt, durationMinutes);
    setGuild((currentGuild) => ({
      ...currentGuild,
      huntPresets: [
        ...(currentGuild.huntPresets ?? []).filter(
          (entry) =>
            !(
              entry.huntId === preset.huntId &&
              entry.characterId === preset.characterId &&
              entry.durationMinutes === preset.durationMinutes
            ),
        ),
        preset,
      ],
    }));
    prependLog("Hunt preset", `Preset recomendado criado para ${selectedHunt.name}.`, "success");
  }

  function handlePrepareHunt(preset: HuntSupplyPreset) {
    const hunt = hunts.find((candidate) => candidate.id === preset.huntId);
    if (!hunt) {
      prependLog("Hunt prep", "Preset invalido: hunt nao encontrada.", "warning");
      return;
    }

    const prepared = prepareHuntSupplies(guild, selectedCharacter, depot, hunt, preset);
    setGuild({
      ...prepared.guild,
      huntPresets: guild.huntPresets ?? [],
    });
    updateSelectedCharacter(prepared.character);
    setDepot(prepared.guildDepot);
    setLastPreparationResult(prepared.result);

    for (const message of [...prepared.result.logs, ...prepared.result.warnings].reverse()) {
      prependLog(prepared.result.success ? "Hunt prep" : "Hunt prep blocked", message, prepared.result.success ? "success" : "warning");
    }
  }

  function handleDeleteHuntPreset(presetId: string) {
    setGuild((currentGuild) => ({
      ...currentGuild,
      huntPresets: (currentGuild.huntPresets ?? []).filter((preset) => preset.id !== presetId),
    }));
    prependLog("Hunt preset", "Preset removido.", "neutral");
  }

  function handleClaimBestiaryReward(monsterId: string) {
    const resolutionKey = `claim-bestiary-${monsterId}`;
    if (!beginResearchResolution(resolutionKey)) return;

    try {
      const result = claimBestiaryReward(guild.bestiary, monsterId);
      setGuild((currentGuild) => ({ ...currentGuild, bestiary: result.bestiary }));
      for (const message of [...result.logs].reverse()) {
        prependLog("Bestiary", message, "success");
      }
    } catch (error) {
      prependLog("Bestiary", error instanceof Error ? error.message : "Reward blocked.", "warning");
    } finally {
      endResearchResolution(resolutionKey);
    }
  }

  function handleUnlockCharm(charmId: string) {
    const resolutionKey = `unlock-charm-${charmId}`;
    if (!beginResearchResolution(resolutionKey)) return;

    try {
      const result = unlockCharm(guild.bestiary, charmId);
      setGuild((currentGuild) => ({ ...currentGuild, bestiary: result.bestiary }));
      for (const message of [...result.logs].reverse()) {
        prependLog("Charms", message, "success");
      }
    } catch (error) {
      prependLog("Charms", error instanceof Error ? error.message : "Charm blocked.", "warning");
    } finally {
      endResearchResolution(resolutionKey);
    }
  }

  function handleAssignCharm(charmId: string, monsterId: string) {
    const resolutionKey = `assign-charm-${charmId}-${monsterId}`;
    if (!beginResearchResolution(resolutionKey)) return;

    try {
      const result = assignCharmToMonster(guild.bestiary, charmId, monsterId);
      setGuild((currentGuild) => ({ ...currentGuild, bestiary: result.bestiary }));
      for (const message of [...result.logs].reverse()) {
        prependLog("Charms", message, "success");
      }
    } catch (error) {
      prependLog("Charms", error instanceof Error ? error.message : "Assign blocked.", "warning");
    } finally {
      endResearchResolution(resolutionKey);
    }
  }

  function handleRemoveCharm(monsterId: string) {
    const resolutionKey = `remove-charm-${monsterId}`;
    if (!beginResearchResolution(resolutionKey)) return;

    try {
      const result = removeCharmFromMonster(guild.bestiary, monsterId);
      setGuild((currentGuild) => ({ ...currentGuild, bestiary: result.bestiary }));
      for (const message of [...result.logs].reverse()) {
        prependLog("Charms", message, "neutral");
      }
    } catch (error) {
      prependLog("Charms", error instanceof Error ? error.message : "Remove blocked.", "warning");
    } finally {
      endResearchResolution(resolutionKey);
    }
  }

  function beginResearchResolution(resolutionKey: string) {
    if (resolvingResearchRef.current.has(resolutionKey)) return false;
    resolvingResearchRef.current.add(resolutionKey);
    return true;
  }

  function endResearchResolution(resolutionKey: string) {
    window.setTimeout(() => resolvingResearchRef.current.delete(resolutionKey), 0);
  }

  function handleUpgradeForgeItem(inventoryItem: InventoryItem) {
    const target = findCharacterItem(selectedCharacter, inventoryItem.id);
    if (!target) return;

    try {
      const result = upgradeItem(selectedCharacter, guild, depot, target.item);
      updateSelectedCharacter(result.character);
      setGuild(result.guild);
      setDepot(result.guildDepot);
      for (const message of [...result.logs].reverse()) {
        prependLog("Forge", message, "success");
      }
    } catch (error) {
      prependLog("Forge failed", error instanceof Error ? error.message : "Upgrade blocked.", "warning");
    }
  }

  function handleIncreaseForgeTier(inventoryItem: InventoryItem) {
    const target = findCharacterItem(selectedCharacter, inventoryItem.id);
    if (!target) return;

    try {
      const result = increaseItemTier(selectedCharacter, guild, depot, target.item);
      updateSelectedCharacter(result.character);
      setGuild(result.guild);
      setDepot(result.guildDepot);
      for (const message of [...result.logs].reverse()) {
        prependLog("Forge", message, "success");
      }
    } catch (error) {
      prependLog("Forge failed", error instanceof Error ? error.message : "Tier blocked.", "warning");
    }
  }

  function handleApplyForgeImbuement(inventoryItem: InventoryItem, imbuementId: string) {
    const target = findCharacterItem(selectedCharacter, inventoryItem.id);
    if (!target) return;

    try {
      const result = applyImbuement(selectedCharacter, guild, depot, target.item, target.slot, imbuementId);
      updateSelectedCharacter(result.character);
      setGuild(result.guild);
      setDepot(result.guildDepot);
      for (const message of [...result.logs].reverse()) {
        prependLog("Forge", message, "success");
      }
    } catch (error) {
      prependLog("Forge failed", error instanceof Error ? error.message : "Imbuement blocked.", "warning");
    }
  }

  function handleRemoveForgeImbuements(inventoryItem: InventoryItem, imbuementId?: string) {
    const updatedCharacter = updateCharacterItem(
      selectedCharacter,
      inventoryItem.id,
      (item) => ({
        ...item,
        imbuements: imbuementId
          ? (item.imbuements ?? []).filter((active) => active.imbuementId !== imbuementId)
          : [],
      }),
    );
    const attributes = calculateCharacterAttributes(updatedCharacter);
    updateSelectedCharacter({
      ...updatedCharacter,
      attributes,
      capacityMax: attributes.capacity,
    });
    prependLog(
      "Forge",
      imbuementId
        ? `${inventoryItem.item.name} teve um imbuement removido sem recuperar materiais.`
        : `${inventoryItem.item.name} teve seus imbuements removidos.`,
      "neutral",
    );
  }

  function handleSendToDepot(inventoryItem: InventoryItem) {
    if (hasContainerContents(selectedCharacter.inventory, inventoryItem)) {
      prependLog("Container blocked", "Esvazie esta mochila antes de enviar ao Guild Depot.", "warning");
      return;
    }

    const transfer = transferItem(
      selectedCharacter,
      depot,
      inventoryItem.id,
      inventoryItem.quantity,
      "characterToDepot",
    );

    updateSelectedCharacter(transfer.character);
    setDepot(transfer.depot);

    if (transfer.movedQuantity > 0) {
      prependLog(
        "Depot transfer",
        `${selectedCharacter.name} enviou ${inventoryItem.item.name} x${transfer.movedQuantity} para o Guild Depot.`,
        "neutral",
      );
    }
  }

  function handleSendToCharacterDepot(inventoryItem: InventoryItem) {
    if (hasContainerContents(selectedCharacter.inventory, inventoryItem)) {
      prependLog("Container blocked", "Esvazie esta mochila antes de enviar ao Depot do Personagem.", "warning");
      return;
    }

    const movedItem: InventoryItem = {
      ...inventoryItem,
      id: `${inventoryItem.id}-char-depot-${Date.now()}`,
      location: "character",
      ownerCharacterId: selectedCharacter.id,
      parentContainerId: null,
    };
    const inventory = removeInventoryItemById(selectedCharacter.inventory, inventoryItem.id);
    const characterDepot = mergeStackableItems([
      ...selectedCharacter.characterDepot,
      movedItem,
    ]);

    updateSelectedCharacter({
      ...selectedCharacter,
      inventory,
      characterDepot,
      capacityUsed: calculateCapacityUsed(inventory),
    });
    prependLog(
      "Depot transfer",
      `${selectedCharacter.name} enviou ${inventoryItem.item.name} x${inventoryItem.quantity} para o Depot do Personagem.`,
      "neutral",
    );
  }

  function handleSendToCharacter(inventoryItem: InventoryItem) {
    const transfer = transferItem(
      selectedCharacter,
      depot,
      inventoryItem.id,
      inventoryItem.quantity,
      "depotToCharacter",
    );

    if (transfer.movedQuantity <= 0) {
      prependLog(
        "Capacity warning",
        transfer.rejectedReason ?? `${selectedCharacter.name} cannot carry this item.`,
        "warning",
      );
      return;
    }

    updateSelectedCharacter(transfer.character);
    setDepot(transfer.depot);
    prependLog(
      "Depot transfer",
      `${selectedCharacter.name} recebeu ${inventoryItem.item.name} x${transfer.movedQuantity} do Guild Depot.`,
      "success",
    );
  }

  function handleSendCharacterDepotToInventory(inventoryItem: InventoryItem) {
    const movedWeight = inventoryItem.item.weight * inventoryItem.quantity;
    const freeCapacity = selectedCharacter.capacityMax - calculateCapacityUsed(selectedCharacter.inventory);

    if (movedWeight > freeCapacity) {
      prependLog(
        "Capacity warning",
        `${selectedCharacter.name} nao consegue carregar ${inventoryItem.item.name}.`,
        "warning",
      );
      return;
    }

    const characterDepot = removeInventoryItemById(
      selectedCharacter.characterDepot,
      inventoryItem.id,
    );
    const inventory = mergeStackableItems([
      ...selectedCharacter.inventory,
      {
        ...inventoryItem,
        id: `${inventoryItem.id}-inventory-${Date.now()}`,
        location: "character" as const,
        ownerCharacterId: selectedCharacter.id,
        parentContainerId: null,
      },
    ]);

    updateSelectedCharacter({
      ...selectedCharacter,
      inventory,
      characterDepot,
      capacityUsed: calculateCapacityUsed(inventory),
    });
    prependLog(
      "Depot transfer",
      `${selectedCharacter.name} retirou ${inventoryItem.item.name} x${inventoryItem.quantity} do Depot do Personagem.`,
      "success",
    );
  }

  function handleMoveInventoryItemToContainer(
    inventoryItem: InventoryItem,
    container: InventoryItem,
  ) {
    const result = moveItemToContainer(
      selectedCharacter.inventory,
      inventoryItem.id,
      container.id,
      container,
    );

    if (!result.moved) {
      prependLog(
        "Container blocked",
        result.reason ?? `${inventoryItem.item.name} nao pode ser movido.`,
        "warning",
      );
      return;
    }

    updateSelectedCharacter({
      ...selectedCharacter,
      inventory: result.items,
      capacityUsed: calculateCapacityUsed(result.items),
    });
    prependLog(
      "Container",
      `${inventoryItem.item.name} foi movido para ${container.item.name}.`,
      "neutral",
    );
  }

  function handleMoveInventoryItemOutOfContainer(inventoryItem: InventoryItem) {
    const result = moveItemOutOfContainer(selectedCharacter.inventory, inventoryItem.id);

    if (!result.moved) {
      prependLog(
        "Container blocked",
        result.reason ?? `${inventoryItem.item.name} nao pode sair da mochila.`,
        "warning",
      );
      return;
    }

    updateSelectedCharacter({
      ...selectedCharacter,
      inventory: result.items,
      capacityUsed: calculateCapacityUsed(result.items),
    });
    prependLog(
      "Container",
      `${inventoryItem.item.name} voltou para a raiz do inventario.`,
      "neutral",
    );
  }

  function handleSellMarketItems(
    source: SellSource,
    inventoryItemIds: string[],
  ) {
    if (inventoryItemIds.length === 0) return;

    if (source === "character_inventory") {
      const sale = sellFromCharacterInventory(
        selectedCharacter,
        guild,
        inventoryItemIds,
      );
      updateSelectedCharacter(sale.character);
      setGuild(sale.guild);
      logMarketResult(sale.result.logs, sale.result.success);
      return;
    }

    if (source === "character_depot") {
      const sale = sellFromCharacterDepot(selectedCharacter, guild, inventoryItemIds);
      updateSelectedCharacter(sale.character);
      setGuild(sale.guild);
      logMarketResult(sale.result.logs, sale.result.success);
      return;
    }

    const sale = sellFromGuildDepot(depot, guild, inventoryItemIds);
    setDepot(sale.guildDepot);
    setGuild(sale.guild);
    logMarketResult(sale.result.logs, sale.result.success);
  }

  function handleSellMarketCategory(
    source: SellSource,
    category: MarketItemCategory,
  ) {
    const sourceItems =
      source === "character_inventory"
        ? selectedCharacter.inventory
        : source === "character_depot"
          ? selectedCharacter.characterDepot
          : depot.items;
    const itemIds = sellAllByCategory(sourceItems, category);
    handleSellMarketItems(source, itemIds);
  }

  function handleToggleMarketItemLock(source: SellSource, inventoryItemId: string) {
    const getMessage = (inventoryItem?: InventoryItem) =>
      inventoryItem
        ? `${inventoryItem.item.name} foi ${inventoryItem.locked ? "destravado" : "travado contra venda"}.`
        : "Item atualizado.";

    if (source === "guild_depot") {
      const item = depot.items.find((entry) => entry.id === inventoryItemId);
      setDepot((currentDepot) => ({
        ...currentDepot,
        items: toggleInventoryItemLock(currentDepot.items, inventoryItemId),
      }));
      prependLog("Market lock", getMessage(item), "neutral");
      return;
    }

    const item =
      source === "character_inventory"
        ? selectedCharacter.inventory.find((entry) => entry.id === inventoryItemId)
        : selectedCharacter.characterDepot.find((entry) => entry.id === inventoryItemId);
    const updatedCharacter =
      source === "character_inventory"
        ? {
            ...selectedCharacter,
            inventory: toggleInventoryItemLock(selectedCharacter.inventory, inventoryItemId),
          }
        : {
            ...selectedCharacter,
            characterDepot: toggleInventoryItemLock(
              selectedCharacter.characterDepot,
              inventoryItemId,
            ),
          };
    updateSelectedCharacter(updatedCharacter);
    prependLog("Market lock", getMessage(item), "neutral");
  }

  function handleActivateMonsterFocus(
    slotIndex: number,
    monsterId: string,
    bonusType: MonsterFocusBonusType,
  ) {
    const resolutionKey = `activate-focus-${selectedCharacter.id}-${slotIndex}`;
    if (!beginResearchResolution(resolutionKey)) return;

    try {
      const updatedCharacter = activateMonsterFocus(selectedCharacter, guild.bestiary, {
        slotIndex,
        monsterId,
        bonusType,
      });
      updateSelectedCharacter(updatedCharacter);
      prependLog(
        "Monster Focus",
        `${selectedCharacter.name} ativou Monster Focus no slot ${slotIndex + 1}.`,
        "success",
      );
    } catch (error) {
      prependLog(
        "Monster Focus blocked",
        error instanceof Error ? error.message : "Monster Focus nao pode ser ativado.",
        "warning",
      );
    } finally {
      endResearchResolution(resolutionKey);
    }
  }

  function handleCraftEquipment(recipeId: string) {
    if (craftingEquipmentRef.current) return;
    craftingEquipmentRef.current = true;
    const result = craftEquipment(guild, depot, recipeId);
    if (result.success) {
      setGuild(result.guild);
      setDepot(result.depot);
    }
    prependLog(result.success ? "Equipment crafted" : "Crafting blocked", result.message, result.success ? "success" : "warning");
    window.setTimeout(() => { craftingEquipmentRef.current = false; }, 250);
  }

  function handleSalvageEquipment(inventoryItemId: string) {
    if (salvagingEquipmentRef.current) return;
    salvagingEquipmentRef.current = true;
    const result = salvageEquipment(guild, depot, inventoryItemId);
    if (result.success) {
      setGuild(result.guild);
      setDepot(result.depot);
    }
    prependLog(result.success ? "Equipment salvaged" : "Salvage blocked", result.message, result.success ? "success" : "warning");
    window.setTimeout(() => { salvagingEquipmentRef.current = false; }, 250);
  }

  function handleClearMonsterFocus(slotIndex: number) {
    const resolutionKey = `clear-focus-${selectedCharacter.id}-${slotIndex}`;
    if (!beginResearchResolution(resolutionKey)) return;

    try {
      updateSelectedCharacter(clearMonsterFocusSlot(selectedCharacter, slotIndex));
      prependLog(
        "Monster Focus",
        `${selectedCharacter.name} limpou o slot ${slotIndex + 1}.`,
        "neutral",
      );
    } finally {
      endResearchResolution(resolutionKey);
    }
  }

  function handleRerollMonsterFocus(slotIndex: number) {
    const resolutionKey = `reroll-focus-${selectedCharacter.id}-${slotIndex}`;
    if (!beginResearchResolution(resolutionKey)) return;

    try {
      const cost = getMonsterFocusRerollCost(selectedCharacter, slotIndex);

      if (guild.gold < cost) {
        prependLog(
          "Monster Focus blocked",
          `Guilda ${guild.name} nao possui gold suficiente para reroll (${cost.toLocaleString("en-US")}g).`,
          "warning",
        );
        return;
      }

      const result = rerollMonsterFocusBonus(selectedCharacter, slotIndex);
      updateSelectedCharacter(result.character);
      setGuild((currentGuild) => ({
        ...currentGuild,
        gold: Math.max(0, currentGuild.gold - result.cost),
      }));
      prependLog(
        "Monster Focus",
        `${selectedCharacter.name} rerolled Monster Focus por ${result.cost.toLocaleString("en-US")}g.`,
        "success",
      );
    } catch (error) {
      prependLog(
        "Monster Focus blocked",
        error instanceof Error ? error.message : "Monster Focus nao pode ser rerolled.",
        "warning",
      );
    } finally {
      endResearchResolution(resolutionKey);
    }
  }

  function handleUnlockDestinyNode(nodeId: string) {
    const resolutionKey = `unlock-${selectedCharacter.id}-${nodeId}`;
    if (resolvingDestinyRef.current.has(resolutionKey)) {
      return;
    }

    resolvingDestinyRef.current.add(resolutionKey);

    try {
      const result = unlockDestinyNode(selectedCharacter, nodeId);
      updateSelectedCharacter(result.character);
      for (const message of [...result.logs].reverse()) {
        prependLog("Path of Destiny", message, "success");
      }
    } catch (error) {
      prependLog(
        "Destiny blocked",
        error instanceof Error ? error.message : "Destiny node cannot be unlocked.",
        "warning",
      );
    } finally {
      window.setTimeout(() => resolvingDestinyRef.current.delete(resolutionKey), 0);
    }
  }

  function handleResetDestinyPath() {
    const resolutionKey = `reset-${selectedCharacter.id}`;
    if (resolvingDestinyRef.current.has(resolutionKey)) {
      return;
    }

    const cost = getDestinyResetCost(selectedCharacter);

    if (cost <= 0) {
      prependLog("Path of Destiny", "No Destiny nodes to reset.", "warning");
      return;
    }

    if (guild.gold < cost) {
      prependLog(
        "Destiny blocked",
        `Guilda ${guild.name} nao possui gold suficiente para reset (${cost.toLocaleString("en-US")}g).`,
        "warning",
      );
      return;
    }

    if (!window.confirm(`Reset Path of Destiny for ${selectedCharacter.name} for ${cost.toLocaleString("en-US")}g?`)) {
      return;
    }

    resolvingDestinyRef.current.add(resolutionKey);

    try {
      updateSelectedCharacter(resetDestinyPath(selectedCharacter));
      setGuild((currentGuild) => ({
        ...currentGuild,
        gold: Math.max(0, currentGuild.gold - cost),
      }));
      prependLog(
        "Path of Destiny",
        `${selectedCharacter.name} resetou Path of Destiny por ${cost.toLocaleString("en-US")}g.`,
        "neutral",
      );
    } finally {
      window.setTimeout(() => resolvingDestinyRef.current.delete(resolutionKey), 0);
    }
  }

  function handleEquipCollectionItem(itemId: string) {
    const resolutionKey = `equip-collection-${selectedCharacter.id}-${itemId}`;
    if (resolvingCollectionsRef.current.has(resolutionKey)) return;
    resolvingCollectionsRef.current.add(resolutionKey);

    try {
      const updatedCharacter = equipCollectionItem(selectedCharacter, guild, itemId);
      updateSelectedCharacter(updatedCharacter);
      prependLog("Collections", `${selectedCharacter.name} updated cosmetic collection.`, "success");
    } catch (error) {
      prependLog(
        "Collections blocked",
        error instanceof Error ? error.message : "Cosmetic cannot be equipped.",
        "warning",
      );
    } finally {
      window.setTimeout(() => resolvingCollectionsRef.current.delete(resolutionKey), 0);
    }
  }

  function handleMarkCollectionsSeen() {
    setGuild((currentGuild) => clearNewCollectionFlags(currentGuild));
  }

  function handleExchangeCosmetic(collectionItemId: string) {
    if (exchangingCosmeticRef.current) return;
    exchangingCosmeticRef.current = true;

    try {
      const result = exchangeCosmetic(guild, depot, characters, collectionItemId);
      setGuild(result.guild);
      setDepot(result.depot);
      prependLog(
        result.success ? "Wardrobe exchange" : "Exchange blocked",
        result.message,
        result.success ? "success" : "warning",
      );
    } finally {
      window.setTimeout(() => {
        exchangingCosmeticRef.current = false;
      }, 250);
    }
  }

  function handleClaimDailyReward() {
    if (claimingDailyRewardRef.current) {
      prependLog("Daily blocked", "Daily Reward claim is already being processed.", "warning");
      return;
    }

    claimingDailyRewardRef.current = true;

    try {
      const result = claimDailyReward(guild, depot);
      setGuild(result.guild);
      setDepot(result.guildDepot);

      for (const message of [...result.logs].reverse()) {
        prependLog(
          result.success ? "Daily Reward" : "Daily blocked",
          message,
          result.success ? "success" : "warning",
        );
      }
    } finally {
      window.setTimeout(() => {
        claimingDailyRewardRef.current = false;
      }, 0);
    }
  }

  function handleBuyMarketItem(
    itemId: string,
    quantity: number,
    unitPrice: number,
    deliveryTarget: ShopDeliveryTarget,
  ) {
    const purchase = buyFromNpcShop(
      selectedCharacter,
      guild,
      depot,
      itemId,
      quantity,
      unitPrice,
      deliveryTarget,
    );

    updateSelectedCharacter(purchase.character);
    setGuild(purchase.guild);
    setDepot(purchase.guildDepot);

    for (const message of [...purchase.logs].reverse()) {
      prependLog(purchase.success ? "Market purchase" : "Market blocked", message, purchase.success ? "success" : "warning");
    }
  }

  function handleSyncBazaar(nowIso: string) {
    const now = new Date(nowIso);
    setGuild((currentGuild) => {
      const bazaar = normalizeGuildBazaarState(currentGuild.bazaar, currentGuild.id, now);
      return currentGuild.bazaar?.rotationKey === bazaar.rotationKey
        ? currentGuild
        : { ...currentGuild, bazaar };
    });
  }

  function handlePurchaseBazaarOffer(offerId: string, deliveryTarget: ShopDeliveryTarget) {
    if (buyingBazaarOfferRef.current) return;
    buyingBazaarOfferRef.current = true;

    try {
      const purchase = purchaseBazaarOffer({
        character: selectedCharacter,
        guild,
        guildDepot: depot,
        offerId,
        deliveryTarget,
      });

      updateSelectedCharacter(purchase.character);
      setGuild(purchase.guild);
      setDepot(purchase.guildDepot);

      for (const message of [...purchase.logs].reverse()) {
        prependLog(
          purchase.success ? "Bazaar purchase" : "Bazaar blocked",
          message,
          purchase.success ? "success" : "warning",
        );
      }
    } finally {
      window.setTimeout(() => {
        buyingBazaarOfferRef.current = false;
      }, 250);
    }
  }

  function logMarketResult(messages: string[], success: boolean) {
    if (messages.length === 0) {
      prependLog("Market", "Nenhum item foi vendido.", "warning");
      return;
    }

    for (const message of [...messages].reverse()) {
      prependLog(success ? "Market sale" : "Market blocked", message, success ? "success" : "warning");
    }
  }

  function handleEquipItem(inventoryItem: InventoryItem) {
    const result = equipItem(selectedCharacter, inventoryItem);

    if (!result.equipped) {
      prependLog(
        "Equip blocked",
        `${selectedCharacter.name} nao pode equipar ${inventoryItem.item.name}: ${result.reason}`,
        "warning",
      );
      return;
    }

    updateSelectedCharacter(result.character);
    prependLog(
      "Equipment changed",
      `${selectedCharacter.name} equipou ${inventoryItem.item.name}.`,
      "success",
    );
  }

  function handleUnequipItem(slot: EquipmentSlot) {
    const result = unequipItem(selectedCharacter, slot);

    if (!result.unequipped) {
      prependLog(
        "Unequip blocked",
        result.reason ?? `${selectedCharacter.name} nao pode remover este item.`,
        "warning",
      );
      return;
    }

    updateSelectedCharacter(result.character);
    prependLog(
      "Equipment changed",
      `${selectedCharacter.name} removeu ${result.itemName}.`,
      "neutral",
    );
  }

  function handleStartTraining(
    targetSkill: TrainingTarget,
    trainingType: TrainingType,
    trainingDurationMinutes: number,
    cost: number,
  ) {
    try {
      if (trainingType === "exercise" && guild.gold < cost) {
        throw new Error(`Guilda ${guild.name} nao possui gold suficiente para Exercise Training.`);
      }

      const updatedCharacter = startTraining(
        selectedCharacter,
        trainingType,
        targetSkill,
        trainingDurationMinutes,
        cost,
        guildOperationBonuses.trainingProgressBonusPercent,
      );
      updateSelectedCharacter(updatedCharacter);
      if (trainingType === "exercise") {
        setGuild((currentGuild) => ({
          ...currentGuild,
          gold: currentGuild.gold - cost,
        }));
      }
      setActiveTab("action");
      prependLog(
        "Training started",
        `${selectedCharacter.name} iniciou treino ${trainingType} de ${formatSkillName(targetSkill)}. Acompanhe na aba Acao.`,
        "neutral",
      );
    } catch (error) {
      prependLog(
        "Training blocked",
        error instanceof Error ? error.message : "Training cannot be started.",
        "warning",
      );
    }
  }

  function handleFinishTraining() {
    if (selectedCharacter.currentAction?.resolvedAt) {
      prependLog("Training blocked", "Resultado do treino ja foi coletado.", "warning");
      return;
    }
    const resolutionKey = getActionResolutionKey(selectedCharacter);
    if (!beginActionResolution(resolutionKey, resolvingActionRef.current)) {
      prependLog("Training blocked", "Resultado do treino ja esta sendo coletado.", "warning");
      return;
    }
    let resolved = false;

    try {
      const { character, result } = finishTraining(selectedCharacter);
      resolved = true;
      updateSelectedCharacter(character);
      setLastTrainingResult(result);
      prependLog(
        "Training finished",
        `${selectedCharacter.name} finalizou treino de ${formatSkillName(result.targetSkill)} e ganhou ${result.progressGain}% de progresso.`,
        "success",
      );

      if (result.skillGain.levelsGained > 0) {
        prependLog(
          "Skill advanced",
          `${selectedCharacter.name} avancou em ${formatSkillName(result.targetSkill)}: ${result.skillGain.oldLevel} -> ${result.skillGain.newLevel}.`,
          "success",
        );
      }
    } catch (error) {
      prependLog(
        "Training blocked",
        error instanceof Error ? error.message : "Training cannot be finished.",
        "warning",
      );
    } finally {
      if (!resolved) {
        endActionResolution(resolutionKey, resolvingActionRef.current);
      }
    }
  }

  function handleStartQuest(quest: Quest) {
    try {
      const result = startQuest(selectedCharacter, quest, guildOperationBonuses.questXpBonusPercent);
      updateSelectedCharacter(result.character);
      setActiveTab("action");

      for (const message of [...result.logs].reverse()) {
        prependLog("Quest started", `${message} Acompanhe na aba Acao.`, "neutral");
      }
    } catch (error) {
      prependLog(
        "Quest blocked",
        error instanceof Error ? error.message : "Quest cannot be started.",
        "warning",
      );
    }
  }

  function handleFinishQuest(quest: Quest) {
    if (selectedCharacter.currentAction?.resolvedAt) {
      prependLog("Quest blocked", "Resultado da quest ja foi coletado.", "warning");
      return;
    }
    const resolutionKey = getActionResolutionKey(selectedCharacter);
    if (!beginActionResolution(resolutionKey, resolvingActionRef.current)) {
      prependLog("Quest blocked", "Resultado da quest ja esta sendo coletado.", "warning");
      return;
    }
    let resolved = false;

    try {
      const result = finishQuest(
        selectedCharacter,
        quest,
        guild.gold,
        guildOperationBonuses.questXpBonusPercent,
      );
      resolved = true;
      updateSelectedCharacter(result.character);
      setLastQuestResult(result.result);

      const questGuild = {
        ...guild,
        renown: guild.renown + result.guildRenownGained,
        gold: Math.max(0, guild.gold + result.goldGained - result.guildGoldLost),
      };
      if (result.result.success && quest.type === "access") {
        const collectionUnlock = unlockCollectionItem(questGuild, "outfit-cave-delver");
        setGuild(collectionUnlock.guild);
        const collectionLogs = collectionUnlock.logs;
        for (const message of [...collectionLogs].reverse()) {
          prependLog("Collections", message, "success");
        }
      } else if (result.result.success || result.guildRenownGained > 0 || result.goldGained > 0 || result.guildGoldLost > 0) {
        setGuild(questGuild);
      }

      if (result.goldGained > 0) {
        prependLog(
          "Guild gold",
          `${selectedCharacter.name} completou quest com ${result.goldGained.toLocaleString("en-US")}g para a Guilda ${guild.name}.`,
          "success",
        );
      }

      for (const message of [...result.result.logs].reverse()) {
        prependLog(result.result.success ? "Quest completed" : "Quest failed", message, result.result.success ? "success" : "warning");
      }
    } catch (error) {
      prependLog(
        "Quest blocked",
        error instanceof Error ? error.message : "Quest cannot be finished.",
        "warning",
      );
    } finally {
      if (!resolved) {
        endActionResolution(resolutionKey, resolvingActionRef.current);
      }
    }
  }

  function handleStartBoss() {
    if (!selectedBoss || startingBossRef.current) return;
    startingBossRef.current = true;

    try {
      const result = startBoss(characters, selectedBoss, bossParty, guild.gold);
      setCharacters(result.characters);
      setGuild((currentGuild) => ({
        ...currentGuild,
        gold: Math.max(0, currentGuild.gold - result.guildGoldSpent),
      }));
      if (!bossParty.members.some((member) => member.characterId === selectedCharacter.id)) {
        setSelectedCharacterId(bossParty.members[0].characterId);
      }
      setActiveTab("action");

      for (const message of [...result.logs].reverse()) {
        prependLog("Boss started", `${message} Acompanhe na aba Acao.`, "neutral");
      }
    } catch (error) {
      prependLog(
        "Boss blocked",
        error instanceof Error ? error.message : "Boss cannot be started.",
        "warning",
      );
    } finally {
      window.setTimeout(() => {
        startingBossRef.current = false;
      }, 500);
    }
  }

  function handleFinishBoss() {
    const activeBossContext = getActiveBossContext(
      selectedCharacter,
      selectedBoss,
      bossParty,
    );

    if (!activeBossContext) {
      prependLog("Boss blocked", "Boss atual nao encontrado no catalogo.", "warning");
      return;
    }
    if (selectedCharacter.currentAction?.resolvedAt) {
      prependLog("Boss blocked", "Resultado do boss ja foi coletado.", "warning");
      return;
    }

    const resolutionKey = getActionResolutionKey(selectedCharacter);
    if (!beginActionResolution(resolutionKey, resolvingActionRef.current)) {
      prependLog("Boss blocked", "Resultado do boss ja esta sendo coletado.", "warning");
      return;
    }

    try {
      const result = finishBoss(
        characters,
        depot,
        activeBossContext.boss,
        activeBossContext.party,
        guild.gold,
      );
      setCharacters(result.characters);
      setDepot(result.depot);
      setLastBossResult(result.result);

      const bossGuild = {
        ...guild,
        renown: guild.renown + result.guildRenownGained,
        gold: Math.max(0, guild.gold + result.result.goldGained - result.guildGoldLost),
      };
      if (result.result.defeated) {
        const collectionUnlock = unlockCollectionItem(bossGuild, "avatar-dungeon-victor-sigil");
        setGuild(collectionUnlock.guild);
        const collectionLogs = collectionUnlock.logs;
        for (const message of [...collectionLogs].reverse()) {
          prependLog("Collections", message, "success");
        }
      } else if (result.guildRenownGained > 0 || result.result.goldGained > 0 || result.guildGoldLost > 0) {
        setGuild(bossGuild);
      }

      if (result.result.goldGained > 0) {
        prependLog(
          "Guild gold",
          `${result.result.bossName} rendeu ${result.result.goldGained.toLocaleString("en-US")}g para a Guilda ${guild.name}.`,
          "success",
        );
      }

      for (const message of [...result.logs].reverse()) {
        prependLog(
          result.result.defeated ? "Boss defeated" : "Boss result",
          message,
          result.result.defeated ? "success" : "warning",
        );
      }
    } catch (error) {
      endActionResolution(resolutionKey, resolvingActionRef.current);
      prependLog(
        "Boss blocked",
        error instanceof Error ? error.message : "Boss cannot be finished.",
        "warning",
      );
    }
  }

  function handleCancelBoss() {
    const activeBossContext = getActiveBossContext(
      selectedCharacter,
      selectedBoss,
      bossParty,
    );

    if (!activeBossContext) return;

    const result = cancelBoss(
      characters,
      activeBossContext.boss,
      activeBossContext.party,
    );
    setCharacters(result.characters);

    for (const message of [...result.logs].reverse()) {
      prependLog("Boss canceled", message, "neutral");
    }
  }

  if (isLoadingSave) {
    return (
      <GameShell>
        <div className="save-loading-screen">
          <span>Guild Hunt Idle</span>
          <strong>Carregando save...</strong>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell>
      <TopBar
        activeTab={activeTab}
        guild={guild}
        guildTitle={activeGuildTitle}
        onOpenTab={handleOpenTab}
        onManualSave={handleManualSave}
        onReloadSave={handleReloadSave}
        onResetSave={handleResetSave}
        saveStatus={saveStatus}
        selectedCharacter={selectedCharacter}
        showSaveControls={clientPreferences.showTopbarSaveControls}
      />
      <OfflineReportPanel
        report={offlineReport}
        onDismiss={() => setOfflineReport(undefined)}
        onGoToAction={() => {
          setActiveTab("action");
          setOfflineReport(undefined);
        }}
      />
        <div className={`game-layout ${activeTab === "home" && selectedCharacter.status === "hunting" ? "is-hunt-scene-mode" : ""} ${activeTab === "character" ? "is-character-hall-mode" : ""} ${activeTab === "operations" ? "is-operations-dashboard-mode" : ""} ${activeTab === "headquarters" ? "is-headquarters-hall-mode" : ""} ${activeTab === "contracts" ? "is-contracts-hall-mode" : ""} ${activeTab === "staff" ? "is-staff-hall-mode" : ""} ${activeTab === "treasury" ? "is-treasury-hall-mode" : ""} ${activeTab === "projects" ? "is-projects-hall-mode" : ""} ${activeTab === "logistics" ? "is-logistics-board-mode" : ""} ${activeTab === "recruitment" ? "is-recruitment-hall-mode" : ""} ${activeTab === "skills" ? "is-skills-hall-mode" : ""} ${activeTab === "training" || activeTab === "proficiency" ? "is-training-hall-mode" : ""} ${activeTab === "blessings" ? "is-blessings-hall-mode" : ""} ${activeTab === "bestiary" || activeTab === "focus" ? "is-hunting-research-mode" : ""} ${activeTab === "destiny" ? "is-destiny-hall-mode" : ""} ${activeTab === "collections" ? "is-collections-hall-mode" : ""} ${activeTab === "daily" ? "is-daily-hall-mode" : ""} ${activeTab === "ranking" ? "is-ranking-hall-mode" : ""} ${activeTab === "store" ? "is-store-hall-mode" : ""} ${activeTab === "updates" ? "is-updates-hall-mode" : ""} ${activeTab === "wiki" ? "is-codex-hall-mode" : ""} ${activeTab === "settings" ? "is-settings-hall-mode" : ""}`.trim()}>
        <LeftPanel
          characters={characters}
          selectedCharacterId={selectedCharacter.id}
          onSelectCharacter={setSelectedCharacterId}
        />
        <MainPanel
          activeTab={activeTab}
          bossParty={bossParty}
          bosses={bosses}
          characters={characters}
          clientPreferences={clientPreferences}
          depot={depot}
          durationMinutes={durationMinutes}
          hunts={hunts}
          logs={logs}
          quests={quests}
          lastBossResult={lastBossResult}
          lastResult={lastHuntResult}
          lastQuestResult={lastQuestResult}
          lastTrainingResult={lastTrainingResult}
          onCancelBoss={handleCancelBoss}
          onAssignCharm={handleAssignCharm}
          onBuyBlessing={handleBuyBlessing}
          onClaimBestiaryReward={handleClaimBestiaryReward}
          onChangeTab={handleOpenTab}
          onChangeClientPreferences={handleChangeClientPreferences}
          onChangeBossPartyRole={handleChangeBossPartyRole}
          onChangeDuration={setDurationMinutes}
          onCancelAction={handleCancelAction}
          onFinishBoss={handleFinishBoss}
          onFinishHunt={handleFinishHunt}
          onReturnToCity={handleReturnToCityFromHuntScene}
          onFinishQuest={handleFinishQuest}
          onFinishTravel={handleFinishTravel}
          onApplyForgeImbuement={handleApplyForgeImbuement}
          onCraftEquipment={handleCraftEquipment}
          onSalvageEquipment={handleSalvageEquipment}
          onReviveCharacter={handleReviveSelectedCharacter}
          onRemoveCharm={handleRemoveCharm}
          onRemoveForgeImbuements={handleRemoveForgeImbuements}
          onSelectBoss={handleSelectBoss}
          onSelectCharacter={setSelectedCharacterId}
          onSelectHunt={setSelectedHunt}
          onOpenTrackedHunt={handleOpenTrackedHunt}
          onClearSelectedHunt={() => setSelectedHunt(undefined)}
          onEquipItem={handleEquipItem}
          onMoveInventoryItemOutOfContainer={handleMoveInventoryItemOutOfContainer}
          onMoveInventoryItemToContainer={handleMoveInventoryItemToContainer}
          onSendToCharacter={handleSendToCharacter}
          onSendCharacterDepotToInventory={handleSendCharacterDepotToInventory}
          onSendToCharacterDepot={handleSendToCharacterDepot}
          onSendToDepot={handleSendToDepot}
          onSellMarketCategory={handleSellMarketCategory}
          onSellMarketItems={handleSellMarketItems}
          onBuyMarketItem={handleBuyMarketItem}
          onPurchaseBazaarOffer={handlePurchaseBazaarOffer}
          onSyncBazaar={handleSyncBazaar}
          onActivateMonsterFocus={handleActivateMonsterFocus}
          onClearMonsterFocus={handleClearMonsterFocus}
          onEquipCollectionItem={handleEquipCollectionItem}
          onExchangeCosmetic={handleExchangeCosmetic}
          onEquipGuildTitle={handleEquipGuildTitle}
          onUpgradeGuildFacility={handleUpgradeGuildFacility}
          onStartGuildExpedition={handleStartGuildExpedition}
          onCompleteGuildExpedition={handleCompleteGuildExpedition}
          onHireGuildSpecialist={handleHireGuildSpecialist}
          onAssignGuildSpecialist={handleAssignGuildSpecialist}
          onTransferGuildTreasuryGold={handleTransferGuildTreasuryGold}
          onFundGuildProjectPhase={handleFundGuildProjectPhase}
          onRecruitGuildCandidate={handleRecruitGuildCandidate}
          onClaimGuildLevelReward={handleClaimGuildLevelReward}
          onClaimGuildRenownObjective={handleClaimGuildRenownObjective}
          onActivateGuildDirective={handleActivateGuildDirective}
          onSaveGuildSquad={handleSaveGuildSquad}
          onLoadGuildSquad={handleLoadGuildSquad}
          onSaveDeploymentOrder={handleSaveDeploymentOrder}
          onClearDeploymentOrder={handleClearDeploymentOrder}
          onUpdateGuildLogisticsPin={handleUpdateGuildLogisticsPin}
          onAcknowledgeGuildLogisticsAlerts={handleAcknowledgeGuildLogisticsAlerts}
          onClaimDailyReward={handleClaimDailyReward}
          onMarkCollectionsSeen={handleMarkCollectionsSeen}
          onResetDestinyPath={handleResetDestinyPath}
          onManualSave={handleManualSave}
          onReloadSave={handleReloadSave}
          onResetSave={handleResetSave}
          onResetClientPreferences={handleResetClientPreferences}
          onRerollMonsterFocus={handleRerollMonsterFocus}
          onStartBoss={handleStartBoss}
          onStartHunt={handleStartHunt}
          onStopHuntAutoRepeat={handleStopHuntAutoRepeat}
          onStartQuest={handleStartQuest}
          onStartTraining={handleStartTraining}
          onIncreaseForgeTier={handleIncreaseForgeTier}
          onFinishTraining={handleFinishTraining}
          onToggleBossPartyMember={handleToggleBossPartyMember}
          onToggleMarketItemLock={handleToggleMarketItemLock}
          onUnlockCharm={handleUnlockCharm}
          onUnlockDestinyNode={handleUnlockDestinyNode}
          onUpgradeForgeItem={handleUpgradeForgeItem}
          onUnequipItem={handleUnequipItem}
          offlineReport={offlineReport}
          saveStatus={saveStatus}
          guild={guild}
          selectedBoss={selectedBoss}
          selectedCharacter={selectedCharacter}
          selectedHunt={selectedHunt}
        />
        <CharacterSideMenu
          activeTab={activeTab}
          character={selectedCharacter}
          guild={guild}
          onOpenTab={handleOpenTab}
        />
        <RightCharacterPanel
          character={selectedCharacter}
          guild={guild}
          logs={logs}
          showActivityFeed={clientPreferences.showActivityFeed}
        />
      </div>
    </GameShell>
  );
}

let logEntrySequence = 0;

function createLogEntry(
  title: string,
  message: string,
  tone: ActivityLogEntry["tone"],
): ActivityLogEntry {
  const createdAt = new Date();

  return {
    id: `log-${Date.now()}-${logEntrySequence++}`,
    createdAt: createdAt.toISOString(),
    timestamp: createdAt.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    title,
    message,
    tone,
  };
}

function applyLoadedOfflineCatchUp(
  state: GameStateSnapshot,
  lastSavedAt?: string,
) {
  const catchUp = applyOfflineCatchUp(state, { lastSavedAt });

  if (catchUp.report.characterReports.length === 0) {
    return catchUp;
  }

  return {
    ...catchUp,
    state: {
      ...catchUp.state,
      logs: [
        ...catchUp.report.logs.map((message) =>
          createLogEntry("Offline catch-up", message, "neutral"),
        ),
        ...catchUp.state.logs,
      ],
    },
  };
}

function getActionResolutionKey(character: Character) {
  const action = character.currentAction;
  return `${character.id}:${action?.type ?? character.status}:${action?.targetId ?? action?.label ?? "none"}:${action?.startedAt ?? "no-start"}`;
}

function beginActionResolution(key: string, activeKeys: Set<string>) {
  if (activeKeys.has(key)) return false;
  activeKeys.add(key);
  return true;
}

function endActionResolution(key: string, activeKeys: Set<string>) {
  activeKeys.delete(key);
}

function getActiveBossContext(
  selectedCharacter: (typeof mockCharacters)[number],
  selectedBoss: Boss | undefined,
  selectedParty: BossParty,
) {
  if (selectedCharacter.currentAction?.type !== "bossing") {
    return selectedBoss ? { boss: selectedBoss, party: selectedParty } : undefined;
  }

  const boss = bosses.find(
    (candidate) => candidate.id === selectedCharacter.currentAction?.targetId,
  );

  if (!boss) return undefined;

  return {
    boss,
    party: {
      bossId: boss.id,
      members:
        selectedCharacter.currentAction.partyMembers ??
        selectedCharacter.currentAction.partyMemberIds?.map((characterId) => ({
          characterId,
          role: selectedParty.members.find((member) => member.characterId === characterId)?.role ?? "damage",
        })) ??
        [],
    },
  };
}

function getDefaultPartyRole(vocation: (typeof mockCharacters)[number]["vocation"]): PartyRole {
  if (vocation === "Guardian") return "tank";
  if (vocation === "Warden") return "healer";
  if (vocation === "Monk") return "support";
  return "damage";
}

function removeInventoryItemById(items: InventoryItem[], inventoryItemId: string) {
  return items.filter((item) => item.id !== inventoryItemId);
}

function hasContainerContents(items: InventoryItem[], inventoryItem: InventoryItem) {
  return inventoryItem.item.isContainer === true &&
    getContainerContents(items, inventoryItem.id).length > 0;
}
