import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { HuntScene } from "../components/hunt-scene/HuntScene";
import { createInitialGameState } from "../database/saveGameRepository";
import { hunts } from "../data/hunts";
import {
  getHuntActorMotionPhase,
  getHuntCreatureMotionPhase,
  getHuntMotionVector,
} from "../game-engine/hunt-scene/getHuntMotionState";
import type { Character } from "../shared/types";
import "../styles.css";

const positions = ["top-left", "top-right", "left", "right", "bottom-left", "bottom-right"];
const checks: string[] = [];

function check(ok: unknown, label: string) {
  if (!ok) throw new Error(label);
  checks.push(label);
}

check(getHuntActorMotionPhase(Number.NaN, false) === "windup", "invalid progress normalizes");
check(getHuntActorMotionPhase(0.16, false) === "striking", "actor enters strike");
check(getHuntActorMotionPhase(0.62, false) === "recoiling", "actor enters recoil");
check(getHuntActorMotionPhase(0.75, false) === "recovering", "actor enters recovery");
check(getHuntActorMotionPhase(0, true) === "resolved", "resolved action stays still");
check(getHuntCreatureMotionPhase("spawning", true, 0.5) === "spawning", "spawn overrides combat phase");
check(getHuntCreatureMotionPhase("defeated", true, 0.5) === "defeated", "defeat overrides combat phase");
check(getHuntCreatureMotionPhase("alive", false, 0.5) === "guarding", "idle creature guards");
check(getHuntCreatureMotionPhase("damaged", false, 0.5) === "staggered", "damaged creature reacts");
check(getHuntCreatureMotionPhase("alive", true, 0.1) === "advancing", "target advances during windup");
check(getHuntCreatureMotionPhase("alive", true, 0.3) === "staggered", "target reacts during strike");
check(getHuntCreatureMotionPhase("alive", true, 0.7) === "striking", "target counters during recoil");
check(getHuntCreatureMotionPhase("alive", true, 0.9) === "guarding", "target guards during recovery");

for (const position of positions) {
  const creature = getHuntMotionVector(position, "creature");
  const actor = getHuntMotionVector(position, "actor");
  check(creature.x === -actor.x && creature.y === -actor.y, `${position} vectors converge`);
}

function createHuntingCharacter(): Character {
  const character = structuredClone(createInitialGameState().characters[0]);
  const now = Date.now();
  character.status = "hunting";
  character.currentAction = {
    type: "hunting",
    label: "Hunting Sewers Below Thaeron",
    startedAt: new Date(now - 30_000).toISOString(),
    endsAt: new Date(now + 270_000).toISOString(),
    durationMinutes: 5,
    targetId: hunts[0].id,
    targetName: hunts[0].name,
    risk: hunts[0].risk,
  };
  return character;
}

function HuntMotionQa() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [character] = useState(createHuntingCharacter);

  useEffect(() => {
    document.documentElement.dataset.clientMotion = reduceMotion ? "reduced" : "full";
    return () => { delete document.documentElement.dataset.clientMotion; };
  }, [reduceMotion]);

  return (
    <main className="hunt-motion-qa">
      <header>
        <div>
          <span className="eyebrow">Stage 170</span>
          <h1>Hunt Motion QA</h1>
          <p>{checks.length}/{checks.length} deterministic checks passed. Memory-only fixture.</p>
        </div>
        <label>
          <input checked={reduceMotion} onChange={(event) => setReduceMotion(event.target.checked)} type="checkbox" />
          Reduce motion
        </label>
      </header>
      <section className="hunt-motion-contract" aria-label="Motion phase contract">
        {(["windup", "striking", "recoiling", "recovering", "resolved"] as const).map((phase) => (
          <span data-phase={phase} key={phase}>{phase}</span>
        ))}
      </section>
      <HuntScene
        character={character}
        hunt={hunts[0]}
        onChangeBossDodgeBehavior={() => undefined}
        onChangeDefensiveResponsePriority={() => undefined}
        onCollectHunt={() => undefined}
        onOpenAction={() => undefined}
        onReturnToCity={() => undefined}
        onToggleCombatSkill={() => undefined}
      />
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<HuntMotionQa />);
