import type { GuildLoadoutTemplateSlotId } from "../shared/types";

export interface GuildLoadoutTemplateSlotDefinition {
  id: GuildLoadoutTemplateSlotId;
  name: string;
  shortName: string;
}

export const guildLoadoutTemplateSlots: GuildLoadoutTemplateSlotDefinition[] = [
  { id: "loadout-one", name: "Loadout I", shortName: "I" },
  { id: "loadout-two", name: "Loadout II", shortName: "II" },
  { id: "loadout-three", name: "Loadout III", shortName: "III" },
];

export function getGuildLoadoutTemplateSlot(value: unknown) {
  return guildLoadoutTemplateSlots.find((slot) => slot.id === value);
}
