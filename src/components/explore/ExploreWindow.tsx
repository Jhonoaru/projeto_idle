import { useState } from "react";
import { BossPanel } from "../boss/BossPanel";
import { HuntActionPanel } from "../hunt/HuntActionPanel";
import { HuntResultPanel } from "../hunt/HuntResultPanel";
import { QuestPanel } from "../quest/QuestPanel";
import { TrainingPanel } from "../training/TrainingPanel";
import { getAccessName } from "../../data/accesses";
import { getQuestAvailability } from "../../game-engine/quest/getQuestAvailability";
import type { TrainingResult } from "../../game-services/trainingService";
import type {
  Boss,
  BossStatus,
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
  QuestStatus,
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
  onOpenInventory: () => void;
  onOpenQuickSell: () => void;
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

const tabs: Array<{ id: ExploreTab; label: string; icon: string }> = [
  { id: "hunts", label: "Hunts", icon: "MAP" },
  { id: "bosses", label: "Bosses", icon: "BOS" },
  { id: "training", label: "Training", icon: "TRN" },
  { id: "quests", label: "Quests", icon: "QST" },
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
  onOpenInventory,
  onOpenQuickSell,
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
  const [questSearch, setQuestSearch] = useState("");
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
  const visibleQuests = quests.filter((quest) => {
    const search = questSearch.trim().toLowerCase();
    if (!search) return true;
    return [
      quest.name,
      quest.city,
      quest.type,
      quest.risk,
      quest.tags.join(" "),
      quest.unlocksAccess ? getAccessName(quest.unlocksAccess) : "",
    ].join(" ").toLowerCase().includes(search);
  });
  const questAvailability = getQuestAvailability(character, visibleQuests);

  return (
    <div className="explore-window">
      <header className="explore-mode-header">
        <span>Modos de jogo</span>
        <div className="explore-mode-tabs" aria-label="Explore modes">
          {tabs.map((tab) => (
            <button
              className={activeTab === tab.id ? "is-selected" : ""}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              <i aria-hidden="true">{tab.icon}</i>
              <strong>{tab.label}</strong>
            </button>
          ))}
        </div>
      </header>

      {activeTab === "hunts" ? (
        <div className="explore-mode-panel">
          <ExploreSummary
            countLabel={`${visibleHunts.length} hunts`}
            detail={`${character.name} / Lv ${character.level} / ${character.city}`}
            title="Hunt board"
          />
          <div className="explore-card-grid hunt-board-grid">
            {visibleHunts.map((hunt) => (
              <ExploreHuntCard
                character={character}
                hunt={hunt}
                isSelected={hunt.id === selectedHunt?.id}
                key={hunt.id}
                onSelect={() => onSelectHunt(hunt)}
              />
            ))}
          </div>
          <ExploreBoardFooter
            countLabel={`${visibleHunts.length} hunts`}
            onSearch={setHuntSearch}
            placeholder="Hunt ou criatura"
            search={huntSearch}
          />
          <div className="explore-detail-dock">
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
            onOpenInventory={onOpenInventory}
            onOpenQuickSell={onOpenQuickSell}
            result={lastResult?.result}
          />
          </div>
        </div>
      ) : null}

      {activeTab === "bosses" ? (
        <div className="explore-mode-panel">
          <ExploreSummary
            countLabel={`${bosses.length} contracts`}
            detail="Choose a contract, assemble a party, then resolve the simulated boss action."
            title="Boss contracts"
          />
          <div className="explore-card-grid boss-board-grid">
            {bosses.map((boss) => (
              <ExploreBossCard
                boss={boss}
                character={character}
                isSelected={boss.id === selectedBoss?.id}
                key={boss.id}
                onSelect={() => onSelectBoss(boss)}
              />
            ))}
          </div>
          <div className="explore-detail-dock">
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
          </div>
        </div>
      ) : null}

      {activeTab === "training" ? (
        <div className="explore-mode-panel training-board">
          <ExploreSummary
            countLabel="7 skills"
            detail="Offline, exercise and dummy training use the existing local training engine."
            title="Training hall"
          />
          <TrainingPanel
            character={character}
            lastResult={lastTrainingResult}
            onFinishTraining={onFinishTraining}
            onStartTraining={onStartTraining}
          />
        </div>
      ) : null}

      {activeTab === "quests" ? (
        <div className="explore-mode-panel">
          <ExploreSummary
            countLabel={`${visibleQuests.length} quests`}
            detail="Access quests unlock local routes, bosses and region progression."
            title="Quest ledger"
          />
          <div className="explore-card-grid quest-board-grid">
            {questAvailability.map(({ quest, status }) => (
              <ExploreQuestCard
                isCurrent={character.currentAction?.targetId === quest.id}
                key={quest.id}
                onSelect={() => onStartQuest(quest)}
                quest={quest}
                status={status}
              />
            ))}
          </div>
          <ExploreBoardFooter
            countLabel={`${visibleQuests.length} quests`}
            onSearch={setQuestSearch}
            placeholder="Buscar quest"
            search={questSearch}
          />
          <div className="explore-detail-dock">
            <QuestPanel
              character={character}
              lastResult={lastQuestResult}
              onFinishQuest={onFinishQuest}
              onStartQuest={onStartQuest}
              quests={visibleQuests}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ExploreSummary({
  countLabel,
  detail,
  title,
}: {
  countLabel: string;
  detail: string;
  title: string;
}) {
  return (
    <section className="explore-board-summary">
      <div>
        <span>{title}</span>
        <strong>{countLabel}</strong>
      </div>
      <p>{detail}</p>
    </section>
  );
}

function ExploreBoardFooter({
  countLabel,
  onSearch,
  placeholder,
  search,
}: {
  countLabel: string;
  onSearch: (value: string) => void;
  placeholder: string;
  search: string;
}) {
  return (
    <footer className="explore-board-footer">
      <strong>{countLabel}</strong>
      <div className="explore-board-pager" aria-label="Pagination preview">
        <button disabled type="button">‹</button>
        <span>1 / 1</span>
        <button disabled type="button">›</button>
      </div>
      <label>
        <span>Search</span>
        <input
          onChange={(event) => onSearch(event.target.value)}
          placeholder={placeholder}
          type="search"
          value={search}
        />
      </label>
    </footer>
  );
}

function ExploreHuntCard({
  character,
  hunt,
  isSelected,
  onSelect,
}: {
  character: Character;
  hunt: HuntArea;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const hasLevel = character.level >= hunt.minLevel;
  const hasAccess = !hunt.requiredAccess || character.accessIds.includes(hunt.requiredAccess);
  const locked = !hasLevel || !hasAccess;
  const monsterToken = hunt.monsters[0]?.name.slice(0, 2).toUpperCase() ?? "H";

  return (
    <button
      className={`explore-board-card hunt-board-card ${isSelected ? "is-selected" : ""} ${locked ? "is-locked" : ""}`.trim()}
      onClick={onSelect}
      type="button"
    >
      {hunt.requiredAccess ? <em className="access-ribbon">Access</em> : null}
      <span className="explore-card-title">{hunt.name}</span>
      <i className={`explore-card-token risk-token-${hunt.risk}`} aria-hidden="true">{monsterToken}</i>
      <strong>Level {hunt.recommendedLevel} · Min. {hunt.minLevel}</strong>
      <small>{hunt.city} / {hunt.risk}</small>
      <p>{locked ? getHuntLockText(character, hunt, hasLevel, hasAccess) : hunt.monsters.map((monster) => monster.name).join(", ")}</p>
    </button>
  );
}

function ExploreBossCard({
  boss,
  character,
  isSelected,
  onSelect,
}: {
  boss: Boss;
  character: Character;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const status = getBossStatus(character, boss);

  return (
    <button
      className={`explore-board-card boss-board-card ${isSelected ? "is-selected" : ""} boss-${status}`.trim()}
      onClick={onSelect}
      type="button"
    >
      <em className="access-ribbon">Boss</em>
      <span className="explore-card-title">{boss.name}</span>
      <i className={`explore-card-token risk-token-${boss.risk}`} aria-hidden="true">B</i>
      <strong>Level recom. {boss.requirements.requiredLevel}</strong>
      <small>{boss.type} / {boss.risk}</small>
      <p>{status === "locked" ? getBossLockText(character, boss) : `${boss.durationMinutes} min · ${boss.cooldownHours}h cooldown`}</p>
    </button>
  );
}

function ExploreQuestCard({
  isCurrent,
  onSelect,
  quest,
  status,
}: {
  isCurrent: boolean;
  onSelect: () => void;
  quest: Quest;
  status: QuestStatus;
}) {
  const access = quest.unlocksAccess ? getAccessName(quest.unlocksAccess) : "Story";

  return (
    <button
      className={`explore-board-card quest-board-card quest-${status} ${isCurrent ? "is-selected" : ""}`.trim()}
      disabled={status !== "available"}
      onClick={onSelect}
      type="button"
    >
      {quest.unlocksAccess ? <em className="access-ribbon">Access</em> : null}
      <span className="explore-card-title">{quest.name}</span>
      <i className={`explore-card-token risk-token-${quest.risk}`} aria-hidden="true">Q</i>
      <strong>Level {quest.requiredLevel}+ · {quest.type}</strong>
      <small>{quest.city} / {quest.risk}</small>
      <p>{status === "locked" ? "Bloqueada" : access}</p>
    </button>
  );
}

function getHuntLockText(character: Character, hunt: HuntArea, hasLevel: boolean, hasAccess: boolean) {
  if (!hasLevel) return `Requer level ${hunt.minLevel}; ${character.name} esta no ${character.level}.`;
  if (!hasAccess) return `Requer ${getAccessName(hunt.requiredAccess)}.`;
  return "Bloqueada";
}

function getBossStatus(character: Character, boss: Boss): BossStatus {
  if (character.status === "bossing" && character.currentAction?.targetId === boss.id) return "in_progress";
  if (character.level < boss.requirements.requiredLevel) return "locked";
  const missingAccess = boss.requirements.requiredAccessIds?.some(
    (accessId) => !character.accessIds.includes(accessId),
  );
  if (missingAccess) return "locked";
  return "available";
}

function getBossLockText(character: Character, boss: Boss) {
  if (character.level < boss.requirements.requiredLevel) return `Requer level ${boss.requirements.requiredLevel}.`;
  const missingAccess = boss.requirements.requiredAccessIds?.find(
    (accessId) => !character.accessIds.includes(accessId),
  );
  if (missingAccess) return `Requer ${getAccessName(missingAccess)}.`;
  return "Requisitos pendentes.";
}
