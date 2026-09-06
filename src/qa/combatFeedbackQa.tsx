import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { BossScene } from "../components/boss-scene/BossScene";
import { HuntScene } from "../components/hunt-scene/HuntScene";
import { createInitialGameState } from "../database/saveGameRepository";
import { bosses } from "../data/bosses";
import { hunts } from "../data/hunts";
import { buildCombatFloatingFeedback } from "../game-engine/combat-feedback/buildCombatFloatingFeedback";
import type { BossParty, Character, PartyRole } from "../shared/types";
import "../styles.css";

type QaMode = "hunt" | "boss";
const checks: string[] = [];
const noOp = () => undefined;
const roles: PartyRole[] = ["tank", "damage", "damage", "healer", "support"];
const boss = bosses.find((entry) => entry.id === "boss-ember-matriarch")!;

function check(ok: unknown, label: string) {
  if (!ok) throw new Error(label);
  checks.push(label);
}

const baseCharacters = structuredClone(createInitialGameState().characters);
const actors = baseCharacters.map((character, index) => ({ character, role: roles[index] }));
const options = { actors, elapsedMs: 6_600, mode: "boss" as const, resolved: false, target: { x: 76, y: 43 } };
const events = buildCombatFloatingFeedback(options);
check(buildCombatFloatingFeedback({ ...options, resolved: true }).length === 0, "resolved scene has no floating events");
check(buildCombatFloatingFeedback({ ...options, actors: [] }).length === 0, "empty party has no floating events");
check(JSON.stringify(events) === JSON.stringify(buildCombatFloatingFeedback(options)), "same inputs produce identical events");
check(events.length >= 2, "boss cadence produces layered feedback");
check(events.every((event) => Number.isInteger(event.value) && event.value > 0), "all feedback values are positive integers");
check(events.every((event) => event.x >= 4 && event.x <= 96 && event.y >= 4 && event.y <= 96), "all feedback remains inside arena bounds");
check(new Set(events.map((event) => event.id)).size === events.length, "event identities are unique");
check(events.some((event) => event.kind === "healing"), "healer cadence emits healing feedback");
check(buildCombatFloatingFeedback({ ...options, actors: actors.slice(0, 3), elapsedMs: 0 }).every((event) => event.kind !== "healing"), "party without support emits no healing");
check(buildCombatFloatingFeedback({ ...options, elapsedMs: 2_200 }).some((event) => event.kind === "incoming"), "odd cadence emits incoming damage");
check(buildCombatFloatingFeedback({ ...options, elapsedMs: 0 }).every((event) => event.kind !== "incoming"), "opening cadence avoids incoming damage");
check(buildCombatFloatingFeedback({ ...options, elapsedMs: 2_200 })[0]?.actorId === actors[1].character.id, "boss cadence rotates the active actor");
check(JSON.stringify(buildCombatFloatingFeedback({ ...options, elapsedMs: Number.NaN })) === JSON.stringify(buildCombatFloatingFeedback({ ...options, elapsedMs: 0 })), "invalid elapsed time normalizes safely");
check(Array.from({ length: 30 }).some((_, sequence) => buildCombatFloatingFeedback({ ...options, elapsedMs: sequence * 2_200 })[0]?.kind === "critical"), "deterministic cadence includes critical feedback");

function createFixture() {
  const now = Date.now();
  const characters = structuredClone(baseCharacters);
  const party: BossParty = { bossId: boss.id, members: characters.map((character, index) => ({ characterId: character.id, role: roles[index] })) };
  const bossAction = {
    type: "bossing" as const,
    label: boss.name,
    startedAt: new Date(now - 6_600).toISOString(),
    endsAt: new Date(now + 293_400).toISOString(),
    durationMinutes: 5,
    targetId: boss.id,
    targetName: boss.name,
    risk: boss.risk,
    partyMemberIds: party.members.map((member) => member.characterId),
    partyMembers: party.members,
  };
  const bossCharacters = characters.map((character): Character => ({ ...character, status: "bossing", currentAction: bossAction }));
  const huntCharacter: Character = {
    ...characters.find((character) => character.vocation === "Warden")!,
    status: "hunting",
    currentAction: {
      type: "hunting",
      label: hunts[0].name,
      startedAt: new Date(now - 6_000).toISOString(),
      endsAt: new Date(now + 294_000).toISOString(),
      durationMinutes: 5,
      targetId: hunts[0].id,
      targetName: hunts[0].name,
      risk: hunts[0].risk,
    },
  };
  return { bossCharacters, huntCharacter, party };
}

function CombatFeedbackQa() {
  const [mode, setMode] = useState<QaMode>("hunt");
  const [completed, setCompleted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [fixture] = useState(createFixture);

  useEffect(() => {
    document.documentElement.dataset.clientMotion = reduceMotion ? "reduced" : "full";
    return () => { delete document.documentElement.dataset.clientMotion; };
  }, [reduceMotion]);

  const huntCharacter = useMemo(() => completed ? completeCharacter(fixture.huntCharacter) : fixture.huntCharacter, [completed, fixture]);
  const bossCharacters = useMemo(() => completed ? fixture.bossCharacters.map(completeCharacter) : fixture.bossCharacters, [completed, fixture]);

  return (
    <main className="combat-feedback-qa">
      <header>
        <div><span className="eyebrow">Stage 172</span><h1>Combat Feedback QA</h1><p>{checks.length}/{checks.length} deterministic checks passed. Memory-only fixture.</p></div>
        <div className="combat-feedback-qa-controls">
          <button className={mode === "hunt" ? "is-active" : ""} onClick={() => setMode("hunt")} type="button">Hunt</button>
          <button className={mode === "boss" ? "is-active" : ""} onClick={() => setMode("boss")} type="button">Boss</button>
          <button className={!completed ? "is-active" : ""} onClick={() => setCompleted(false)} type="button">Active</button>
          <button className={completed ? "is-active" : ""} onClick={() => setCompleted(true)} type="button">Completed</button>
          <label><input checked={reduceMotion} onChange={(event) => setReduceMotion(event.target.checked)} type="checkbox" /> Reduce motion</label>
        </div>
      </header>
      {mode === "hunt" ? (
        <HuntScene character={huntCharacter} hunt={hunts[0]} onChangeBossDodgeBehavior={noOp} onChangeDefensiveResponsePriority={noOp} onCollectHunt={noOp} onOpenAction={noOp} onReturnToCity={noOp} onToggleCombatSkill={noOp} />
      ) : (
        <BossScene boss={boss} character={bossCharacters[0]} characters={bossCharacters} party={fixture.party} onAbortBoss={noOp} onBossManualReaction={noOp} onCollectBoss={noOp} onOpenAction={noOp} />
      )}
    </main>
  );
}

function completeCharacter(character: Character): Character {
  return {
    ...character,
    currentAction: character.currentAction ? { ...character.currentAction, endsAt: "2026-09-06T12:00:00.000Z", offlineCompletedAt: "2026-09-06T12:00:00.000Z", readyToResolve: true } : undefined,
  };
}

createRoot(document.getElementById("root")!).render(<CombatFeedbackQa />);
