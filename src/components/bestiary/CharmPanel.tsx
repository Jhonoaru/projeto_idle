import { charms } from "../../data/charms";
import { monsters } from "../../data/monsters";
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
  const monsterList = Object.values(monsters);
  return (
    <div className="charm-panel">
      {charms.map((charm) => {
        const isUnlocked = bestiary.unlockedCharmIds.includes(charm.id);
        const selectedAssignment = bestiary.activeCharms.find(
          (assignment) => assignment.monsterId === selectedProgress?.monsterId,
        );
        const charmAssignment = bestiary.activeCharms.find((assignment) => assignment.charmId === charm.id);
        const isAssignedToSelected = selectedAssignment?.charmId === charm.id;
        const isAssignedElsewhere = Boolean(charmAssignment && !isAssignedToSelected);
        const assignedMonsterName = monsterList.find((monster) => monster.id === charmAssignment?.monsterId)?.name;
        const canAssign = Boolean(
          selectedProgress &&
            selectedProgress.stage === "completed" &&
            isUnlocked &&
            !isAssignedToSelected,
        );

        return (
          <CharmCard
            canAssign={canAssign}
            assignedMonsterName={assignedMonsterName}
            canUnlock={!isUnlocked && bestiary.charmPoints >= charm.unlockCost}
            charm={charm}
            isAssignedElsewhere={isAssignedElsewhere}
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
