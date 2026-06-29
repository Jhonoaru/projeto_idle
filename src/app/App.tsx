import { useEffect, useMemo, useState } from "react";
import { GameShell } from "../components/layout/GameShell";
import { LeftPanel } from "../components/layout/LeftPanel";
import { MainPanel } from "../components/layout/MainPanel";
import { RightPanel } from "../components/layout/RightPanel";
import { TopBar } from "../components/layout/TopBar";
import { mockCharacters } from "../data/mockCharacters";
import { mockDepot } from "../data/mockDepot";
import { mockGuild } from "../data/mockGuild";
import { hunts } from "../data/hunts";
import { mockLogs } from "../data/mockLogs";
import { quests } from "../data/quests";
import { cancelCurrentAction, finishTravel } from "../game-services/actionService";
import { equipItem } from "../game-engine/equipment/equipItem";
import { unequipItem } from "../game-engine/equipment/unequipItem";
import { transferItem } from "../game-engine/inventory/transferItem";
import { finishHunt, startHunt } from "../game-services/huntService";
import { finishQuest, startQuest } from "../game-services/questService";
import {
  finishTraining,
  formatSkillName,
  startTraining,
  type TrainingResult,
} from "../game-services/trainingService";
import type {
  ActivityLogEntry,
  HuntArea,
  HuntSimulationResult,
  EquipmentSlot,
  InventoryItem,
  Quest,
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
  const [selectedHunt, setSelectedHunt] = useState<HuntArea | undefined>(hunts[0]);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [lastHuntResult, setLastHuntResult] = useState<LastHuntResult>();
  const [lastTrainingResult, setLastTrainingResult] = useState<TrainingResult>();
  const [lastQuestResult, setLastQuestResult] = useState<{
    success: boolean;
    died: boolean;
    accessUnlocked?: string;
    logs: string[];
  }>();
  const [activeTab, setActiveTab] = useState<
    "character" | "hunts" | "inventory" | "equipment" | "depot" | "training" | "quests"
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

  function handleStartHunt() {
    if (!selectedHunt) return;

    try {
      const updatedCharacter = startHunt(
        selectedCharacter,
        selectedHunt,
        durationMinutes,
      );
      updateSelectedCharacter(updatedCharacter);
      prependLog(
        "Hunt started",
        `${selectedCharacter.name} iniciou hunt em ${selectedHunt.name} por ${durationMinutes} minutos.`,
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
    if (!selectedHunt) return;

    const { character, result } = finishHunt(
      selectedCharacter,
      selectedHunt,
      durationMinutes,
    );

    updateSelectedCharacter(character);
    setLastHuntResult({
      characterName: selectedCharacter.name,
      character,
      hunt: selectedHunt,
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
  }

  function handleSendToDepot(inventoryItem: InventoryItem) {
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
      const updatedCharacter = startTraining(
        selectedCharacter,
        trainingType,
        targetSkill,
        trainingDurationMinutes,
        cost,
      );
      updateSelectedCharacter(updatedCharacter);
      prependLog(
        "Training started",
        `${selectedCharacter.name} iniciou treino ${trainingType} de ${formatSkillName(targetSkill)} por ${trainingDurationMinutes} minutos.`,
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
    }
  }

  function handleStartQuest(quest: Quest) {
    try {
      const result = startQuest(selectedCharacter, quest);
      updateSelectedCharacter(result.character);

      for (const message of [...result.logs].reverse()) {
        prependLog("Quest started", message, "neutral");
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
    try {
      const result = finishQuest(selectedCharacter, quest);
      updateSelectedCharacter(result.character);
      setLastQuestResult(result.result);

      if (result.guildRenownGained > 0) {
        setGuild((currentGuild) => ({
          ...currentGuild,
          renown: currentGuild.renown + result.guildRenownGained,
        }));
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
    }
  }

  return (
    <GameShell>
      <TopBar guild={guild} />
      <div className="game-layout">
        <LeftPanel
          characters={characters}
          selectedCharacterId={selectedCharacter.id}
          onSelectCharacter={setSelectedCharacterId}
        />
        <MainPanel
          activeTab={activeTab}
          depot={depot}
          durationMinutes={durationMinutes}
          hunts={hunts}
          quests={quests}
          lastResult={lastHuntResult}
          lastQuestResult={lastQuestResult}
          lastTrainingResult={lastTrainingResult}
          onChangeTab={setActiveTab}
          onChangeDuration={setDurationMinutes}
          onCancelAction={handleCancelAction}
          onFinishHunt={handleFinishHunt}
          onFinishQuest={handleFinishQuest}
          onFinishTravel={handleFinishTravel}
          onSelectHunt={setSelectedHunt}
          onEquipItem={handleEquipItem}
          onSendToCharacter={handleSendToCharacter}
          onSendToDepot={handleSendToDepot}
          onStartHunt={handleStartHunt}
          onStartQuest={handleStartQuest}
          onStartTraining={handleStartTraining}
          onFinishTraining={handleFinishTraining}
          onUnequipItem={handleUnequipItem}
          selectedCharacter={selectedCharacter}
          selectedHunt={selectedHunt}
        />
        <RightPanel logs={logs} />
      </div>
    </GameShell>
  );
}
