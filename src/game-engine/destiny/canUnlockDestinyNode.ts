import { getDestinyNodeById } from "../../data/destinyNodes";
import type { Character } from "../../shared/types";
import { normalizeDestinyState } from "./normalizeDestinyState";

export function canUnlockDestinyNode(character: Character, nodeId: string) {
  const destiny = normalizeDestinyState(character);
  const node = getDestinyNodeById(nodeId);

  if (!node) return { canUnlock: false, reason: "Node not found." };
  if (destiny.unlockedNodeIds.includes(node.id)) return { canUnlock: false, reason: "Already unlocked." };
  if (node.allowedVocations && !node.allowedVocations.includes(character.vocation)) {
    return { canUnlock: false, reason: "Different vocation." };
  }
  if (character.level < node.requiredLevel) {
    return { canUnlock: false, reason: `Requires level ${node.requiredLevel}.` };
  }
  const missingPrerequisite = node.prerequisiteNodeIds.find(
    (requiredId) => !destiny.unlockedNodeIds.includes(requiredId),
  );
  if (missingPrerequisite) return { canUnlock: false, reason: "Missing prerequisite." };
  if (destiny.availablePoints < node.cost) {
    return { canUnlock: false, reason: `Requires ${node.cost} Destiny Point(s).` };
  }

  return { canUnlock: true, reason: "Available." };
}
