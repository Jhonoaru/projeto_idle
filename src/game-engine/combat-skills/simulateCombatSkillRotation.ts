import { combatSkills } from "../../data/combatSkills";
import type { Character, CharacterAction, CombatSkillRotationSummary } from "../../shared/types";
import { normalizeCombatSkillLoadout } from "./normalizeCombatSkillLoadout";

const GLOBAL_COOLDOWN_MS = 1_500;
const MAX_SIMULATION_MS = 8 * 60 * 60_000;
const MAX_TIMELINE_EVENTS = 24;

export function simulateCombatSkillRotation(
  character: Character,
  action: CharacterAction | undefined,
  elapsedMs: number,
): CombatSkillRotationSummary {
  const loadout = normalizeCombatSkillLoadout({
    vocation: character.vocation,
    level: character.level,
    combatSkillLoadout: action?.combatSkillLoadout ?? character.combatSkillLoadout,
  });
  const attacks = loadout.attackSkillIds
    .map((id) => combatSkills.find((skill) => skill.id === id))
    .filter((skill): skill is (typeof combatSkills)[number] => Boolean(skill));
  const support = combatSkills.find((skill) => skill.id === loadout.supportSkillId);
  const allSkills = support ? [...attacks, support] : attacks;
  const duration = Math.min(MAX_SIMULATION_MS, Math.max(0, Number.isFinite(elapsedMs) ? elapsedMs : 0));
  const counts = new Map<string, number>();
  const nextAvailable = new Map<string, number>();
  const manaMax = Math.max(0, Math.floor(character.attributes.maxMana));
  const manaRegenPerMs = Math.max(1, manaMax * 0.02) / 1_000;
  let mana = manaMax;
  let time = 0;
  let lastManaUpdate = 0;
  let attackIndex = 0;
  let supportAvailable = support ? 0 : Number.POSITIVE_INFINITY;
  let activeSkillId: string | undefined;
  let iterations = 0;
  let totalEvents = 0;
  let lastEvent: CombatSkillRotationSummary["timeline"]["events"][number] | undefined;
  const firstEventsBySkill = new Map<string, CombatSkillRotationSummary["timeline"]["events"][number]>();
  const temporalBucketCount = Math.max(1, MAX_TIMELINE_EVENTS - allSkills.length - 1);
  const sampledEvents = new Map<number, {
    event: CombatSkillRotationSummary["timeline"]["events"][number];
    distance: number;
  }>();

  while (attacks.length > 0 && time <= duration && iterations < 20_000) {
    iterations += 1;
    const attack = attacks[attackIndex % attacks.length];
    const attackAvailable = nextAvailable.get(attack.id) ?? 0;
    const supportManaAtAvailability = support
      ? Math.min(manaMax, mana + Math.max(0, supportAvailable - lastManaUpdate) * manaRegenPerMs)
      : 0;
    const useSupport = Boolean(
      support
      && supportAvailable <= attackAvailable
      && supportManaAtAvailability >= support.manaCost,
    );
    const skill = useSupport ? support! : attack;
    const availableAt = useSupport ? supportAvailable : attackAvailable;
    time = Math.max(time, availableAt);
    mana = Math.min(manaMax, mana + Math.max(0, time - lastManaUpdate) * manaRegenPerMs);
    lastManaUpdate = time;
    if (mana < skill.manaCost) {
      const waitMs = (skill.manaCost - mana) / manaRegenPerMs;
      time += waitMs;
      mana = Math.min(manaMax, mana + waitMs * manaRegenPerMs);
      lastManaUpdate = time;
    }
    if (time > duration) break;

    mana = Math.max(0, mana - skill.manaCost);
    const skillCastIndex = (counts.get(skill.id) ?? 0) + 1;
    counts.set(skill.id, skillCastIndex);
    totalEvents += 1;
    const timelineEvent = {
      sequence: totalEvents,
      skillCastIndex,
      occurredAtMs: Math.max(0, Math.round(time)),
      skillId: skill.id,
      manaCost: skill.manaCost,
    };
    if (!firstEventsBySkill.has(skill.id)) firstEventsBySkill.set(skill.id, timelineEvent);
    const sample = getTimelineSample(time, duration, temporalBucketCount);
    const existingSample = sampledEvents.get(sample.bucket);
    if (!existingSample || sample.distance < existingSample.distance) {
      sampledEvents.set(sample.bucket, { event: timelineEvent, distance: sample.distance });
    }
    lastEvent = timelineEvent;
    nextAvailable.set(skill.id, time + skill.cooldownSeconds * 1_000);
    activeSkillId = skill.id;
    if (useSupport) supportAvailable = time + skill.cooldownSeconds * 1_000;
    else attackIndex = (attackIndex + 1) % attacks.length;
    time += GLOBAL_COOLDOWN_MS;
  }

  const cooldownRemainingMs = Object.fromEntries(allSkills.map((skill) => [
    skill.id,
    Math.max(0, Math.ceil((nextAvailable.get(skill.id) ?? 0) - duration)),
  ]));
  const casts = allSkills.map((skill) => ({ skillId: skill.id, casts: counts.get(skill.id) ?? 0 }));
  const manaSpent = casts.reduce((sum, cast) => {
    const skill = allSkills.find((entry) => entry.id === cast.skillId);
    return sum + cast.casts * (skill?.manaCost ?? 0);
  }, 0);
  const timelineEvents = [
    ...firstEventsBySkill.values(),
    ...[...sampledEvents.values()].map((sample) => sample.event),
    ...(lastEvent ? [lastEvent] : []),
  ]
    .filter((event, index, events) => events.findIndex((candidate) => candidate.sequence === event.sequence) === index)
    .sort((left, right) => left.sequence - right.sequence)
    .slice(0, MAX_TIMELINE_EVENTS);

  return {
    casts,
    totalCasts: casts.reduce((sum, cast) => sum + cast.casts, 0),
    manaSpent,
    remainingMana: Math.round(mana),
    activeSkillId,
    nextCastInMs: Math.max(0, Math.ceil(time - duration)),
    cooldownRemainingMs,
    timeline: {
      durationMs: duration,
      totalEvents,
      omittedEvents: Math.max(0, totalEvents - timelineEvents.length),
      events: timelineEvents,
    },
  };
}

export function formatCombatSkillRotationLog(character: Character, action: CharacterAction | undefined, elapsedMs: number) {
  const summary = simulateCombatSkillRotation(character, action, elapsedMs);
  return `Skill rotation: ${summary.totalCasts} casts, ${summary.manaSpent} mana cycled.`;
}

function getTimelineSample(timeMs: number, durationMs: number, bucketCount: number) {
  if (durationMs <= 0) return { bucket: 0, distance: 0 };
  const progress = Math.min(1, Math.max(0, timeMs / durationMs));
  const bucket = Math.min(bucketCount - 1, Math.floor(progress * bucketCount));
  const center = (bucket + 0.5) / bucketCount;
  return { bucket, distance: Math.abs(progress - center) };
}
