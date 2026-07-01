import { useMemo, useState } from "react";
import { getCharmById } from "../../data/charms";
import { normalizeBestiaryState } from "../../game-engine/bestiary/getBestiaryProgress";
import { BestiaryDetails } from "./BestiaryDetails";
import { BestiaryMonsterCard } from "./BestiaryMonsterCard";
import { CharmPanel } from "./CharmPanel";
import type { Guild } from "../../shared/types";

interface BestiaryPanelProps {
  guild: Guild;
  onClaimReward: (monsterId: string) => void;
  onUnlockCharm: (charmId: string) => void;
  onAssignCharm: (charmId: string, monsterId: string) => void;
  onRemoveCharm: (monsterId: string) => void;
}

export function BestiaryPanel({
  guild,
  onClaimReward,
  onUnlockCharm,
  onAssignCharm,
  onRemoveCharm,
}: BestiaryPanelProps) {
  const bestiary = normalizeBestiaryState(guild.bestiary);
  const [selectedMonsterId, setSelectedMonsterId] = useState<string | undefined>(
    bestiary.progress[0]?.monsterId,
  );
  const sortedProgress = useMemo(
    () => [...bestiary.progress].sort((a, b) => a.monsterName.localeCompare(b.monsterName)),
    [bestiary.progress],
  );
  const selectedProgress =
    sortedProgress.find((progress) => progress.monsterId === selectedMonsterId) ??
    sortedProgress[0];
  const completedCount = bestiary.progress.filter((progress) => progress.stage === "completed").length;
  const claimableCount = bestiary.progress.filter(
    (progress) => progress.stage === "completed" && !progress.charmPointsClaimed,
  ).length;

  return (
    <div className="bestiary-panel">
      <div className="bestiary-summary">
        <SummaryStat label="Seen" value={bestiary.progress.length.toLocaleString("en-US")} />
        <SummaryStat label="Completed" value={completedCount.toLocaleString("en-US")} />
        <SummaryStat label="Charm Points" value={bestiary.charmPoints.toLocaleString("en-US")} />
        <SummaryStat label="Unlocked" value={bestiary.unlockedCharmIds.length.toLocaleString("en-US")} />
        <SummaryStat label="Claimable" value={claimableCount.toLocaleString("en-US")} />
      </div>

      <div className="bestiary-layout">
        <div className="bestiary-list">
          {sortedProgress.length > 0 ? (
            sortedProgress.map((progress) => {
              const activeCharm = bestiary.activeCharms.find(
                (assignment) => assignment.monsterId === progress.monsterId,
              );
              return (
                <BestiaryMonsterCard
                  activeCharm={activeCharm}
                  charmName={getCharmById(activeCharm?.charmId)?.name}
                  isSelected={selectedProgress?.monsterId === progress.monsterId}
                  key={progress.monsterId}
                  onClaimReward={() => onClaimReward(progress.monsterId)}
                  onSelect={() => setSelectedMonsterId(progress.monsterId)}
                  progress={progress}
                />
              );
            })
          ) : (
            <div className="empty-list">Nenhuma criatura registrada. Finalize hunts para iniciar o Bestiary.</div>
          )}
        </div>

        <div className="bestiary-side">
          <BestiaryDetails progress={selectedProgress} />
          <CharmPanel
            bestiary={bestiary}
            onAssignCharm={onAssignCharm}
            onRemoveCharm={onRemoveCharm}
            onUnlockCharm={onUnlockCharm}
            selectedProgress={selectedProgress}
          />
        </div>
      </div>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
