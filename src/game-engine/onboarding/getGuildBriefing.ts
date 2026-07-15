import type { ActivityLogEntry, Character, Guild, HuntArea } from "../../shared/types";
import { quests } from "../../data/quests";
import { getQuestJourney, type QuestJourneyEntry } from "../quest/getQuestJourney";

export type GuildBriefingRoute = "action" | "blessings" | "hunts" | "market" | "quests";

export interface GuildBriefingStep {
  id: "field-run" | "loot-sale" | "first-contract";
  label: string;
  detail: string;
  complete: boolean;
}

export interface GuildBriefing {
  title: string;
  description: string;
  actionLabel: string;
  route: GuildBriefingRoute;
  steps: GuildBriefingStep[];
  completedSteps: number;
}

const SELLABLE_ITEM_TYPES = new Set(["creature_product", "material", "misc"]);

export function getGuildBriefing(
  character: Character,
  guild: Guild,
  selectedHunt?: HuntArea,
  logs: ActivityLogEntry[] = [],
): GuildBriefing {
  const hasSellableLoot = character.inventory.some(
    (entry) => SELLABLE_ITEM_TYPES.has(entry.item.type) && !entry.locked,
  );
  const guildMonsterKills = (guild.bestiary?.progress ?? []).reduce(
    (total, progress) => total + Math.max(0, Number(progress.kills) || 0),
    0,
  );
  const hasCompletedFieldRun = character.level > 1 || guildMonsterKills > 0 || hasSellableLoot;
  const hasRecordedSale = logs.some((entry) => entry.title === "Market sale");
  const hasSettledFirstLoot = hasRecordedSale || (hasCompletedFieldRun && !hasSellableLoot);
  const hasCompletedFirstContract = character.completedQuestIds.includes("quest-first-contract");
  const nextJourneyEntry = getQuestJourney(character, quests).nextEntry;
  const steps: GuildBriefingStep[] = [
    {
      id: "field-run",
      label: "Field assignment",
      detail: "Complete a short starter hunt.",
      complete: hasCompletedFieldRun,
    },
    {
      id: "loot-sale",
      label: "Settle field loot",
      detail: "Convert creature loot into guild gold.",
      complete: hasSettledFirstLoot,
    },
    {
      id: "first-contract",
      label: "First Contract",
      detail: "Register the guild's first official contract.",
      complete: hasCompletedFirstContract,
    },
  ];

  const command = getCurrentCommand({
    character,
    hasCompletedFieldRun,
    hasCompletedFirstContract,
    hasSellableLoot,
    nextJourneyEntry,
    selectedHunt,
  });

  return {
    ...command,
    steps,
    completedSteps: steps.filter((step) => step.complete).length,
  };
}

function getCurrentCommand({
  character,
  hasCompletedFieldRun,
  hasCompletedFirstContract,
  hasSellableLoot,
  nextJourneyEntry,
  selectedHunt,
}: {
  character: Character;
  hasCompletedFieldRun: boolean;
  hasCompletedFirstContract: boolean;
  hasSellableLoot: boolean;
  nextJourneyEntry?: QuestJourneyEntry;
  selectedHunt?: HuntArea;
}): Pick<GuildBriefing, "title" | "description" | "actionLabel" | "route"> {
  if (character.status === "dead") {
    return {
      title: "Recover the adventurer",
      description: `${character.name} must be revived before receiving another assignment.`,
      actionLabel: "Open recovery",
      route: "blessings",
    };
  }

  if (character.status !== "idle" || character.currentAction) {
    return {
      title: "Resolve the current action",
      description: `${character.name} already has an active guild assignment.`,
      actionLabel: "View action",
      route: "action",
    };
  }

  if (!hasCompletedFieldRun) {
    return {
      title: "Run the first field assignment",
      description: "Send this adventurer to Sewers Below Thaeron for a short, safe introduction to hunting.",
      actionLabel: "Choose starter hunt",
      route: "hunts",
    };
  }

  if (hasSellableLoot) {
    return {
      title: "Settle the field loot",
      description: "Sell creature products and spare materials to move their value into guild gold.",
      actionLabel: "Open Quick Sell",
      route: "market",
    };
  }

  if (!hasCompletedFirstContract) {
    return {
      title: "Register the First Contract",
      description: "Complete the introductory guild contract to earn renown and Thaeron sewer access.",
      actionLabel: "Open quests",
      route: "quests",
    };
  }

  if (nextJourneyEntry && character.level < nextJourneyEntry.quest.requiredLevel) {
    return {
      title: `Prepare for ${nextJourneyEntry.quest.name}`,
      description: `Continue field assignments until level ${nextJourneyEntry.quest.requiredLevel}, then return to the journey ledger.`,
      actionLabel: "Open hunts",
      route: "hunts",
    };
  }

  if (nextJourneyEntry) {
    return {
      title: `Accept ${nextJourneyEntry.quest.name}`,
      description: "The next progression contract is ready in the guild journey ledger.",
      actionLabel: "Open journey",
      route: "quests",
    };
  }

  return {
    title: "Push the next unlocked hunt",
    description: selectedHunt
      ? `${selectedHunt.name} is ready for review. Choose a duration that fits the current session.`
      : "Review the available hunting grounds and choose the next assignment for this adventurer.",
    actionLabel: "Open hunts",
    route: "hunts",
  };
}
