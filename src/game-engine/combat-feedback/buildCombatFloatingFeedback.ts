import type { Character, PartyRole } from "../../shared/types";

export type CombatFloatingFeedbackKind = "damage" | "critical" | "healing" | "incoming";

export interface CombatFloatingFeedbackEvent {
  id: string;
  actorId: string;
  kind: CombatFloatingFeedbackKind;
  value: number;
  x: number;
  y: number;
  delayMs: number;
}

export interface CombatFloatingFeedbackActor {
  character: Character;
  role?: PartyRole;
}

interface CombatFloatingFeedbackOptions {
  actors: CombatFloatingFeedbackActor[];
  elapsedMs: number;
  mode: "hunt" | "boss";
  resolved: boolean;
  target: { x: number; y: number };
}

const bossOrigins = [
  { x: 31, y: 53 },
  { x: 22, y: 40 },
  { x: 22, y: 68 },
  { x: 39, y: 40 },
  { x: 39, y: 68 },
];

export function buildCombatFloatingFeedback(options: CombatFloatingFeedbackOptions): CombatFloatingFeedbackEvent[] {
  if (options.resolved || options.actors.length === 0) return [];
  const elapsedMs = normalizeElapsed(options.elapsedMs);
  const intervalMs = options.mode === "boss" ? 2_200 : 1_800;
  const sequence = Math.floor(elapsedMs / intervalMs);
  const actorIndex = sequence % options.actors.length;
  const actor = options.actors[actorIndex];
  const origin = getActorOrigin(options.mode, actorIndex);
  const critical = isCriticalSequence(actor.character, sequence);
  const events: CombatFloatingFeedbackEvent[] = [{
    id: `${sequence}-${actor.character.id}-outgoing`,
    actorId: actor.character.id,
    kind: critical ? "critical" : "damage",
    value: getOutgoingValue(actor.character, sequence, critical),
    x: clampPercent(options.target.x + deterministicJitter(actor.character.id, sequence, 0)),
    y: clampPercent(options.target.y - 7 + deterministicJitter(actor.character.id, sequence, 1)),
    delayMs: 0,
  }];

  if (sequence % 2 === 1) {
    events.push({
      id: `${sequence}-${actor.character.id}-incoming`,
      actorId: actor.character.id,
      kind: "incoming",
      value: getIncomingValue(actor.character, sequence),
      x: clampPercent(origin.x - 3),
      y: clampPercent(origin.y - 8),
      delayMs: 240,
    });
  }

  const healerIndex = options.actors.findIndex(isHealingActor);
  if (healerIndex >= 0 && sequence % 3 === 0) {
    const healer = options.actors[healerIndex];
    const healingTargetIndex = (sequence + 1) % options.actors.length;
    const healingTarget = options.actors[healingTargetIndex];
    const healingOrigin = getActorOrigin(options.mode, healingTargetIndex);
    events.push({
      id: `${sequence}-${healer.character.id}-${healingTarget.character.id}-healing`,
      actorId: healingTarget.character.id,
      kind: "healing",
      value: getHealingValue(healer.character, sequence),
      x: clampPercent(healingOrigin.x + 3),
      y: clampPercent(healingOrigin.y - 10),
      delayMs: 420,
    });
  }

  return events;
}

function getOutgoingValue(character: Character, sequence: number, critical: boolean) {
  const variance = 0.82 + (stableHash(`${character.id}:${sequence}:damage`) % 29) / 100;
  const normal = Math.max(1, Math.round(character.attributes.attackPower * variance + character.level * 0.65));
  const criticalMultiplier = 1 + Math.max(25, character.attributes.critDamagePercent ?? 50) / 100;
  return critical ? Math.round(normal * criticalMultiplier) : normal;
}

function getIncomingValue(character: Character, sequence: number) {
  const percent = 2 + stableHash(`${character.id}:${sequence}:incoming`) % 4;
  return Math.max(1, Math.round(character.attributes.maxHealth * percent / 100));
}

function getHealingValue(character: Character, sequence: number) {
  const variance = 0.9 + (stableHash(`${character.id}:${sequence}:healing`) % 21) / 100;
  return Math.max(1, Math.round((character.attributes.maxHealth * 0.035 + character.attributes.maxMana * 0.02 + character.level) * variance));
}

function isCriticalSequence(character: Character, sequence: number) {
  const cadence = Math.max(3, Math.round(100 / Math.max(5, character.attributes.critChancePercent ?? 8)));
  return (sequence + stableHash(character.id)) % cadence === 0;
}

function isHealingActor(actor: CombatFloatingFeedbackActor) {
  return actor.role === "healer" || actor.role === "support" || actor.character.vocation === "Warden";
}

function getActorOrigin(mode: "hunt" | "boss", index: number) {
  return mode === "hunt" ? { x: 50, y: 50 } : bossOrigins[index] ?? bossOrigins[0];
}

function deterministicJitter(id: string, sequence: number, axis: number) {
  return (stableHash(`${id}:${sequence}:${axis}`) % 9) - 4;
}

function stableHash(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  return hash;
}

function normalizeElapsed(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function clampPercent(value: number) {
  return Math.min(96, Math.max(4, Number.isFinite(value) ? value : 50));
}
