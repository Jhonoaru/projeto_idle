import { getQuestAvailability } from "../../game-engine/quest/getQuestAvailability";
import { canStartQuest } from "../../game-engine/quest/canStartQuest";
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
  const availability = getQuestAvailability(character, quests);

  return (
    <div className="quest-panel">
      <AccessList character={character} />
      <QuestResultPanel result={lastResult} />
      <div className="quest-list">
        {availability.map(({ quest, status }) => (
          <QuestCard
            character={character}
            isCurrent={character.currentAction?.targetId === quest.id}
            key={quest.id}
            onFinish={onFinishQuest}
            onStart={onStartQuest}
            quest={quest}
            reason={canStartQuest(character, quest).reason}
            status={status}
          />
        ))}
      </div>
    </div>
  );
}
