import { getDestinyNodeById } from "../../data/destinyNodes";
import type { Character } from "../../shared/types";
import { calculateCharacterAttributes } from "../character/calculateCharacterAttributes";
import { canUnlockDestinyNode } from "./canUnlockDestinyNode";
import { normalizeDestinyState } from "./normalizeDestinyState";

export function unlockDestinyNode(character: Character, nodeId: string) {
  const status = canUnlockDestinyNode(character, nodeId);
  if (!status.canUnlock) throw new Error(status.reason);

  const node = getDestinyNodeById(nodeId);
  if (!node) throw new Error("Node not found.");

  const destiny = normalizeDestinyState(character);
  const updatedCharacterBase: Character = {
    ...character,
    destiny: normalizeDestinyState({
      ...character,
      destiny: {
        ...destiny,
        unlockedNodeIds: [...destiny.unlockedNodeIds, node.id],
      },
    }),
  };
  const attributes = calculateCharacterAttributes(updatedCharacterBase);

  return {
    character: {
      ...updatedCharacterBase,
      attributes,
      capacityMax: attributes.capacity,
    },
    logs: [`${character.name} unlocked ${node.name} on the Path of Destiny.`],
  };
}
