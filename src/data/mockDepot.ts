import { createInventoryItem } from "./inventoryFactory";
import type { GuildDepot } from "../shared/types";

export const mockDepot: GuildDepot = {
  goldStored: 2_500,
  items: [
    createInventoryItem("iron-ore", 12, "guildDepot"),
    createInventoryItem("old-cloth", 18, "guildDepot"),
    createInventoryItem("enchanted-dust", 2, "guildDepot"),
    createInventoryItem("brass-shield", 1, "guildDepot"),
  ],
};
