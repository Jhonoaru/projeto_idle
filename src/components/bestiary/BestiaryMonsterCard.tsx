import { getBestiaryThreshold } from "../../data/bestiaryThresholds";
import { monsters } from "../../data/monsters";
import type { ActiveCharmAssignment, MonsterBestiaryProgress } from "../../shared/types";

interface BestiaryMonsterCardProps {
  progress: MonsterBestiaryProgress;
  activeCharm?: ActiveCharmAssignment;
  charmName?: string;
  isSelected: boolean;
  onSelect: () => void;
  onClaimReward: () => void;
}

const monsterList = Object.values(monsters);

export function BestiaryMonsterCard({
  progress,
  activeCharm,
  charmName,
  isSelected,
  onSelect,
  onClaimReward,
}: BestiaryMonsterCardProps) {
  const monster = monsterList.find((candidate) => candidate.id === progress.monsterId);
  const threshold = getBestiaryThreshold(monster ?? { level: 1 });
  const percent = Math.min(100, Math.max(0, Math.round((progress.kills / threshold.completeKills) * 100)));
  const canClaim = progress.stage === "completed" && !progress.charmPointsClaimed;
  const displayName = monster?.name ?? progress.monsterName ?? "Unknown Creature";

  return (
    <div
      className={`bestiary-card${isSelected ? " is-selected" : ""}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onSelect();
      }}
    >
      <div>
        <span>{progress.stage}</span>
        <strong>{displayName}</strong>
        <em>{progress.kills.toLocaleString("en-US")} / {threshold.completeKills.toLocaleString("en-US")}</em>
      </div>
      <div className="bestiary-progress-track" aria-hidden="true">
        <span style={{ width: `${percent}%` }} />
      </div>
      <div className="bestiary-card-footer">
        <span>{progress.charmPointsClaimed ? "Reward claimed" : `${threshold.charmPointsReward} charm pts`}</span>
        <span>{activeCharm ? charmName ?? activeCharm.charmId : "No charm"}</span>
      </div>
      {canClaim ? (
        <button
          className="bestiary-inline-button"
          onClick={(event) => {
            event.stopPropagation();
            onClaimReward();
          }}
          type="button"
        >
          Claim Reward
        </button>
      ) : null}
    </div>
  );
}
