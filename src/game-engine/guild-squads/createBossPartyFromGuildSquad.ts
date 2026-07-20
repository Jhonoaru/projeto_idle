import type { Boss, BossParty, Character, Guild } from "../../shared/types";
import { getGuildSquadStatus } from "./getGuildSquadStatus";

export function createBossPartyFromGuildSquad(guild: Guild, characters: Character[], boss: Boss, slotId: string) {
  const slot = getGuildSquadStatus(guild, characters).slots.find((entry) => entry.definition.id === slotId);
  if (!slot?.unlocked) return blocked(boss, "Guild Squad slot is locked.");
  if (!slot.squad || slot.squad.members.length === 0) return blocked(boss, "Guild Squad has no adventurers.");
  const members = slot.squad.members.slice(0, boss.requirements.maxPartySize);
  return {
    success: true,
    party: { bossId: boss.id, members } satisfies BossParty,
    squad: slot.squad,
    message: `${slot.squad.name} loaded for ${boss.name} with ${members.length} adventurer${members.length === 1 ? "" : "s"}.`,
  };
}

function blocked(boss: Boss, message: string) {
  return { success: false, party: { bossId: boss.id, members: [] } satisfies BossParty, squad: undefined, message };
}
