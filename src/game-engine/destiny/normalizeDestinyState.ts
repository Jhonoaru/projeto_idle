import { destinyNodes, getDestinyNodeById } from "../../data/destinyNodes";
import type { Character, CharacterDestinyState, DestinyNode, Vocation } from "../../shared/types";
import { calculateDestinyPoints } from "./calculateDestinyPoints";

export function normalizeDestinyState(
  character: Pick<Character, "level" | "vocation"> & { destiny?: Partial<CharacterDestinyState> | null },
): CharacterDestinyState {
  const level = Number.isFinite(character.level) ? Math.max(1, Math.floor(character.level)) : 1;
  const totalEarnedPoints = calculateDestinyPoints(level);
  const unlockedNodeIds = trimToBudget(
    normalizeUnlockedNodeIds(character.destiny?.unlockedNodeIds, character.vocation),
    totalEarnedPoints,
  );
  const spentPoints = unlockedNodeIds.reduce((sum, nodeId) => sum + safeCost(getDestinyNodeById(nodeId)), 0);

  return {
    unlockedNodeIds,
    spentPoints,
    availablePoints: Math.max(0, totalEarnedPoints - spentPoints),
    totalEarnedPoints,
    lastCalculatedLevel: level,
  };
}

function normalizeUnlockedNodeIds(nodeIds: unknown, vocation: Vocation) {
  const uniqueNodeIds = [...new Set(Array.isArray(nodeIds) ? nodeIds.filter(Boolean) : [])];
  const unlocked: string[] = [];

  for (const nodeId of uniqueNodeIds) {
    const node = getDestinyNodeById(String(nodeId));
    if (!node || !isAllowedForVocation(node, vocation)) continue;
    if (!node.prerequisiteNodeIds.every((requiredId) => unlocked.includes(requiredId))) continue;
    unlocked.push(node.id);
  }

  return unlocked;
}

function trimToBudget(nodeIds: string[], totalEarnedPoints: number) {
  const trimmed: string[] = [];
  let spent = 0;

  for (const nodeId of nodeIds) {
    const node = getDestinyNodeById(nodeId);
    const cost = safeCost(node);
    if (!node || spent + cost > totalEarnedPoints) continue;
    trimmed.push(nodeId);
    spent += cost;
  }

  return trimmed;
}

function safeCost(node?: DestinyNode) {
  return Math.max(1, Math.floor(node?.cost ?? 1));
}

function isAllowedForVocation(node: DestinyNode, vocation: Vocation) {
  return !node.allowedVocations || node.allowedVocations.includes(vocation);
}

export function getVisibleDestinyNodes(vocation: Vocation) {
  return destinyNodes.filter((node) => isAllowedForVocation(node, vocation));
}
