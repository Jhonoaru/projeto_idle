import { useState } from "react";
import { getHuntSceneMonsters } from "../../game-engine/hunt-scene/getHuntSceneMonsters";
import { formatDuration } from "../../shared/time";
import type { Character, HuntArea } from "../../shared/types";
import { HuntActionBar } from "./HuntActionBar";
import { HuntCreatureCard } from "./HuntCreatureCard";
import { HuntSceneHotbar, type HuntSceneSlotType } from "./HuntSceneHotbar";
import { HuntSceneActor } from "./HuntSceneActor";
import { HuntSceneAnalyzer } from "./HuntSceneAnalyzer";
import { HuntSceneBackground } from "./HuntSceneBackground";
import { HuntSceneLog } from "./HuntSceneLog";
import { HuntSceneLootPreview } from "./HuntSceneLootPreview";
import { HuntSceneSlotWindow } from "./HuntSceneSlotWindow";
import { useHuntSceneSimulation } from "./useHuntSceneSimulation";

interface HuntSceneProps {
  character: Character;
  hunt?: HuntArea;
  onCollectHunt: () => void;
  onOpenAction: () => void;
  onReturnToCity: () => void;
}

export function HuntScene({
  character,
  hunt,
  onCollectHunt,
  onOpenAction,
  onReturnToCity,
}: HuntSceneProps) {
  const [openSlot, setOpenSlot] = useState<HuntSceneSlotType>();
  const [showSceneTools, setShowSceneTools] = useState(false);
  const action = character.currentAction;
  const monsters = getHuntSceneMonsters(hunt);
  const snapshot = useHuntSceneSimulation(character, action, hunt, monsters);
  const isReady = snapshot.readyToResolve || snapshot.remainingMs <= 0;
  const displayRemainingMs = isReady ? 0 : snapshot.remainingMs;
  const completedOffline = Boolean(action?.offlineCompletedAt);

  if (!action || action.type !== "hunting") {
    return null;
  }

  return (
    <section className={`hunt-scene ${isReady ? "is-ready" : "is-running"}`}>
      <HuntSceneBackground hunt={hunt} />

      <aside className="hunt-scene-side">
        <header className="hunt-scene-header">
          <div>
            <span className="eyebrow">Hunt Scene</span>
            <h2>{hunt?.name ?? action.targetName ?? "Unknown Hunt"}</h2>
            <p>
              {completedOffline
                ? "Completed while offline. Rewards are waiting for manual collection."
                : isReady
                  ? "Hunt completed. Collect through the real hunt flow."
                  : `${character.name} is hunting. Rewards are applied only on collect.`}
            </p>
          </div>
          <div className="hunt-scene-status">
            <span>{isReady ? "Ready" : "Running"}</span>
            <strong>{formatDuration(displayRemainingMs)}</strong>
          </div>
        </header>

        <div className="hunt-scene-actions">
          {isReady ? (
            <button className="is-primary" onClick={onCollectHunt} type="button">
              Coletar Resultado
            </button>
          ) : (
            <button className="is-danger" onClick={onReturnToCity} type="button">
              Finalizar Hunt
            </button>
          )}
          <button onClick={onOpenAction} type="button">
            Detalhes
          </button>
        </div>

        <HuntSceneAnalyzer
          character={character}
          elapsedMs={snapshot.elapsedMs}
          hunt={hunt}
          progress={snapshot.sceneProgress}
          remainingMs={displayRemainingMs}
          totalMs={snapshot.totalMs}
        />

        <div className="hunt-scene-side-tabs">
          <button disabled type="button">Loot Filter</button>
          <button type="button">Combat Log</button>
        </div>

        <HuntSceneLootPreview loot={snapshot.lootPreviewEvents} />
        <HuntSceneLog lines={snapshot.combatLogLines} />
      </aside>

      <div className="hunt-scene-main">
        <div
          className="hunt-scene-stage"
          aria-label="Combat area. Click to toggle scene tools."
          onClick={() => setShowSceneTools((current) => !current)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setShowSceneTools((current) => !current);
            }
          }}
        >
          <div className="hunt-stage-terrain" aria-hidden="true">
            <span className="terrain-patch terrain-patch-1" />
            <span className="terrain-patch terrain-patch-2" />
            <span className="terrain-patch terrain-patch-3" />
            <span className="terrain-bone" />
            <span className="terrain-ring" />
          </div>
          <div className="hunt-spawn-timer">
            <span>Next spawn</span>
            <div><i style={{ width: `${Math.round(snapshot.nextSpawnProgress * 100)}%` }} /></div>
            <strong>{snapshot.nextSpawnSeconds > 0 ? `${snapshot.nextSpawnSeconds}s` : "Now"}</strong>
          </div>
          {snapshot.visibleCreatures.map((creature) => (
            <HuntCreatureCard
              active={snapshot.activeTargetId === creature.id}
              creature={creature}
              key={creature.id}
            />
          ))}
          <HuntSceneActor character={character} actionText={snapshot.actionText} />
          <div className={`hunt-scene-center-tools ${showSceneTools ? "is-visible" : ""}`.trim()}>
            <button disabled type="button">Loot Filter</button>
            <button type="button" onClick={(event) => event.stopPropagation()}>Combat Log</button>
            <button disabled type="button">Posicionamento</button>
          </div>
        </div>

        <HuntActionBar label={snapshot.actionText} progress={snapshot.attackProgress} />
        <HuntSceneHotbar
          character={character}
          hunt={hunt}
          onSelectSlot={(slot) => setOpenSlot(slot)}
          selectedSlot={openSlot}
        />

        <div className="hunt-scene-progress">
          <span>Hunt Progress</span>
          <div>
            <i style={{ width: `${Math.round(snapshot.sceneProgress * 100)}%` }} />
          </div>
          <strong>{Math.round(snapshot.sceneProgress * 100)}%</strong>
        </div>

        {openSlot ? (
          <HuntSceneSlotWindow
            character={character}
            onClose={() => setOpenSlot(undefined)}
            slot={openSlot}
          />
        ) : null}
      </div>
    </section>
  );
}
