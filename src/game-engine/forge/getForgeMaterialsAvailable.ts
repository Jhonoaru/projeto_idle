import type { Character, GuildDepot } from "../../shared/types";

export function getForgeMaterialsAvailable(character: Character, guildDepot: GuildDepot) {
  const available = new Map<string, number>();

  for (const item of [...character.inventory, ...character.characterDepot, ...guildDepot.items]) {
    if (item.locked || item.item.type === "quest") continue;
    available.set(item.itemId, (available.get(item.itemId) ?? 0) + item.quantity);
  }

  return available;
}
