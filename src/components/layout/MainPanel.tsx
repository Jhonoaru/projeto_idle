import { CharacterDetails } from "../character/CharacterDetails";
import { CurrentActionBox } from "../character/CurrentActionBox";
import { SkillList } from "../character/SkillList";
import { EquipmentPanel } from "../equipment/EquipmentPanel";
import { GuildDepotPanel } from "../inventory/GuildDepotPanel";
import { InventoryPanel } from "../inventory/InventoryPanel";
import { HuntActionPanel } from "../hunt/HuntActionPanel";
import { HuntList } from "../hunt/HuntList";
import { HuntResultPanel } from "../hunt/HuntResultPanel";
import { QuestPanel } from "../quest/QuestPanel";
import { TrainingPanel } from "../training/TrainingPanel";
import { Panel } from "../ui/Panel";
import type { TrainingResult } from "../../game-services/trainingService";
import type {
  Character,
  EquipmentSlot,
  GuildDepot,
  HuntArea,
  HuntSimulationResult,
  InventoryItem,
  Quest,
  TrainingTarget,
  TrainingType,
} from "../../shared/types";

interface LastResultView {
  characterName: string;
  character: Character;
  hunt: HuntArea;
  result: HuntSimulationResult;
}

interface MainPanelProps {
  selectedCharacter: Character;
  hunts: HuntArea[];
  quests: Quest[];
  selectedHunt?: HuntArea;
  durationMinutes: number;
  lastResult?: LastResultView;
  lastTrainingResult?: TrainingResult;
  lastQuestResult?: {
    success: boolean;
    died: boolean;
    accessUnlocked?: string;
    logs: string[];
  };
  activeTab:
    | "character"
    | "hunts"
    | "inventory"
    | "equipment"
    | "depot"
    | "training"
    | "quests";
  depot: GuildDepot;
  onChangeTab: (tab: MainPanelProps["activeTab"]) => void;
  onSelectHunt: (hunt: HuntArea) => void;
  onChangeDuration: (durationMinutes: number) => void;
  onStartHunt: () => void;
  onFinishHunt: () => void;
  onSendToDepot: (inventoryItem: InventoryItem) => void;
  onSendToCharacter: (inventoryItem: InventoryItem) => void;
  onEquipItem: (inventoryItem: InventoryItem) => void;
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
}

export function MainPanel({
  selectedCharacter,
  hunts,
  quests,
  selectedHunt,
  durationMinutes,
  lastResult,
  lastTrainingResult,
  lastQuestResult,
  activeTab,
  depot,
  onChangeTab,
  onSelectHunt,
  onChangeDuration,
  onStartHunt,
  onFinishHunt,
  onSendToDepot,
  onSendToCharacter,
  onEquipItem,
  onUnequipItem,
  onStartTraining,
  onFinishTraining,
  onCancelAction,
  onFinishTravel,
  onStartQuest,
  onFinishQuest,
}: MainPanelProps) {
  return (
    <section className="main-panel">
      <div className="main-tabs">
        <TabButton activeTab={activeTab} label="Personagem" tab="character" onChangeTab={onChangeTab} />
        <TabButton activeTab={activeTab} label="Hunts" tab="hunts" onChangeTab={onChangeTab} />
        <TabButton activeTab={activeTab} label="Inventario" tab="inventory" onChangeTab={onChangeTab} />
        <TabButton activeTab={activeTab} label="Equipamento" tab="equipment" onChangeTab={onChangeTab} />
        <TabButton activeTab={activeTab} label="Depot" tab="depot" onChangeTab={onChangeTab} />
        <TabButton activeTab={activeTab} label="Treino" tab="training" onChangeTab={onChangeTab} />
        <TabButton activeTab={activeTab} label="Quests" tab="quests" onChangeTab={onChangeTab} />
      </div>

      <div className="tab-content">
        {activeTab === "character" ? (
          <>
          <CharacterDetails character={selectedCharacter} />
          <Panel title="Current Action">
            <CurrentActionBox
              character={selectedCharacter}
              onCancelAction={onCancelAction}
              onFinishTravel={onFinishTravel}
            />
          </Panel>
          <Panel title="Skills">
            <SkillList character={selectedCharacter} skills={selectedCharacter.skills} />
          </Panel>
          </>
        ) : null}

        {activeTab === "hunts" ? (
          <>
          <HuntActionPanel
            character={selectedCharacter}
            durationMinutes={durationMinutes}
            onChangeDuration={onChangeDuration}
            onFinishHunt={onFinishHunt}
            onStartHunt={onStartHunt}
            selectedHunt={selectedHunt}
          />
          <HuntResultPanel
            character={lastResult?.character}
            characterName={lastResult?.characterName}
            hunt={lastResult?.hunt}
            result={lastResult?.result}
          />
          <HuntList
            character={selectedCharacter}
            hunts={hunts}
            onSelectHunt={onSelectHunt}
            selectedHuntId={selectedHunt?.id}
          />
          </>
        ) : null}

        {activeTab === "inventory" ? (
          <Panel title={`${selectedCharacter.name} Inventory`}>
          <InventoryPanel
            character={selectedCharacter}
            onEquipItem={onEquipItem}
            onSendToDepot={onSendToDepot}
          />
          </Panel>
        ) : null}

        {activeTab === "equipment" ? (
          <Panel title={`${selectedCharacter.name} Equipment`}>
          <EquipmentPanel character={selectedCharacter} onUnequip={onUnequipItem} />
          </Panel>
        ) : null}

        {activeTab === "depot" ? (
          <Panel title="Guild Depot">
          <GuildDepotPanel depot={depot} onSendToCharacter={onSendToCharacter} />
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
      </div>
    </section>
  );
}

function TabButton({
  activeTab,
  label,
  tab,
  onChangeTab,
}: {
  activeTab: MainPanelProps["activeTab"];
  label: string;
  tab: MainPanelProps["activeTab"];
  onChangeTab: (tab: MainPanelProps["activeTab"]) => void;
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
