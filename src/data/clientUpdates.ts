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
    featured: true,
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
