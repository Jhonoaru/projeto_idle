export interface QuestJourneyChapterDefinition {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  questIds: string[];
}

export const questJourneyChapters: QuestJourneyChapterDefinition[] = [
  {
    id: "chapter-guild-registration",
    title: "Guild Registration",
    subtitle: "Levels 1-5",
    description: "Register the company, survey the first cellar, and secure the Thaeron tunnels.",
    questIds: [
      "quest-first-contract",
      "quest-cellar-survey",
      "quest-sewer-clearance",
    ],
  },
  {
    id: "chapter-thaeron-fieldwork",
    title: "Thaeron Fieldwork",
    subtitle: "Levels 8-18",
    description: "Protect supply routes, earn a boss writ, and open the road to Mudrot Cave.",
    questIds: [
      "quest-trollwood-supply-line",
      "quest-broodmother-writ",
      "quest-mudrot-investigation",
    ],
  },
  {
    id: "chapter-expedition-command",
    title: "Expedition Command",
    subtitle: "Levels 25-55",
    description: "Qualify for boss contracts and secure the guild's advanced expedition routes.",
    questIds: [
      "quest-novice-boss-trial",
      "quest-crypt-permission",
      "quest-khazgrim-passage",
      "quest-ember-nest-ritual",
    ],
  },
];
