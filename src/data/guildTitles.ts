import type { GuildTitleDefinition } from "../shared/types";

export const guildTitles: GuildTitleDefinition[] = [
  title("title-chartered", "The Chartered", "A company recognized as a stable adventuring guild.", "CH", "growth", "career-roster"),
  title("title-seasoned", "Seasoned Company", "A banner carried by a roster rich in field experience.", "SC", "growth", "career-levels"),
  title("title-contract-keepers", "Contract Keepers", "Known for honoring the guild's registered contracts.", "CK", "contracts", "career-first-contract"),
  title("title-road-wardens", "Wardens of the Roads", "Trusted across the regional roads and access routes.", "RW", "contracts", "career-open-roads"),
  title("title-field-hunters", "Field Hunters", "A company marked by its first recorded creature defeats.", "FH", "hunting", "career-first-hunt"),
  title("title-quarry-scholars", "Quarry Scholars", "Hunters who turn observation into permanent Bestiary knowledge.", "QS", "hunting", "career-studied-quarry"),
  title("title-disciplined", "Disciplined Company", "A guild whose members have committed to permanent mastery.", "DC", "mastery", "career-trained-hand"),
  title("title-curators", "Guild Curators", "Custodians of a broad permanent Collection archive.", "GC", "collections", "career-curator"),
  title("title-recognized", "Recognized Banner", "A name that has begun to carry weight across the realm.", "RB", "legacy", "career-recognized"),
  pointsTitle("title-vanguard", "Proven Vanguard", "A veteran identity earned through broad guild-wide progress.", "PV", "legacy", 350),
  pointsTitle("title-renowned", "Renowned Company", "A prestigious banner backed by a deep career record.", "RC", "legacy", 600),
  pointsTitle("title-legendary", "Living Legend", "The highest identity recorded in the local guild chronicle.", "LL", "legacy", 850),
];

function title(
  id: string,
  name: string,
  description: string,
  sigil: string,
  category: GuildTitleDefinition["category"],
  requiredAchievementId: string,
): GuildTitleDefinition {
  return { id, title: name, description, sigil, category, requiredAchievementId };
}

function pointsTitle(
  id: string,
  name: string,
  description: string,
  sigil: string,
  category: GuildTitleDefinition["category"],
  minimumCareerPoints: number,
): GuildTitleDefinition {
  return { id, title: name, description, sigil, category, minimumCareerPoints };
}
