import type { GuildDeploymentOrderSlotId } from "../shared/types";

export interface GuildDeploymentOrderSlotDefinition {
  id: GuildDeploymentOrderSlotId;
  sigil: string;
  name: string;
}

export const guildDeploymentOrderSlots: readonly GuildDeploymentOrderSlotDefinition[] = [
  { id: "order-one", sigil: "I", name: "Order I" },
  { id: "order-two", sigil: "II", name: "Order II" },
  { id: "order-three", sigil: "III", name: "Order III" },
];

export function getGuildDeploymentOrderSlot(id: string | null | undefined) {
  return guildDeploymentOrderSlots.find((slot) => slot.id === id);
}
