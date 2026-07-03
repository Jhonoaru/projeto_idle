import { useState } from "react";
import { BossPanel } from "../boss/BossPanel";
import { HuntActionPanel } from "../hunt/HuntActionPanel";
import { HuntList } from "../hunt/HuntList";
import { HuntResultPanel } from "../hunt/HuntResultPanel";
import { QuestPanel } from "../quest/QuestPanel";
import { TrainingPanel } from "../training/TrainingPanel";
import { GameTabBar } from "../ui/GameTabBar";
import type { TrainingResult } from "../../game-services/trainingService";
import type {
  Boss,
  BossParty,
  BossSimulationResult,
  Character,
  Guild,
  GuildDepot,
  HuntArea,
  HuntAutoRepeatConfig,
  HuntPreparationResult,
  HuntSimulationResult,
  HuntSupplyPreset,
  PartyRole,
  Quest,
  TrainingTarget,
  TrainingType,
} from "../../shared/types";

type ExploreTab = "hunts" | "bosses" | "training" | "quests";

interface ExploreWindowProps {
  bestiary: Guild["bestiary"];
  bossParty: BossParty;
  bosses: Boss[];
  characters: Character[];
  character: Character;
  guild: Guild;
  guildDepot: GuildDepot;
  durationMinutes: number;
  hunts: HuntArea[];
  lastBossResult?: BossSimulationResult;
  lastPreparationResult?: HuntPreparationResult;
  lastQuestResult?: {
    success: boolean;
    died: boolean;
    accessUnlocked?: string;
    logs: string[];
  };
  lastResult?: {
    characterName: string;
    character: Character;
    hunt: HuntArea;
    result: HuntSimulationResult;
  };
  lastTrainingResult?: TrainingResult;
  quests: Quest[];
  presets: HuntSupplyPreset[];
  selectedBoss?: Boss;
  selectedHunt?: HuntArea;
  onCancelBoss: () => void;
  onChangeBossPartyRole: (characterId: string, role: PartyRole) => void;
  onChangeDuration: (durationMinutes: number) => void;
  onClearBossCooldown: (characterId: string, bossId: string) => void;
  onCreateRecommendedPreset: () => void;
  onDeleteHuntPreset: (presetId: string) => void;
  onFinishBoss: () => void;
  onFinishHunt: () => void;
  onFinishQuest: (quest: Quest) => void;
  onFinishTraining: () => void;
  onPrepareHunt: (preset: HuntSupplyPreset) => void;
  onSelectBoss: (boss: Boss) => void;
  onSelectHunt: (hunt: HuntArea) => void;
  onStartBoss: () => void;
  onStartHunt: (autoRepeat?: HuntAutoRepeatConfig) => void;
  onStartQuest: (quest: Quest) => void;
  onStartTraining: (
    targetSkill: TrainingTarget,
    trainingType: TrainingType,
    durationMinutes: number,
    cost: number,
  ) => void;
  onStopHuntAutoRepeat: () => void;
  onToggleBossPartyMember: (characterId: string) => void;
}

const tabs: Array<{ id: ExploreTab; label: string }> = [
  { id: "hunts", label: "Hunts" },
  { id: "bosses", label: "Bosses" },
  { id: "training", label: "Training" },
  { id: "quests", label: "Quests" },
];

export function ExploreWindow({
  bestiary,
  bossParty,
  bosses,
  characters,
  character,
  guild,
  guildDepot,
  durationMinutes,
  hunts,
  lastBossResult,
  lastPreparationResult,
  lastQuestResult,
  lastResult,
  lastTrainingResult,
  quests,
  presets,
  selectedBoss,
  selectedHunt,
  onCancelBoss,
  onChangeBossPartyRole,
  onChangeDuration,
  onClearBossCooldown,
  onCreateRecommendedPreset,
  onDeleteHuntPreset,
  onFinishBoss,
  onFinishHunt,
  onFinishQuest,
  onFinishTraining,
  onPrepareHunt,
  onSelectBoss,
  onSelectHunt,
  onStartBoss,
  onStartHunt,
  onStartQuest,
  onStartTraining,
  onStopHuntAutoRepeat,
  onToggleBossPartyMember,
}: ExploreWindowProps) {
  const [activeTab, setActiveTab] = useState<ExploreTab>("hunts");
  const [huntSearch, setHuntSearch] = useState("");
  const visibleHunts = hunts.filter((hunt) => {
    const search = huntSearch.trim().toLowerCase();
    if (!search) return true;
    return [
      hunt.name,
      hunt.city,
      hunt.risk,
      hunt.tags.join(" "),
      hunt.monsters.map((monster) => monster.name).join(" "),
    ].join(" ").toLowerCase().includes(search);
  });

  return (
    <div className="explore-window">
      <GameTabBar activeTab={activeTab} onChangeTab={setActiveTab} tabs={tabs} />

      {activeTab === "hunts" ? (
        <div className="explore-hunts-layout">
          <div className="explore-tools">
            <label>
              <span>Search hunt or creature</span>
              <input
                onChange={(event) => setHuntSearch(event.target.value)}
                placeholder="Search..."
                type="search"
                value={huntSearch}
              />
            </label>
          </div>
          <HuntActionPanel
            bestiary={bestiary}
            character={character}
            guild={guild}
            guildDepot={guildDepot}
            durationMinutes={durationMinutes}
            lastPreparationResult={lastPreparationResult}
            onChangeDuration={onChangeDuration}
            onCreateRecommendedPreset={onCreateRecommendedPreset}
            onDeletePreset={onDeleteHuntPreset}
            onFinishHunt={onFinishHunt}
            onPrepareHunt={onPrepareHunt}
            onStartHunt={onStartHunt}
            onStopAutoRepeat={onStopHuntAutoRepeat}
            presets={presets}
            selectedHunt={selectedHunt}
          />
          <HuntResultPanel
            character={lastResult?.character}
            characterName={lastResult?.characterName}
            hunt={lastResult?.hunt}
            result={lastResult?.result}
          />
          <HuntList
            character={character}
            hunts={visibleHunts}
            onSelectHunt={onSelectHunt}
            selectedHuntId={selectedHunt?.id}
          />
        </div>
      ) : null}

      {activeTab === "bosses" ? (
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
          selectedCharacter={character}
        />
      ) : null}

      {activeTab === "training" ? (
        <TrainingPanel
          character={character}
          lastResult={lastTrainingResult}
          onFinishTraining={onFinishTraining}
          onStartTraining={onStartTraining}
        />
      ) : null}

      {activeTab === "quests" ? (
        <QuestPanel
          character={character}
          lastResult={lastQuestResult}
          onFinishQuest={onFinishQuest}
          onStartQuest={onStartQuest}
          quests={quests}
        />
      ) : null}
    </div>
  );
}
