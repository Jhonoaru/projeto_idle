import type { BossManualReaction, BossManualReactionType, Character } from "../../shared/types";
import {
  getBossManualReactionTiming,
  normalizeBossManualReactionQuality,
} from "./getBossManualReactionTiming";

const MAX_MANUAL_REACTIONS = 40;

export interface BossManualReactionRequest {
  castId: string;
  abilityId: string;
  abilityName: string;
  targetCharacterId: string;
  targetCharacterName: string;
  reactionType: BossManualReactionType;
  recordedAt: string;
  telegraphStartsAtMs?: number;
  resolvesAtMs?: number;
}

export function recordBossManualReaction(
  characters: Character[],
  request: BossManualReactionRequest,
) {
  const normalizedReaction = normalizeBossManualReaction(request);
  if (!normalizedReaction) return { characters, applied: false, reason: "Invalid manual reaction." };
  const target = characters.find((character) => character.id === normalizedReaction.targetCharacterId);
  const action = target?.currentAction;
  if (!target || target.status !== "bossing" || action?.type !== "bossing") {
    return { characters, applied: false, reason: "The target is not in an active Boss raid." };
  }
  if (normalizeBossManualReactions(action.bossManualReactions).some((entry) => entry.castId === normalizedReaction.castId)) {
    return { characters, applied: false, reason: "This telegraph already has a manual reaction." };
  }
  const hasTimingWindow = Number.isFinite(request.telegraphStartsAtMs) && Number.isFinite(request.resolvesAtMs);
  const timing = hasTimingWindow
    ? getBossManualReactionTiming(action.startedAt, {
        telegraphStartsAtMs: request.telegraphStartsAtMs!,
        resolvesAtMs: request.resolvesAtMs!,
      }, normalizedReaction.recordedAt)
    : undefined;
  if (timing && !timing.validWindow) {
    return { characters, applied: false, reason: "The manual reaction arrived outside the active telegraph." };
  }
  const reaction: BossManualReaction = timing
    ? { ...normalizedReaction, quality: timing.quality, timingPercent: timing.timingPercent }
    : normalizedReaction;
  const participantIds = new Set(action.partyMemberIds ?? action.partyMembers?.map((member) => member.characterId) ?? [target.id]);
  const updatedCharacters = characters.map((character) => {
    if (!participantIds.has(character.id) || character.currentAction?.type !== "bossing" || character.currentAction.targetId !== action.targetId) return character;
    const reactions = normalizeBossManualReactions(character.currentAction.bossManualReactions);
    return {
      ...character,
      currentAction: {
        ...character.currentAction,
        bossManualReactions: [...reactions.filter((entry) => entry.castId !== reaction.castId), reaction].slice(-MAX_MANUAL_REACTIONS),
      },
    };
  });
  return { characters: updatedCharacters, applied: true, reaction };
}

export function normalizeBossManualReactions(value: unknown): BossManualReaction[] {
  if (!Array.isArray(value)) return [];
  const byCastId = new Map<string, BossManualReaction>();
  for (const candidate of value) {
    const reaction = normalizeBossManualReaction(candidate);
    if (reaction) byCastId.set(reaction.castId, reaction);
  }
  return [...byCastId.values()].slice(-MAX_MANUAL_REACTIONS);
}

function normalizeBossManualReaction(value: unknown): BossManualReaction | undefined {
  if (!value || typeof value !== "object") return undefined;
  const candidate = value as Partial<BossManualReaction>;
  if (
    !validText(candidate.castId)
    || !validText(candidate.abilityId)
    || !validText(candidate.abilityName)
    || !validText(candidate.targetCharacterId)
    || !validText(candidate.targetCharacterName)
    || (candidate.reactionType !== "dodge" && candidate.reactionType !== "hold")
    || !validDate(candidate.recordedAt)
  ) return undefined;
  return {
    castId: candidate.castId,
    abilityId: candidate.abilityId,
    abilityName: candidate.abilityName,
    targetCharacterId: candidate.targetCharacterId,
    targetCharacterName: candidate.targetCharacterName,
    reactionType: candidate.reactionType,
    recordedAt: candidate.recordedAt,
    ...(candidate.quality ? { quality: normalizeBossManualReactionQuality(candidate.quality) } : {}),
    ...(typeof candidate.timingPercent === "number" && Number.isFinite(candidate.timingPercent)
      ? { timingPercent: Math.min(100, Math.max(0, Math.round(candidate.timingPercent * 100) / 100)) }
      : {}),
  };
}

function validText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= 160;
}

function validDate(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(new Date(value).getTime());
}
