export type ClientUpdateCategory = "systems" | "interface" | "qa";

export interface ClientUpdateDefinition {
  id: string;
  stage: string;
  title: string;
  date: string;
  category: ClientUpdateCategory;
  summary: string;
  highlights: string[];
  systems: string[];
  featured?: boolean;
}

export const clientUpdates: ClientUpdateDefinition[] = [
  {
    id: "stage-49",
    stage: "Stage 49",
    title: "Guild Titles and Career Identity",
    date: "2026-07-15",
    category: "systems",
    summary: "Career achievements now unlock local guild titles that can be equipped across the client.",
    highlights: [
      "Twelve identities are earned through specific Career Ledger records or career point thresholds.",
      "Guild Identity provides availability filters, banner previews, title dossiers and equip controls.",
      "The equipped title persists in SQLite and grants no stats, currency, premium access or online status.",
    ],
    systems: ["Hall of Renown", "Guild Identity", "Achievements"],
    featured: true,
  },
  {
    id: "stage-48",
    stage: "Stage 48",
    title: "Guild Career Ledger",
    date: "2026-07-15",
    category: "systems",
    summary: "The Hall of Renown now records guild-wide achievements and career ranks from permanent local save data.",
    highlights: [
      "Eighteen milestones cover growth, contracts, hunting, mastery, Collections and legacy.",
      "Five career ranks turn recorded achievements into a clear long-term guild trajectory.",
      "Career points are read-only, cannot be spent and require no claim, migration or online service.",
    ],
    systems: ["Hall of Renown", "Achievements", "Guild progression"],
  },
  {
    id: "stage-47",
    stage: "Stage 47",
    title: "Guild Journey Ledger",
    date: "2026-07-15",
    category: "systems",
    summary: "Quests now form a guided guild journey with named prerequisites, chapter progress and a clear next contract.",
    highlights: [
      "Ten contracts are organized into Guild Registration, Thaeron Fieldwork and Expedition Command.",
      "The quest ledger highlights the next assignment, rewards, access unlocks and blocking requirements.",
      "Guild Briefing routes eligible adventurers into the next contract without adding save fields or a SQLite migration.",
    ],
    systems: ["Quests", "Guild progression", "Guild Briefing"],
  },
  {
    id: "stage-46",
    stage: "Stage 46",
    title: "Guild Opening Briefing",
    date: "2026-07-14",
    category: "interface",
    summary: "Character Hall now turns real guild progress into a concise next assignment for new and returning adventurers.",
    highlights: [
      "Opening assignments connect the first hunt, loot sale and introductory contract.",
      "The primary command routes directly to Hunt, Quick Sell, Quests, Action or recovery.",
      "Guidance is derived from existing save data and adds no tutorial flags or SQLite migration.",
    ],
    systems: ["Character Hall", "First session", "Client navigation"],
  },
  {
    id: "stage-45",
    stage: "Stage 45",
    title: "Local Client Settings",
    date: "2026-07-14",
    category: "interface",
    summary: "Settings became a dedicated local console for presentation, startup behavior and SQLite save controls.",
    highlights: [
      "Density, text scale, reduced motion and optional shell panels apply immediately.",
      "Startup screen and last-view restoration are stored only on the current device.",
      "Client preferences remain separate from guild progression and the SQLite save.",
    ],
    systems: ["Settings", "Client preferences", "Local storage"],
  },
  {
    id: "stage-44",
    stage: "Stage 44",
    title: "Guild Field Codex",
    date: "2026-07-13",
    category: "interface",
    summary: "Wiki became a searchable local reference built from the installed vocations, hunts, bosses, quests and system rules.",
    highlights: [
      "Thirty-four records cover adventurers, exploration, progression and guild services.",
      "Category filters, keyword search and selectable dossiers organize the client knowledge base.",
      "The codex is read-only, works offline and does not modify the SQLite save.",
    ],
    systems: ["Wiki", "Game data", "Client navigation"],
  },
  {
    id: "stage-43",
    stage: "Stage 43",
    title: "Release Archive",
    date: "2026-07-13",
    category: "interface",
    summary: "Updates became a full local changelog hall for systems, interface revisions and QA milestones.",
    highlights: [
      "Release records can be filtered by systems, interface and quality assurance.",
      "Search and selectable dossiers expose highlights and affected systems.",
      "The archive is bundled locally and does not download patches or contact online services.",
    ],
    systems: ["Updates", "Client navigation", "Local archive"],
  },
  {
    id: "stage-42",
    stage: "Stage 42",
    title: "Cosmetic Showcase",
    date: "2026-07-13",
    category: "interface",
    summary: "Store became a local cosmetic preview archive connected to the real Collections Hall.",
    highlights: [
      "Twelve non-starter outfits, mounts and avatars are available for inspection.",
      "Category and unlock-source filters organize earnable and future records.",
      "No purchases, premium currency, checkout or online services were added.",
    ],
    systems: ["Collections", "Store", "Local save"],
  },
  {
    id: "stage-41-5",
    stage: "Stage 41.5",
    title: "Hall of Renown QA",
    date: "2026-07-13",
    category: "qa",
    summary: "The local ranking was verified in Tauri and SQLite without creating competitive progression.",
    highlights: [
      "Four ranking metrics and character selection were validated.",
      "Save and Reload preserved every ranking source field.",
      "Ranking interactions remained read-only and fully offline.",
    ],
    systems: ["Ranking", "Characters", "SQLite"],
  },
  {
    id: "stage-41",
    stage: "Stage 41",
    title: "Hall of Renown",
    date: "2026-07-13",
    category: "systems",
    summary: "A guild-only ranking hall now compares adventurers using data from the current save.",
    highlights: [
      "Experience, level, combat power and skill totals have separate standings.",
      "The podium, complete table and character dossier share the selected metric.",
      "No global leaderboard, seasons or ranking rewards are present.",
    ],
    systems: ["Ranking", "Character progression", "Guild roster"],
  },
  {
    id: "stage-40-5",
    stage: "Stage 40.5",
    title: "Daily Ledger QA",
    date: "2026-07-13",
    category: "qa",
    summary: "Daily claims, streak progression and the seven-day cycle were verified in the desktop runtime.",
    highlights: [
      "Double-click protection prevented duplicate rewards.",
      "Supply delivery, badge state and Save/Reload were confirmed.",
      "The protected SQLite save was restored after the test fixture.",
    ],
    systems: ["Daily Reward", "Inventory", "SQLite"],
  },
  {
    id: "stage-40",
    stage: "Stage 40",
    title: "Guild Daily Ledger",
    date: "2026-07-13",
    category: "interface",
    summary: "Daily Reward gained a wide seven-day ledger with dispatch preview and claim history.",
    highlights: [
      "Current streak, total claims and daily availability are visible together.",
      "The active reward is highlighted without hiding the rest of the cycle.",
      "Claims still use the existing offline reward engine and local save.",
    ],
    systems: ["Daily Reward", "Activity log", "Collections"],
  },
  {
    id: "stage-39",
    stage: "Stage 39",
    title: "Collections Hall",
    date: "2026-07-13",
    category: "systems",
    summary: "Guild cosmetics moved into a full archive with per-character outfit, mount and avatar loadouts.",
    highlights: [
      "Catalog search and state filters cover all three cosmetic categories.",
      "Unlocked records can be equipped independently on each character.",
      "New-record badges and unlock state persist through SQLite.",
    ],
    systems: ["Collections", "Character cosmetics", "SQLite"],
  },
  {
    id: "stage-38",
    stage: "Stage 38",
    title: "Path of Destiny",
    date: "2026-07-13",
    category: "systems",
    summary: "The passive wheel became a wide constellation with real prerequisites, bonuses and reset rules.",
    highlights: [
      "Nodes are grouped into core, offense, defense, utility and vocation paths.",
      "Level-earned Destiny Points unlock permanent character bonuses.",
      "The ledger summarizes every active effect from the selected path.",
    ],
    systems: ["Path of Destiny", "Attributes", "Character progression"],
  },
  {
    id: "stage-37",
    stage: "Stage 37",
    title: "Hunting Research Hall",
    date: "2026-07-13",
    category: "interface",
    summary: "Bestiary, Charms and Monster Focus were unified into a broader research workspace.",
    highlights: [
      "Creature dossiers expose progress, kill thresholds and active charms.",
      "Monster Focus contracts remain tied to real hunt bonuses and local timers.",
      "Research navigation no longer competes with the character roster layout.",
    ],
    systems: ["Bestiary", "Charms", "Monster Focus"],
  },
  {
    id: "stage-36",
    stage: "Stage 36",
    title: "Blessings Hall",
    date: "2026-07-13",
    category: "systems",
    summary: "Seven cumulative temple blessings now protect characters from local death penalties.",
    highlights: [
      "Blessings reduce skill and item loss according to the active set.",
      "Gold purchases, consumption on death and temple records use real save data.",
      "Old saves normalize safely with no active blessings.",
    ],
    systems: ["Blessings", "Death recovery", "Guild gold"],
  },
];
