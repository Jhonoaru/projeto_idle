import { questJourneyChapters } from "../../data/questJourney";
import { getQuestAvailability } from "./getQuestAvailability";
import type { Character, Quest, QuestStatus } from "../../shared/types";

export interface QuestJourneyEntry {
  quest: Quest;
  status: QuestStatus;
  chapterId: string;
  order: number;
}

export function getQuestJourney(character: Character, quests: Quest[]) {
  const availability = new Map(
    getQuestAvailability(character, quests).map((entry) => [entry.quest.id, entry]),
  );
  const entries: QuestJourneyEntry[] = questJourneyChapters.flatMap((chapter) =>
    chapter.questIds.flatMap((questId, order) => {
      const entry = availability.get(questId);
      return entry ? [{ ...entry, chapterId: chapter.id, order }] : [];
    }),
  );
  const chapters = questJourneyChapters.map((chapter) => {
    const chapterEntries = entries.filter((entry) => entry.chapterId === chapter.id);
    const completedCount = chapterEntries.filter((entry) => entry.status === "completed").length;

    return {
      ...chapter,
      entries: chapterEntries,
      completedCount,
      totalCount: chapterEntries.length,
      complete: chapterEntries.length > 0 && completedCount === chapterEntries.length,
    };
  });
  const nextEntry = entries.find((entry) => entry.status === "in_progress")
    ?? entries.find((entry) => entry.status === "available")
    ?? entries.find((entry) => entry.status !== "completed");
  const completedCount = entries.filter((entry) => entry.status === "completed").length;

  return {
    chapters,
    entries,
    nextEntry,
    currentChapter: chapters.find((chapter) => chapter.id === nextEntry?.chapterId) ?? chapters.at(-1),
    completedCount,
    totalCount: entries.length,
    progressPercent: entries.length > 0 ? Math.round((completedCount / entries.length) * 100) : 0,
  };
}
