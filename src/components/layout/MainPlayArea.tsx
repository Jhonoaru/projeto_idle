import { ActionSummaryCard } from "../action/ActionSummaryCard";
import { CurrentActionBox } from "../character/CurrentActionBox";
import { HuntScene } from "../hunt-scene/HuntScene";
import { Panel } from "../ui/Panel";
import { getGuildBriefing } from "../../game-engine/onboarding/getGuildBriefing";
import type {
  Character,
  Guild,
  HuntArea,
  HuntSimulationResult,
  OfflineCatchUpReport,
} from "../../shared/types";

interface MainPlayAreaProps {
  character: Character;
  guild: Guild;
  characters: Character[];
  hunts: HuntArea[];
  selectedHunt?: HuntArea;
  lastHuntResult?: {
    characterName: string;
    character: Character;
    hunt: HuntArea;
    result: HuntSimulationResult;
  };
  offlineReport?: OfflineCatchUpReport;
  onOpenAction: () => void;
  onOpenBlessings: () => void;
  onOpenExplore: () => void;
  onOpenInventory: () => void;
  onOpenQuickSell: () => void;
  onOpenQuests: () => void;
  onCollectHunt: () => void;
  onReturnToCity: () => void;
}

export function MainPlayArea({
  character,
  guild,
  characters,
  hunts,
  selectedHunt,
  lastHuntResult,
  offlineReport,
  onOpenAction,
  onOpenBlessings,
  onOpenExplore,
  onOpenInventory,
  onOpenQuickSell,
  onOpenQuests,
  onCollectHunt,
  onReturnToCity,
}: MainPlayAreaProps) {
  const activeCount = characters.filter((entry) => entry.status !== "idle").length;
  const completedOffline = offlineReport?.characterReports.filter(
    (report) => report.readyToResolve,
  ).length ?? 0;
  const actionHunt = character.currentAction?.type === "hunting"
    ? hunts.find((hunt) => hunt.id === character.currentAction?.targetId)
    : undefined;
  const nextObjective = getGuildBriefing(character, guild, selectedHunt);
  const openNextObjective = {
    action: onOpenAction,
    blessings: onOpenBlessings,
    hunts: onOpenExplore,
    market: onOpenQuickSell,
    quests: onOpenQuests,
  }[nextObjective.route];

  if (character.status === "hunting" && character.currentAction?.type === "hunting") {
    return (
      <div className="main-play-area">
        <HuntScene
          character={character}
          hunt={actionHunt}
          onCollectHunt={onCollectHunt}
          onOpenAction={onOpenAction}
          onReturnToCity={onReturnToCity}
        />
      </div>
    );
  }

  return (
    <div className="main-play-area">
      <section className="play-hero">
        <div>
          <span className="eyebrow">Guild client</span>
          <h2>{character.currentAction?.label ?? "Choose the next expedition"}</h2>
          <p>
            {character.currentAction?.targetName
              ? `${character.name} is assigned to ${character.currentAction.targetName}.`
              : `${character.name} is idle in ${character.city}. Pick a hunt, boss, quest, or training mode.`}
          </p>
        </div>
        <button
          aria-label="Open Explore game modes"
          className="explore-primary-button"
          onClick={onOpenExplore}
          type="button"
        >
          EXPLORAR
        </button>
      </section>

      <div className="play-grid">
        <Panel title="Next Objective">
          <div className="client-info-card">
            <strong>{nextObjective.title}</strong>
            <p>{nextObjective.description}</p>
            <button onClick={openNextObjective} type="button">
              {nextObjective.actionLabel}
            </button>
          </div>
        </Panel>

        <Panel title="Current Action">
          <CurrentActionBox character={character} />
          <ActionSummaryCard character={character} onViewAction={onOpenAction} />
        </Panel>

        <Panel title="Guild Summary">
          <div className="client-summary-grid">
            <div>
              <span>Guild Gold</span>
              <strong>{guild.gold.toLocaleString("en-US")}g</strong>
            </div>
            <div>
              <span>Renown</span>
              <strong>{guild.renown}</strong>
            </div>
            <div>
              <span>Roster Active</span>
              <strong>{activeCount}/{characters.length}</strong>
            </div>
            <div>
              <span>Selected Hunt</span>
              <strong>{selectedHunt?.name ?? "None"}</strong>
            </div>
          </div>
        </Panel>

        {offlineReport ? (
          <Panel title="Offline Report">
            <div className="client-info-card">
              <strong>{completedOffline} result(s) ready</strong>
              <p>Offline catch-up marked completed actions without collecting rewards.</p>
              <button onClick={onOpenAction} type="button">Open Action</button>
            </div>
          </Panel>
        ) : null}

        {lastHuntResult ? (
          <Panel title="Last Hunt Result">
            <div className="client-summary-grid">
              <div>
                <span>Hunt</span>
                <strong>{lastHuntResult.hunt.name}</strong>
              </div>
              <div>
                <span>XP</span>
                <strong>{lastHuntResult.result.experienceGained.toLocaleString("en-US")}</strong>
              </div>
              <div>
                <span>Net</span>
                <strong>{lastHuntResult.result.netProfit.toLocaleString("en-US")}g</strong>
              </div>
              <div>
                <span>Loot</span>
                <strong>{lastHuntResult.result.lootItems.length}</strong>
              </div>
            </div>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}
