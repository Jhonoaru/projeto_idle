import type { GuildAchievementDefinition } from "../shared/types";

export const guildAchievements: GuildAchievementDefinition[] = [
  achievement("career-roster", "Chartered Company", "Maintain at least five adventurers on the guild roster.", "growth", "bronze", "roster_size", 5, 25, "GR"),
  achievement("career-levels", "Seasoned Roster", "Reach 100 combined character levels across the guild.", "growth", "silver", "combined_level", 100, 45, "LV"),
  achievement("career-experience", "Generations of Experience", "Accumulate 500,000 combined permanent experience.", "growth", "gold", "combined_experience", 500_000, 75, "XP"),

  achievement("career-first-contract", "Signed and Sealed", "Complete the guild's first unique contract.", "contracts", "bronze", "completed_contracts", 1, 25, "Q1"),
  achievement("career-five-contracts", "Field Office", "Complete five unique contracts across the roster.", "contracts", "silver", "completed_contracts", 5, 50, "Q5"),
  achievement("career-open-roads", "Regional Authority", "Secure three unique regional access permissions.", "contracts", "gold", "unlocked_accesses", 3, 80, "AC"),

  achievement("career-first-hunt", "First Field Marks", "Record 25 creature defeats in the guild Bestiary.", "hunting", "bronze", "monster_kills", 25, 20, "K1"),
  achievement("career-hunt-ledger", "Hunter's Ledger", "Record 500 creature defeats in the guild Bestiary.", "hunting", "silver", "monster_kills", 500, 55, "K5"),
  achievement("career-studied-quarry", "Studied Quarry", "Complete at least one Bestiary creature entry.", "hunting", "gold", "completed_bestiary_entries", 1, 70, "BE"),

  achievement("career-trained-hand", "Disciplined Hand", "Raise any permanent combat skill to level 25.", "mastery", "bronze", "highest_skill", 25, 25, "S1"),
  achievement("career-veteran-technique", "Veteran Technique", "Raise any permanent combat skill to level 60.", "mastery", "silver", "highest_skill", 60, 50, "S6"),
  achievement("career-master-technique", "Master Technique", "Raise any permanent combat skill to level 90.", "mastery", "gold", "highest_skill", 90, 90, "S9"),

  achievement("career-guild-identity", "Guild Identity", "Unlock ten permanent Collection records.", "collections", "bronze", "collection_unlocks", 10, 25, "C1"),
  achievement("career-curator", "Guild Curator", "Unlock fifteen permanent Collection records.", "collections", "silver", "collection_unlocks", 15, 55, "C5"),
  achievement("career-attendance", "Steady Attendance", "Claim seven Daily Rewards across the guild.", "collections", "gold", "daily_claims", 7, 70, "D7"),

  achievement("career-recognized", "Recognized Name", "Reach 10 guild renown.", "legacy", "bronze", "guild_renown", 10, 25, "R1"),
  achievement("career-renowned", "Renowned Company", "Reach 50 guild renown.", "legacy", "silver", "guild_renown", 50, 60, "R5"),
  achievement("career-treasury", "Guild Treasury", "Hold 10,000 guild gold at one time.", "legacy", "gold", "guild_gold", 10_000, 85, "G1"),
];

function achievement(
  id: string,
  title: string,
  description: string,
  category: GuildAchievementDefinition["category"],
  tier: GuildAchievementDefinition["tier"],
  metric: GuildAchievementDefinition["metric"],
  target: number,
  points: number,
  sigil: string,
): GuildAchievementDefinition {
  return { id, title, description, category, tier, metric, target, points, sigil };
}
