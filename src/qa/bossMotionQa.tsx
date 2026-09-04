import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BossScene } from "../components/boss-scene/BossScene";
import { createInitialGameState } from "../database/saveGameRepository";
import { bosses } from "../data/bosses";
import {
  getBossMotionPhase,
  getBossPartyMotionPhase,
  getBossPartyMotionVector,
} from "../game-engine/boss-scene/getBossMotionState";
import type { BossParty, Character, PartyRole } from "../shared/types";
import "../styles.css";

const checks: string[] = [];
const roles: PartyRole[] = ["tank", "damage", "damage", "support", "damage"];

function check(ok: unknown, label: string) {
  if (!ok) throw new Error(label);
  checks.push(label);
}

check(getBossMotionPhase({ cycleProgress: Number.NaN, ready: false, abilityState: "idle" }) === "guarding", "invalid boss progress normalizes");
check(getBossMotionPhase({ cycleProgress: 0.3, ready: false, abilityState: "idle" }) === "lunging", "boss lunges during attack");
check(getBossMotionPhase({ cycleProgress: 0.58, ready: false, abilityState: "idle" }) === "impacting", "boss reaches impact");
check(getBossMotionPhase({ cycleProgress: 0.8, ready: false, abilityState: "idle" }) === "recovering", "boss recovers after impact");
check(getBossMotionPhase({ cycleProgress: 0.2, ready: false, abilityState: "telegraphing", abilityProgressPercent: 40 }) === "preparing", "telegraph prepares boss");
check(getBossMotionPhase({ cycleProgress: 0.2, ready: false, abilityState: "telegraphing", abilityProgressPercent: 80 }) === "lunging", "late telegraph launches boss");
check(getBossMotionPhase({ cycleProgress: 0.2, ready: false, abilityState: "cooldown" }) === "recovering", "cooldown controls boss recovery");
check(getBossMotionPhase({ cycleProgress: 0.2, ready: true, abilityState: "idle" }) === "defeated", "resolved raid defeats boss");
check(getBossPartyMotionPhase({ cycleProgress: 0.1, ready: false, abilityState: "idle", memberIndex: 0, targeted: false, positioning: "mobile" }) === "advancing", "party advances");
check(getBossPartyMotionPhase({ cycleProgress: 0.3, ready: false, abilityState: "idle", memberIndex: 0, targeted: false, positioning: "mobile" }) === "striking", "party strikes");
check(getBossPartyMotionPhase({ cycleProgress: 0.58, ready: false, abilityState: "idle", memberIndex: 0, targeted: false, positioning: "mobile" }) === "recoiling", "party recoils");
check(getBossPartyMotionPhase({ cycleProgress: 0.72, ready: false, abilityState: "idle", memberIndex: 0, targeted: false, positioning: "mobile" }) === "recovering", "party recovers");
check(getBossPartyMotionPhase({ cycleProgress: 0.9, ready: false, abilityState: "idle", memberIndex: 0, targeted: false, positioning: "mobile" }) === "guarding", "party guards");
check(getBossPartyMotionPhase({ cycleProgress: 0.2, ready: false, abilityState: "telegraphing", memberIndex: 0, targeted: true, positioning: "mobile" }) === "dodging", "mobile target dodges telegraph");
check(getBossPartyMotionPhase({ cycleProgress: 0.2, ready: false, abilityState: "telegraphing", memberIndex: 0, targeted: true, positioning: "anchored" }) === "guarding", "anchored target holds ground");
check(getBossPartyMotionPhase({ cycleProgress: 0.2, ready: true, abilityState: "idle", memberIndex: 0, targeted: false, positioning: "mobile" }) === "victorious", "resolved party celebrates");
check(getBossPartyMotionPhase({ cycleProgress: 0.5, ready: false, abilityState: "idle", memberIndex: 1, targeted: false, positioning: "mobile" }) !== getBossPartyMotionPhase({ cycleProgress: 0.5, ready: false, abilityState: "idle", memberIndex: 0, targeted: false, positioning: "mobile" }), "member cycles are staggered");

for (let index = 0; index < 5; index += 1) {
  const vector = getBossPartyMotionVector(index);
  check(vector.x > 0 && Math.abs(vector.y) <= 1, `member ${index + 1} vector converges on boss`);
}

const boss = bosses.find((entry) => entry.requirements.maxPartySize === 5) ?? bosses[0];

function createBossFixture() {
  const characters = structuredClone(createInitialGameState().characters);
  const party: BossParty = {
    bossId: boss.id,
    members: characters.slice(0, 5).map((character, index) => ({ characterId: character.id, role: roles[index] })),
  };
  const now = Date.now();
  const action = {
    type: "bossing" as const,
    label: boss.name,
    startedAt: new Date(now - 45_000).toISOString(),
    endsAt: new Date(now + 255_000).toISOString(),
    durationMinutes: 5,
    targetId: boss.id,
    targetName: boss.name,
    risk: boss.risk,
    partyMemberIds: party.members.map((member) => member.characterId),
    partyMembers: party.members,
  };
  const activeCharacters = characters.map((character): Character => party.members.some((member) => member.characterId === character.id)
    ? { ...character, status: "bossing", currentAction: action }
    : character);
  return { characters: activeCharacters, party };
}

function BossMotionQa() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [fixture] = useState(createBossFixture);

  useEffect(() => {
    document.documentElement.dataset.clientMotion = reduceMotion ? "reduced" : "full";
    return () => { delete document.documentElement.dataset.clientMotion; };
  }, [reduceMotion]);

  return (
    <main className="boss-motion-qa">
      <header>
        <div><span className="eyebrow">Stage 171</span><h1>Boss Motion QA</h1><p>{checks.length}/{checks.length} deterministic checks passed. Memory-only fixture.</p></div>
        <label><input checked={reduceMotion} onChange={(event) => setReduceMotion(event.target.checked)} type="checkbox" /> Reduce motion</label>
      </header>
      <BossScene
        boss={boss}
        character={fixture.characters[0]}
        characters={fixture.characters}
        party={fixture.party}
        onAbortBoss={() => undefined}
        onBossManualReaction={() => undefined}
        onCollectBoss={() => undefined}
        onOpenAction={() => undefined}
      />
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<BossMotionQa />);
