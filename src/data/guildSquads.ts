import type { GuildSquadSlotId } from "../shared/types";

export interface GuildSquadSlotDefinition {
  id: GuildSquadSlotId;
  sigil: string;
  defaultName: string;
  minimumGuildLevel: number;
}

export const guildSquadSlots: readonly GuildSquadSlotDefinition[] = [
  { id: "squad-one", sigil: "I", defaultName: "First Company", minimumGuildLevel: 1 },
  { id: "squad-two", sigil: "II", defaultName: "Second Company", minimumGuildLevel: 3 },
  { id: "squad-three", sigil: "III", defaultName: "Third Company", minimumGuildLevel: 5 },
];

export function getGuildSquadSlot(slotId: string | null | undefined) {
  return guildSquadSlots.find((slot) => slot.id === slotId);
}
