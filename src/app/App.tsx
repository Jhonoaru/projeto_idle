import { useEffect, useMemo, useRef, useState } from "react";
import { GameShell } from "../components/layout/GameShell";
import { LeftPanel } from "../components/layout/LeftPanel";
import { MainPanel } from "../components/layout/MainPanel";
import { RightPanel } from "../components/layout/RightPanel";
import { TopBar } from "../components/layout/TopBar";
import { OfflineReportPanel } from "../components/offline/OfflineReportPanel";
import { initDatabase } from "../database/db";
import {
  createInitialGameState,
  loadSaveMetadata,
  loadGameState,
  markOfflineCatchUpApplied,
  markSaveLoaded,
  resetSave,
  saveGameState,
  type GameStateSnapshot,
} from "../database/saveGameRepository";
import { bosses } from "../data/bosses";
import { getBlessingById } from "../data/blessings";
import { addMonsterKillsToBestiary } from "../game-engine/bestiary/addMonsterKillsToBestiary";
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
import { getContainerContents } from "../game-engine/container/getContainerContents";
import { calculateCharacterAttributes } from "../game-engine/character/calculateCharacterAttributes";
import { moveItemOutOfContainer } from "../game-engine/container/moveItemOutOfContainer";
import { moveItemToContainer } from "../game-engine/container/moveItemToContainer";
import { calculateCapacityUsed } from "../game-engine/inventory/calculateCapacityUsed";
import { mergeStackableItems } from "../game-engine/inventory/mergeStackableItems";
import { transferItem } from "../game-engine/inventory/transferItem";
import { createPresetFromHunt } from "../game-engine/hunt-prep/createPresetFromHunt";
import { prepareHuntSupplies } from "../game-engine/hunt-prep/prepareHuntSupplies";
import { applyOfflineCatchUp } from "../game-engine/offline/applyOfflineCatchUp";
import { applyImbuement } from "../game-engine/forge/applyImbuement";
import { findCharacterItem, updateCharacterItem } from "../game-engine/forge/forgeInventoryHelpers";
import { increaseItemTier } from "../game-engine/forge/increaseItemTier";
import { upgradeItem } from "../game-engine/forge/upgradeItem";
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
  OfflineCatchUpReport,
  HuntPreparationResult,
  HuntSupplyPreset,
  HuntSimulationResult,
  EquipmentSlot,
  InventoryItem,
  MarketItemCategory,
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
  const [depot, setDepot] = useState(mockDepot);
  const [logs, setLogs] = useState<ActivityLogEntry[]>(mockLogs);
  const [database, setDatabase] = useState<Awaited<ReturnType<typeof initDatabase>>>();
  const [isLoadingSave, setIsLoadingSave] = useState(true);
  const [saveStatus, setSaveStatus] = useState("Carregando save...");
  const [offlineReport, setOfflineReport] = useState<OfflineCatchUpReport>();
  const [selectedHunt, setSelectedHunt] = useState<HuntArea | undefined>(hunts[0]);
  const [durationMinutes, setDurationMinutes] = useState(30);
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
  const [activeTab, setActiveTab] = useState<
    | "character"
    | "action"
    | "hunts"
    | "inventory"
    | "equipment"
    | "depot"
    | "training"
    | "quests"
    | "bosses"
    | "market"
    | "bestiary"
    | "forge"
  >("character");
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

  useEffect(() => {
    if (selectedCharacter.status !== "hunting" || !selectedCharacter.currentAction?.targetId) {
      return;
    }

    const currentHunt = hunts.find(
      (hunt) => hunt.id === selectedCharacter.currentAction?.targetId,
    );

    if (currentHunt) {
      setSelectedHunt(currentHunt);
    }
  }, [selectedCharacter]);

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
      setSelectedCharacterId(stateToApply.characters[0]?.id ?? selectedCharacterId);
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
      const resetState = await resetSave(database);
      applyGameState({
        ...resetState,
        logs: [
          createLogEntry("Save", "Save resetado.", "warning"),
          ...resetState.logs,
        ],
      });
      setSelectedCharacterId(resetState.characters[0]?.id ?? mockCharacters[0].id);
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

  function handleClearBossCooldown(characterId: string, bossId: string) {
    setCharacters((currentCharacters) =>
      currentCharacters.map((character) =>
        character.id === characterId
          ? {
              ...character,
              bossCooldowns: character.bossCooldowns.filter(
                (cooldown) => cooldown.bossId !== bossId,
              ),
            }
          : character,
      ),
    );
    prependLog("Boss cooldown", "Debug: cooldown de boss removido.", "neutral");
  }

  function handleStartHunt() {
    if (!selectedHunt) return;

    try {
      const updatedCharacter = startHunt(
        selectedCharacter,
        selectedHunt,
        durationMinutes,
      );
      updateSelectedCharacter(updatedCharacter);
      setActiveTab("action");
      prependLog(
        "Hunt started",
        `${selectedCharacter.name} iniciou hunt em ${selectedHunt.name} com supplies suficientes. Acompanhe na aba Acao.`,
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

    const activeDuration = selectedCharacter.currentAction.durationMinutes ?? durationMinutes;

    const { character, result } = finishHunt(
      selectedCharacter,
      activeHunt,
      activeDuration,
      guild.gold,
      guild.bestiary,
    );
    const bestiaryUpdate = addMonsterKillsToBestiary(guild.bestiary, result.monsterKills ?? []);
    result.bestiaryLogs = bestiaryUpdate.logs;
    result.logs = [...result.logs, ...bestiaryUpdate.logs];

    updateSelectedCharacter(character);
    setGuild((currentGuild) => ({
      ...currentGuild,
      gold: Math.max(0, currentGuild.gold + result.netProfit),
      bestiary: bestiaryUpdate.bestiary,
    }));
    setLastHuntResult({
      characterName: selectedCharacter.name,
      character,
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
    endActionResolution(resolutionKey, resolvingActionRef.current);
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
    const blessing = getBlessingById(blessingId);

    if (!blessing) {
      prependLog("Temple Services", "Bless nao encontrada.", "warning");
      return;
    }

    if (selectedCharacter.status === "dead") {
      prependLog("Temple Services", "Personagem morto. Reviva no templo antes de receber bless.", "warning");
      return;
    }

    if ((selectedCharacter.blessings ?? []).length > 0) {
      prependLog("Temple Services", `${selectedCharacter.name} ja possui uma bless ativa.`, "warning");
      return;
    }

    if (guild.gold < blessing.price) {
      prependLog("Temple Services", `Gold insuficiente para ${blessing.name}.`, "warning");
      return;
    }

    updateSelectedCharacter({
      ...selectedCharacter,
      blessings: [blessing.id],
    });
    setGuild((currentGuild) => ({
      ...currentGuild,
      gold: currentGuild.gold - blessing.price,
    }));
    prependLog(
      "Temple Services",
      `${selectedCharacter.name} recebeu ${blessing.name}. Gold da guilda reduzido em ${blessing.price.toLocaleString("en-US")}.`,
      "success",
    );
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
    try {
      const result = claimBestiaryReward(guild.bestiary, monsterId);
      setGuild((currentGuild) => ({ ...currentGuild, bestiary: result.bestiary }));
      for (const message of [...result.logs].reverse()) {
        prependLog("Bestiary", message, "success");
      }
    } catch (error) {
      prependLog("Bestiary", error instanceof Error ? error.message : "Reward blocked.", "warning");
    }
  }

  function handleUnlockCharm(charmId: string) {
    try {
      const result = unlockCharm(guild.bestiary, charmId);
      setGuild((currentGuild) => ({ ...currentGuild, bestiary: result.bestiary }));
      for (const message of [...result.logs].reverse()) {
        prependLog("Charms", message, "success");
      }
    } catch (error) {
      prependLog("Charms", error instanceof Error ? error.message : "Charm blocked.", "warning");
    }
  }

  function handleAssignCharm(charmId: string, monsterId: string) {
    try {
      const result = assignCharmToMonster(guild.bestiary, charmId, monsterId);
      setGuild((currentGuild) => ({ ...currentGuild, bestiary: result.bestiary }));
      for (const message of [...result.logs].reverse()) {
        prependLog("Charms", message, "success");
      }
    } catch (error) {
      prependLog("Charms", error instanceof Error ? error.message : "Assign blocked.", "warning");
    }
  }

  function handleRemoveCharm(monsterId: string) {
    try {
      const result = removeCharmFromMonster(guild.bestiary, monsterId);
      setGuild((currentGuild) => ({ ...currentGuild, bestiary: result.bestiary }));
      for (const message of [...result.logs].reverse()) {
        prependLog("Charms", message, "neutral");
      }
    } catch (error) {
      prependLog("Charms", error instanceof Error ? error.message : "Remove blocked.", "warning");
    }
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
    const resolutionKey = getActionResolutionKey(selectedCharacter);
    if (!beginActionResolution(resolutionKey, resolvingActionRef.current)) {
      prependLog("Training blocked", "Resultado do treino ja esta sendo coletado.", "warning");
      return;
    }

    try {
      const { character, result } = finishTraining(selectedCharacter);
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
      endActionResolution(resolutionKey, resolvingActionRef.current);
    }
  }

  function handleStartQuest(quest: Quest) {
    try {
      const result = startQuest(selectedCharacter, quest);
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
    const resolutionKey = getActionResolutionKey(selectedCharacter);
    if (!beginActionResolution(resolutionKey, resolvingActionRef.current)) {
      prependLog("Quest blocked", "Resultado da quest ja esta sendo coletado.", "warning");
      return;
    }

    try {
      const result = finishQuest(selectedCharacter, quest, guild.gold);
      updateSelectedCharacter(result.character);
      setLastQuestResult(result.result);

      if (result.guildRenownGained > 0 || result.goldGained > 0 || result.guildGoldLost > 0) {
        setGuild((currentGuild) => ({
          ...currentGuild,
          renown: currentGuild.renown + result.guildRenownGained,
          gold: Math.max(0, currentGuild.gold + result.goldGained - result.guildGoldLost),
        }));
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
      endActionResolution(resolutionKey, resolvingActionRef.current);
    }
  }

  function handleStartBoss() {
    if (!selectedBoss) return;

    try {
      const result = startBoss(characters, selectedBoss, bossParty);
      setCharacters(result.characters);
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

    const resolutionKey = getActionResolutionKey(selectedCharacter);
    if (!beginActionResolution(resolutionKey, resolvingActionRef.current)) {
      prependLog("Boss blocked", "Resultado do boss ja esta sendo coletado.", "warning");
      return;
    }

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

    if (result.guildRenownGained > 0 || result.result.goldGained > 0 || result.guildGoldLost > 0) {
      setGuild((currentGuild) => ({
        ...currentGuild,
        renown: currentGuild.renown + result.guildRenownGained,
        gold: Math.max(0, currentGuild.gold + result.result.goldGained - result.guildGoldLost),
      }));
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
    endActionResolution(resolutionKey, resolvingActionRef.current);
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
        guild={guild}
        onManualSave={handleManualSave}
        onReloadSave={handleReloadSave}
        onResetSave={handleResetSave}
        saveStatus={saveStatus}
      />
      <OfflineReportPanel
        report={offlineReport}
        onDismiss={() => setOfflineReport(undefined)}
        onGoToAction={() => {
          setActiveTab("action");
          setOfflineReport(undefined);
        }}
      />
      <div className="game-layout">
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
          depot={depot}
          durationMinutes={durationMinutes}
          hunts={hunts}
          quests={quests}
          lastBossResult={lastBossResult}
          lastPreparationResult={lastPreparationResult}
          lastResult={lastHuntResult}
          lastQuestResult={lastQuestResult}
          lastTrainingResult={lastTrainingResult}
          onCancelBoss={handleCancelBoss}
          onAssignCharm={handleAssignCharm}
          onBuyBlessing={handleBuyBlessing}
          onClaimBestiaryReward={handleClaimBestiaryReward}
          onCreateRecommendedPreset={handleCreateRecommendedPreset}
          onChangeTab={setActiveTab}
          onChangeBossPartyRole={handleChangeBossPartyRole}
          onChangeDuration={setDurationMinutes}
          onCancelAction={handleCancelAction}
          onClearBossCooldown={handleClearBossCooldown}
          onFinishBoss={handleFinishBoss}
          onFinishHunt={handleFinishHunt}
          onFinishQuest={handleFinishQuest}
          onFinishTravel={handleFinishTravel}
          onApplyForgeImbuement={handleApplyForgeImbuement}
          onReviveCharacter={handleReviveSelectedCharacter}
          onRemoveCharm={handleRemoveCharm}
          onDeleteHuntPreset={handleDeleteHuntPreset}
          onRemoveForgeImbuements={handleRemoveForgeImbuements}
          onPrepareHunt={handlePrepareHunt}
          onSelectBoss={handleSelectBoss}
          onSelectHunt={setSelectedHunt}
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
          onStartBoss={handleStartBoss}
          onStartHunt={handleStartHunt}
          onStartQuest={handleStartQuest}
          onStartTraining={handleStartTraining}
          onIncreaseForgeTier={handleIncreaseForgeTier}
          onFinishTraining={handleFinishTraining}
          onToggleBossPartyMember={handleToggleBossPartyMember}
          onToggleMarketItemLock={handleToggleMarketItemLock}
          onUnlockCharm={handleUnlockCharm}
          onUpgradeForgeItem={handleUpgradeForgeItem}
          onUnequipItem={handleUnequipItem}
          guild={guild}
          selectedBoss={selectedBoss}
          selectedCharacter={selectedCharacter}
          selectedHunt={selectedHunt}
        />
        <RightPanel logs={logs} />
      </div>
    </GameShell>
  );
}

function createLogEntry(
  title: string,
  message: string,
  tone: ActivityLogEntry["tone"],
): ActivityLogEntry {
  return {
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString("en-US", {
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
  return `${character.id}:${action?.type ?? character.status}:${action?.targetId ?? action?.label ?? "none"}`;
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
