import { charms } from "../../data/charms";
import { CharmCard } from "./CharmCard";
import type { GuildBestiaryState, MonsterBestiaryProgress } from "../../shared/types";

interface CharmPanelProps {
  bestiary: GuildBestiaryState;
  selectedProgress?: MonsterBestiaryProgress;
  onUnlockCharm: (charmId: string) => void;
  onAssignCharm: (charmId: string, monsterId: string) => void;
  onRemoveCharm: (monsterId: string) => void;
}

export function CharmPanel({
  bestiary,
  selectedProgress,
  onUnlockCharm,
  onAssignCharm,
  onRemoveCharm,
}: CharmPanelProps) {
  return (
    <div className="charm-panel">
      {charms.map((charm) => {
        const isUnlocked = bestiary.unlockedCharmIds.includes(charm.id);
        const selectedAssignment = bestiary.activeCharms.find(
          (assignment) => assignment.monsterId === selectedProgress?.monsterId,
        );
        const isAssignedToSelected = selectedAssignment?.charmId === charm.id;
        const canAssign = Boolean(
          selectedProgress &&
            selectedProgress.stage === "completed" &&
            isUnlocked &&
            !isAssignedToSelected,
        );

        return (
          <CharmCard
            canAssign={canAssign}
            canUnlock={!isUnlocked && bestiary.charmPoints >= charm.unlockCost}
            charm={charm}
            isAssignedToSelected={isAssignedToSelected}
            isUnlocked={isUnlocked}
            key={charm.id}
            onAssign={() => selectedProgress && onAssignCharm(charm.id, selectedProgress.monsterId)}
            onRemove={() => selectedProgress && onRemoveCharm(selectedProgress.monsterId)}
            onUnlock={() => onUnlockCharm(charm.id)}
            selectedMonsterName={selectedProgress?.monsterName}
          />
        );
      })}
    </div>
  );
}
