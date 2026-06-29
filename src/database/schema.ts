export const DATABASE_URL = "sqlite:guild_hunt_idle.db";
export const SAVE_VERSION = 1;
export const PRIMARY_METADATA_ID = "primary";

export const OWNER_TYPES = {
  characterInventory: "character_inventory",
  characterDepot: "character_depot",
  guildDepot: "guild_depot",
  equipped: "equipped",
} as const;
