import { bosses } from "./bosses";
import { hunts } from "./hunts";
import { quests } from "./quests";
import { VOCATION_CONFIGS } from "./vocations";

export type GuildCodexCategory = "adventurers" | "exploration" | "progression" | "services";

export interface GuildCodexFact {
  label: string;
  value: string;
}

export interface GuildCodexEntry {
  id: string;
  category: GuildCodexCategory;
  code: string;
  title: string;
  subtitle: string;
  summary: string;
  facts: GuildCodexFact[];
  guidance: string[];
  relatedSystems: string[];
  keywords?: string[];
  featured?: boolean;
}

const systemEntries: GuildCodexEntry[] = [
  {
    id: "offline-campaign",
    category: "services",
    code: "OF",
    title: "Offline Guild Campaign",
    subtitle: "Private single-player progression",
    summary: "Every guild system runs from the installed client and the local SQLite campaign save.",
    facts: [
      { label: "Players", value: "1 guild manager" },
      { label: "Save", value: "Local SQLite" },
      { label: "Economy", value: "NPCs / local bazaar" },
      { label: "Accounts", value: "None" },
    ],
    guidance: [
      "The roster, economy, activities, rewards and timers belong to one private campaign.",
      "The NPC Market handles fixed purchases and Quick Sell; the rotating bazaar generates deterministic local offers without player listings.",
      "The Wardrobe Exchange unlocks permanent Collection cosmetics for guild gold, boss trophies and completed quest work.",
    ],
    relatedSystems: ["Character Roster", "NPC Market", "Collections", "SQLite Save"],
    keywords: ["offline", "single player", "campaign", "local", "sqlite", "market", "wardrobe"],
    featured: true,
  },
  {
    id: "guild-recruitment",
    category: "services",
    code: "GR",
    title: "Guild Recruitment",
    subtitle: "Renown-based guild growth",
    summary: "Raise six offline guild levels through Renown, expand the roster, unlock permanent applicants and claim one cache per milestone.",
    facts: [
      { label: "Applicants", value: "6 permanent candidates" },
      { label: "Guild levels", value: "6 / Rank E to S" },
      { label: "Roster limit", value: "6 to 11 adventurers" },
      { label: "Reward caches", value: "6 one-time claims" },
    ],
    guidance: [
      "Renown automatically determines guild level and rank; each milestone expands capacity and unlocks one fixed applicant.",
      "Each applicant has a fixed vocation, level, skill profile, starter loadout, contract cost, Guild Level and Career Point requirement.",
      "A recruited character is stored as an ordinary roster member, so skills, equipment, inventory and future progress use the existing SQLite save.",
      "Contracts are permanent and cannot be repeated; each successful contract becomes an ordinary saved roster member.",
      "Reached reward caches can be claimed in any order. Gold goes to the guild, items go to the Guild Depot and the final cosmetic goes to Collections.",
    ],
    relatedSystems: ["Guild Renown", "Character Hall", "Career Ledger", "Guild Gold", "Guild Depot", "Collections", "SQLite Save"],
    keywords: ["recruit", "recruitment", "applicant", "candidate", "roster", "adventurer", "contract", "renown", "guild level", "rank", "reward", "cache"],
  },
  {
    id: "guild-projects",
    category: "services",
    code: "GP",
    title: "Guild Projects",
    subtitle: "Permanent local works",
    summary: "Fund three phased guild commissions with spendable gold and materials held safely in the Guild Depot.",
    facts: [
      { label: "Projects", value: "3 permanent works" },
      { label: "Phases", value: "3 per project" },
      { label: "Materials", value: "Guild Depot only" },
      { label: "Rewards", value: "Renown / cosmetic" },
    ],
    guidance: [
      "Each phase is paid atomically; locked stacks, quest items, character inventories and Treasury reserves are never consumed.",
      "Field Supply Station opens the chain, followed by the Cartographers' Archive at 100 Career Points and Founders' Monument at 250.",
      "Completed projects are permanent local records. They provide modest renown and cosmetics, never passive income or combat power.",
    ],
    relatedSystems: ["Guild Depot", "Career Ledger", "Collections", "Activity Log"],
    keywords: ["project", "works", "construction", "donation", "materials", "phase", "monument", "archive"],
  },
  {
    id: "guild-treasury",
    category: "services",
    code: "GT",
    title: "Guild Treasury",
    subtitle: "Protected local gold reserve",
    summary: "Move existing guild gold into a protected reserve and review the guild's recent local transfer ledger.",
    facts: [
      { label: "Currency", value: "Guild gold" },
      { label: "Transfer fee", value: "None" },
      { label: "Ledger", value: "30 recent entries" },
      { label: "Income", value: "None" },
    ],
    guidance: [
      "Deposited gold is excluded from ordinary guild purchases until it is withdrawn to spendable funds.",
      "Deposits and withdrawals preserve total guild holdings; the Treasury does not generate interest or passive income.",
      "The local ledger stores the amount, direction, date and reserve balance of each valid transfer.",
    ],
    relatedSystems: ["Guild Gold", "Activity Log", "SQLite Save"],
    keywords: ["treasury", "vault", "reserve", "gold", "deposit", "withdraw", "ledger"],
  },
  {
    id: "guild-staff",
    category: "services",
    code: "GS",
    title: "Guild Staff",
    subtitle: "Permanent local specialists",
    summary: "Hire four Headquarters specialists and assign one duty officer to support the next guild expedition.",
    facts: [
      { label: "Candidates", value: "4 specialists" },
      { label: "Active limit", value: "1 duty post" },
      { label: "Currency", value: "Guild gold" },
      { label: "Scope", value: "Future dispatches" },
    ],
    guidance: [
      "Facilities and Career Points unlock candidates; hiring is permanent and immediately deducts the listed guild gold retainer.",
      "Scout Captain improves success chance, Provisioner lowers dispatch cost, Guild Envoy improves gold and Field Medic adds renown.",
      "The duty officer is stored when an expedition begins, so assigning another specialist never changes an active report.",
    ],
    relatedSystems: ["Guild Headquarters", "Career Ledger", "Guild Contracts", "Activity Log"],
    keywords: ["staff", "specialist", "officer", "hire", "duty", "retainer", "expedition bonus"],
  },
  {
    id: "guild-contracts-board",
    category: "services",
    code: "CB",
    title: "Guild Contracts Board",
    subtitle: "Local support expeditions",
    summary: "Dispatch small support teams on timed guild-wide assignments for modest gold, renown and material rewards.",
    facts: [
      { label: "Postings", value: "6 contracts" },
      { label: "Active limit", value: "1 expedition" },
      { label: "Team", value: "1-3 adventurers" },
      { label: "Rewards", value: "Guild / Depot" },
    ],
    guidance: [
      "Career Points and Headquarters levels unlock harder postings while team power determines the displayed success chance.",
      "The outcome roll is persisted at dispatch time, so reloading the local save cannot reroll an expedition.",
      "Support assignments do not interrupt personal hunts, training or quests; completed reports require manual collection.",
    ],
    relatedSystems: ["Guild Headquarters", "Career Ledger", "Guild Depot", "Activity Log"],
    keywords: ["contract", "expedition", "dispatch", "support team", "report", "guild depot"],
  },
  {
    id: "guild-headquarters",
    category: "services",
    code: "HQ",
    title: "Guild Headquarters",
    subtitle: "Permanent local facilities",
    summary: "Guild gold and career progress fund four capped facilities with small bonuses for established gameplay loops.",
    facts: [
      { label: "Facilities", value: "4 wings" },
      { label: "Maximum", value: "Level 3 each" },
      { label: "Currency", value: "Guild gold" },
      { label: "Requirements", value: "Career points" },
    ],
    guidance: [
      "War Room improves hunt XP, Training Yard improves training progress, Quartermaster discounts the Market NPC and Contract Archive improves quest XP.",
      "Every upgrade validates current level, career points and guild gold before changing the local save.",
      "Headquarters facilities are permanent campaign upgrades with fixed costs, modest bonuses and strict level caps.",
    ],
    relatedSystems: ["Career Ledger", "Hunts", "Training", "Market", "Quests"],
    keywords: ["headquarters", "facility", "upgrade", "war room", "training yard", "quartermaster", "archive"],
  },
  {
    id: "guild-command",
    category: "progression",
    code: "HQ",
    title: "Guild Command",
    subtitle: "First steps",
    summary: "Choose an adventurer in Character Details, inspect the guild roster and use Explore to assign local activities.",
    facts: [
      { label: "Save scope", value: "Guild-wide" },
      { label: "Runtime", value: "Offline / local" },
      { label: "Main currency", value: "Guild gold" },
      { label: "Starting route", value: "Thaeron" },
    ],
    guidance: [
      "Character Details is the home hall for selecting the active adventurer and reviewing equipment, skills and progression.",
      "Explore opens Hunts, Bosses, Training and Quests; selecting an activity reveals only the controls needed to begin it.",
      "Gold belongs to the guild while inventory, equipment, skills and current actions remain tied to individual adventurers.",
    ],
    relatedSystems: ["Character Details", "Explore", "SQLite save"],
    keywords: ["starter", "home", "roster", "gold", "save"],
  },
  {
    id: "hunt-cycle",
    category: "exploration",
    code: "HC",
    title: "Hunt Cycle",
    subtitle: "Assignment and collection",
    summary: "Select a hunt, choose its duration and follow the combat scene until rewards are ready for collection.",
    facts: [
      { label: "Durations", value: "Minutes or hours" },
      { label: "Rewards", value: "XP, gold and loot" },
      { label: "Progress", value: "Real-time and offline" },
      { label: "Exit", value: "Return to city" },
    ],
    guidance: [
      "Recommended level is a planning signal; minimum level and access requirements determine whether an assignment can begin.",
      "The combat scene exposes health, mana, skill rotation, support, loot preview and the Hunt Analyzer without granting rewards early.",
      "Completed rewards are applied only through the normal finish or collection flow, including after offline catch-up.",
    ],
    relatedSystems: ["Explore", "Combat Scene", "Action Analyzer"],
    keywords: ["hunt", "combat", "duration", "loot", "offline"],
  },
  {
    id: "supplies-and-depots",
    category: "services",
    code: "SD",
    title: "Supplies and Depots",
    subtitle: "Inventory logistics",
    summary: "Potions, runes and ammunition are real inventory resources shared through character and guild storage workflows.",
    facts: [
      { label: "Personal storage", value: "Inventory / depot" },
      { label: "Guild storage", value: "Guild Depot" },
      { label: "Restock", value: "Market NPC" },
      { label: "Sale", value: "Quick Sell" },
    ],
    guidance: [
      "Hunts consume only supplies required for the selected vocation and duration; optional supplies remain recommendations.",
      "Guild Depot is the safe destination for account-wide rewards when no character destination is appropriate.",
      "Quick Sell protects equipped, locked, container and non-sellable items before adding proceeds to guild gold.",
    ],
    relatedSystems: ["Inventory", "Guild Depot", "Market NPC"],
    keywords: ["potion", "rune", "ammo", "inventory", "sell"],
  },
  {
    id: "death-and-blessings",
    category: "progression",
    code: "BL",
    title: "Death and Blessings",
    subtitle: "Temple protection",
    summary: "Seven cumulative blessings reduce local death penalties and are consumed only when their protection is used.",
    facts: [
      { label: "Blessings", value: "7 rites" },
      { label: "Purchase", value: "Guild gold" },
      { label: "Recovery", value: "Temple revive" },
      { label: "Effect", value: "Reduced losses" },
    ],
    guidance: [
      "Each blessing adds protection; the Hall shows the combined skill-loss and item-loss reduction before purchase.",
      "A defeated character enters recovery and cannot start another activity until revived through the temple flow.",
      "Old saves normalize with no active blessings, preserving compatibility without granting free protection.",
    ],
    relatedSystems: ["Blessings", "Death Recovery", "Temple Record"],
    keywords: ["bless", "death", "revive", "temple", "loss"],
  },
  {
    id: "hunting-research",
    category: "progression",
    code: "BR",
    title: "Hunting Research",
    subtitle: "Bestiary, Charms and Focus",
    summary: "Creature kills advance guild-wide dossiers, earn charm points and support temporary personal target contracts.",
    facts: [
      { label: "Bestiary", value: "Guild-wide" },
      { label: "Charms", value: "Passive bonuses" },
      { label: "Focus", value: "Per character" },
      { label: "Source", value: "Valid hunt kills" },
    ],
    guidance: [
      "Bestiary thresholds unlock creature stages and charm points from real hunt results.",
      "Unlocked charms can be assigned to eligible creature records without duplicating the same assignment.",
      "Monster Focus consumes charges only on matching hunts and applies the displayed temporary bonus.",
    ],
    relatedSystems: ["Bestiary", "Charms", "Monster Focus"],
    keywords: ["bestiary", "charm", "prey", "focus", "creature"],
  },
  {
    id: "forge-and-imbuing",
    category: "services",
    code: "FI",
    title: "Forge and Imbuing",
    subtitle: "Equipment improvement",
    summary: "Equipment upgrades use local gold and materials, while rarity and Forge rank remain separate, readable progression layers.",
    facts: [
      { label: "Inputs", value: "Gold and materials" },
      { label: "Forge", value: "+0..+5 / Tier 0..3" },
      { label: "Quality", value: "Rarity + Forge rank" },
      { label: "Imbuing", value: "Timed effects" },
      { label: "Persistence", value: "Equipped item" },
    ],
    guidance: [
      "Forge controls validate ownership, compatible slots, tier limits and material costs before changing an item.",
      "Rarity describes the item's base quality; Base, Forged, Ascendant and Exalted describe its independent Forge rank.",
      "Basic, Intricate and Powerful imbuements expose their requirements and duration before application.",
      "Expired or invalid imbuements normalize safely when older saves are loaded.",
    ],
    relatedSystems: ["Forge", "Imbuing Shrine", "Equipment"],
    keywords: ["forge", "tier", "upgrade", "imbuement", "material"],
  },
  {
    id: "character-advancement",
    category: "progression",
    code: "CA",
    title: "Character Advancement",
    subtitle: "Skills, proficiency and destiny",
    summary: "Levels, trained skills, weapon proficiency and Destiny nodes form separate but complementary progression paths.",
    facts: [
      { label: "Levels", value: "Experience" },
      { label: "Skills", value: "Training / combat" },
      { label: "Proficiency", value: "Weapon use" },
      { label: "Destiny", value: "Level points" },
    ],
    guidance: [
      "Training improves the selected discipline over a chosen duration and never generates hunt loot or gold.",
      "Weapon Proficiency follows the equipped weapon family and unlocks permanent milestone perks.",
      "Destiny Points are earned from levels and spent on nodes with real prerequisites; reset returns allocated points.",
    ],
    relatedSystems: ["Skills", "Training Grounds", "Path of Destiny"],
    keywords: ["skill", "training", "weapon", "proficiency", "destiny"],
  },
  {
    id: "equipment-progression",
    category: "progression",
    code: "EP",
    title: "Equipment Progression",
    subtitle: "Families, level bands and campaign sets",
    summary: "Equipment families guide combat identity, five level bands organize rewards and three compact campaign sets reward complete loadouts.",
    facts: [
      { label: "Families", value: "6 paths" },
      { label: "Bands", value: "Novice to Mythic" },
      { label: "Sets", value: "3 campaign kits" },
      { label: "Sources", value: "Hunts / bosses / bazaar" },
      { label: "Persistence", value: "Catalog-derived" },
    ],
    guidance: [
      "Vanguard, Pathfinder, Arcanum and Discipline follow combat styles; Field Kit covers universal gear and Artifact marks boss rewards.",
      "Novice, Adventurer, Veteran, Elite and Mythic bands use the item's required level and remain independent from rarity and Forge tier.",
      "Equipment can drop from matching campaign regions or appear in the rotating local Bazaar, but level and vocation gates still apply.",
      "Iron Expedition, Cryptwarden and Emberforged activate only when their distinct weapon, armor and optional Artifact groups are equipped together.",
      "Each weapon group accepts the matching Guardian, Ranger, magic or Monk option and counts at most once, even in a malformed legacy loadout.",
    ],
    relatedSystems: ["Equipment", "Hunts", "Bosses", "Forge", "Rotating Bazaar"],
    keywords: ["equipment", "gear", "family", "band", "level", "set", "iron expedition", "cryptwarden", "emberforged", "vanguard", "pathfinder", "arcanum", "discipline", "artifact"],
  },
  {
    id: "guild-ledgers",
    category: "services",
    code: "GL",
    title: "Guild Ledgers",
    subtitle: "Daily, Collections and local records",
    summary: "Account-wide halls track daily rewards, cosmetic unlocks, local ranking, career milestones, guild titles and installed client releases.",
    facts: [
      { label: "Daily", value: "7-day cycle" },
      { label: "Collections", value: "Guild unlocks" },
      { label: "Ranking", value: "Roster, career and identity" },
      { label: "Updates", value: "Local archive" },
    ],
    guidance: [
      "Daily Reward allows one local claim per day, advances a seven-day cycle and resets streak after missed days.",
      "Collections unlocks belong to the guild while outfit, mount and avatar selections belong to each character.",
      "Career achievements unlock cosmetic guild titles; the equipped identity grants no combat or economy bonus.",
      "Ranking, Career Ledger, Guild Identity and Updates read only the current private campaign records.",
    ],
    relatedSystems: ["Daily Reward", "Collections", "Ranking", "Career Ledger", "Guild Identity", "Updates"],
    keywords: ["daily", "collection", "ranking", "achievement", "career", "title", "identity", "updates", "cosmetic"],
  },
];

const vocationEntries: GuildCodexEntry[] = Object.entries(VOCATION_CONFIGS).map(([name, config]) => ({
  id: `vocation-${name.toLowerCase()}`,
  category: "adventurers",
  code: name.slice(0, 2).toUpperCase(),
  title: name,
  subtitle: config.role,
  summary: config.description,
  facts: [
    { label: "Main skills", value: config.mainSkills.join(", ") },
    { label: "Health / level", value: `+${config.healthPerLevel}` },
    { label: "Mana / level", value: `+${config.manaPerLevel}` },
    { label: "Capacity / level", value: `+${config.capacityPerLevel}` },
  ],
  guidance: [
    `${name} scales primarily with ${config.mainSkills.join(" and ")}.`,
    `Combat profile: ${formatMultiplier(config.attackMultiplier)} attack, ${formatMultiplier(config.defenseMultiplier)} defense and ${formatMultiplier(config.sustainMultiplier)} sustain.`,
    "Equipment, supplies, training plans and hunt recommendations should follow the active character rather than the guild as a whole.",
  ],
  relatedSystems: ["Character Details", "Skills", "Equipment"],
  keywords: [name, config.role, ...config.mainSkills],
}));

const huntEntries: GuildCodexEntry[] = hunts.map((hunt) => ({
  id: `codex-${hunt.id}`,
  category: "exploration",
  code: "H",
  title: hunt.name,
  subtitle: `${hunt.city} hunt`,
  summary: hunt.description,
  facts: [
    { label: "Recommended", value: `Level ${hunt.recommendedLevel}` },
    { label: "Minimum", value: `Level ${hunt.minLevel}` },
    { label: "Risk", value: formatText(hunt.risk) },
    { label: "Estimate", value: `${formatNumber(hunt.estimatedXpPerHour)} XP/h` },
  ],
  guidance: [
    `Expected economy: ${formatNumber(hunt.estimatedGoldPerHour)}g/h before approximately ${formatNumber(hunt.supplyCostPerHour)}g/h in supplies.`,
    `Known creatures: ${hunt.monsters.map((monster) => monster.name).join(", ")}.`,
    (hunt.supplies ?? []).length > 0
      ? `Supply plan: ${(hunt.supplies ?? []).map((supply) => `${supply.itemName} x${supply.recommendedQuantityPerHour}/h`).join(", ")}.`
      : "This hunt has no mandatory special supply plan.",
  ],
  relatedSystems: ["Explore", "Combat Scene", ...(hunt.recommendedVocations ?? [])],
  keywords: [hunt.city, hunt.risk, ...hunt.tags, ...hunt.monsters.map((monster) => monster.name)],
}));

const bossEntries: GuildCodexEntry[] = bosses.map((boss) => ({
  id: `codex-${boss.id}`,
  category: "exploration",
  code: "B",
  title: boss.name,
  subtitle: `${boss.city} ${boss.type} boss`,
  summary: boss.description,
  facts: [
    { label: "Required", value: `Level ${boss.requirements.requiredLevel}` },
    { label: "Party", value: `${boss.requirements.minPartySize}-${boss.requirements.maxPartySize}` },
    { label: "Risk", value: formatText(boss.risk) },
    { label: "Cooldown", value: `${boss.cooldownHours}h` },
    { label: "Entry fee", value: `${formatNumber(boss.entryCost)}g` },
  ],
  guidance: [
    `The encounter lasts ${boss.durationMinutes} minutes and awards ${formatNumber(boss.reward.experience)} experience on success.`,
    `Gold reward ranges from ${formatNumber(boss.reward.goldMin)}g to ${formatNumber(boss.reward.goldMax)}g, plus ${boss.reward.renown} renown.`,
    `The guild pays ${formatNumber(boss.entryCost)}g when the raid launches; aborting the attempt does not refund preparation costs.`,
    (boss.requirements.requiredAccessIds ?? []).length > 0
      ? `Required access: ${(boss.requirements.requiredAccessIds ?? []).join(", ")}.`
      : "No special access key is required beyond level and party rules.",
  ],
  relatedSystems: ["Bosses", "Party", "Cooldowns"],
  keywords: [boss.city, boss.type, boss.risk, ...boss.tags],
}));

const questEntries: GuildCodexEntry[] = quests.map((quest) => ({
  id: `codex-${quest.id}`,
  category: "exploration",
  code: "Q",
  title: quest.name,
  subtitle: `${quest.city} ${quest.type} quest`,
  summary: quest.description,
  facts: [
    { label: "Required", value: `Level ${quest.requiredLevel}` },
    { label: "Duration", value: `${quest.totalDurationMinutes} min` },
    { label: "Risk", value: formatText(quest.risk) },
    { label: "Steps", value: `${quest.steps.length}` },
  ],
  guidance: [
    `Route: ${quest.steps.map((step) => step.name).join(" -> ")}.`,
    `Rewards: ${formatNumber(quest.rewards.experience ?? 0)} experience, ${formatNumber(quest.rewards.gold ?? 0)}g and ${quest.rewards.renown ?? 0} renown.`,
    quest.unlocksAccess ? `Completion unlocks access: ${quest.unlocksAccess}.` : "Completion does not grant a separate access key.",
  ],
  relatedSystems: ["Quests", "Accesses", "Region Atlas"],
  keywords: [quest.city, quest.type, quest.risk, ...quest.tags, ...quest.steps.map((step) => step.name)],
}));

export const guildCodexEntries: GuildCodexEntry[] = [
  ...systemEntries,
  ...vocationEntries,
  ...huntEntries,
  ...bossEntries,
  ...questEntries,
];

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatMultiplier(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatText(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
