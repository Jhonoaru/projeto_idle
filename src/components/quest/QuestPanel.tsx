import { useEffect, useState } from "react";
import { canStartQuest } from "../../game-engine/quest/canStartQuest";
import { getQuestJourney } from "../../game-engine/quest/getQuestJourney";
import { AccessList } from "./AccessList";
import { QuestCard } from "./QuestCard";
import { QuestResultPanel } from "./QuestResultPanel";
import type { Character, Quest } from "../../shared/types";

interface QuestPanelProps {
  character: Character;
  quests: Quest[];
  lastResult?: {
    success: boolean;
    died: boolean;
    accessUnlocked?: string;
    logs: string[];
  };
  onStartQuest: (quest: Quest) => void;
  onFinishQuest: (quest: Quest) => void;
}

export function QuestPanel({
  character,
  quests,
  lastResult,
  onStartQuest,
  onFinishQuest,
}: QuestPanelProps) {
  const journey = getQuestJourney(character, quests);
  const [selectedChapterId, setSelectedChapterId] = useState(
    journey.currentChapter?.id ?? journey.chapters[0]?.id ?? "",
  );
  const selectedChapter = journey.chapters.find((chapter) => chapter.id === selectedChapterId)
    ?? journey.currentChapter
    ?? journey.chapters[0];
  const nextEntry = journey.nextEntry;
  const nextRequirement = nextEntry
    ? canStartQuest(character, nextEntry.quest, quests).reason
    : undefined;

  useEffect(() => {
    if (!journey.chapters.some((chapter) => chapter.id === selectedChapterId)) {
      setSelectedChapterId(journey.currentChapter?.id ?? journey.chapters[0]?.id ?? "");
    }
  }, [journey.chapters, journey.currentChapter?.id, selectedChapterId]);

  return (
    <div className="quest-panel quest-journey-panel">
      <section className="quest-journey-command">
        <div>
          <span>Journey Ledger</span>
          <strong>{nextEntry ? nextEntry.quest.name : "Journey complete"}</strong>
          <p>
            {nextEntry
              ? nextEntry.quest.description
              : `${character.name} has completed every registered progression contract.`}
          </p>
        </div>
        <button
          disabled={!nextEntry}
          onClick={() => nextEntry && setSelectedChapterId(nextEntry.chapterId)}
          type="button"
        >
          {nextEntry ? "View next contract" : "All recorded"}
        </button>
        <div className="quest-journey-total">
          <span>Career progress</span>
          <i><b style={{ width: `${journey.progressPercent}%` }} /></i>
          <strong>{journey.completedCount}/{journey.totalCount}</strong>
        </div>
      </section>

      <QuestResultPanel result={lastResult} />

      <nav aria-label="Journey chapters" className="quest-chapter-tabs">
        {journey.chapters.map((chapter, index) => (
          <button
            aria-pressed={chapter.id === selectedChapter?.id}
            className={chapter.complete ? "is-complete" : ""}
            key={chapter.id}
            onClick={() => setSelectedChapterId(chapter.id)}
            type="button"
          >
            <span>Chapter {index + 1}</span>
            <strong>{chapter.title}</strong>
            <small>{chapter.subtitle} / {chapter.completedCount}/{chapter.totalCount}</small>
            <i><b style={{ width: `${chapter.totalCount > 0 ? (chapter.completedCount / chapter.totalCount) * 100 : 0}%` }} /></i>
          </button>
        ))}
      </nav>

      <div className="quest-journey-workspace">
        <section className="quest-contract-board">
          <header>
            <div>
              <span>{selectedChapter?.subtitle}</span>
              <strong>{selectedChapter?.title}</strong>
            </div>
            <p>{selectedChapter?.description}</p>
          </header>
          <div className="quest-list">
            {(selectedChapter?.entries ?? []).map(({ quest, status }) => (
              <QuestCard
                character={character}
                isCurrent={character.currentAction?.targetId === quest.id}
                isFeatured={nextEntry?.quest.id === quest.id}
                key={quest.id}
                onFinish={onFinishQuest}
                onStart={onStartQuest}
                quest={quest}
                questCatalog={quests}
                reason={canStartQuest(character, quest, quests).reason}
                status={status}
              />
            ))}
          </div>
        </section>

        <aside className="quest-journey-sidebar">
          <section className="quest-next-dossier">
            <span>Next assignment</span>
            <strong>{nextEntry?.quest.name ?? "Ledger complete"}</strong>
            {nextEntry ? (
              <>
                <p>{nextRequirement ?? "Requirements met. This contract can be started now."}</p>
                <dl>
                  <div><dt>Level</dt><dd>{nextEntry.quest.requiredLevel}</dd></div>
                  <div><dt>Duration</dt><dd>{nextEntry.quest.totalDurationMinutes} min</dd></div>
                  <div><dt>Risk</dt><dd>{nextEntry.quest.risk}</dd></div>
                  <div><dt>Reward</dt><dd>{formatQuestReward(nextEntry.quest)}</dd></div>
                </dl>
              </>
            ) : <p>No progression contract remains for this adventurer.</p>}
          </section>

          <section className="quest-access-dossier">
            <div>
              <span>Access Registry</span>
              <strong>{character.accessIds.length} unlocked</strong>
            </div>
            <AccessList character={character} />
          </section>
        </aside>
      </div>
    </div>
  );
}

function formatQuestReward(quest: Quest) {
  const rewards = [
    quest.rewards.gold ? `${quest.rewards.gold.toLocaleString("en-US")}g` : undefined,
    quest.rewards.experience ? `${quest.rewards.experience.toLocaleString("en-US")} XP` : undefined,
    quest.rewards.renown ? `${quest.rewards.renown} renown` : undefined,
  ].filter(Boolean);

  return rewards.join(" / ") || "Record only";
}
