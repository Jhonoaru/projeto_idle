import { getBestiaryThreshold } from "../../data/bestiaryThresholds";
import { monsters } from "../../data/monsters";
import type { MonsterBestiaryProgress } from "../../shared/types";

interface BestiaryDetailsProps {
  progress?: MonsterBestiaryProgress;
}

const monsterList = Object.values(monsters);

export function BestiaryDetails({ progress }: BestiaryDetailsProps) {
  if (!progress) {
    return <div className="empty-list">Selecione uma criatura vista pela guilda.</div>;
  }

  const monster = monsterList.find((candidate) => candidate.id === progress.monsterId);
  const threshold = getBestiaryThreshold(monster ?? { level: 1 });
  const displayName = monster?.name ?? progress.monsterName ?? "Unknown Creature";

  return (
    <div className="bestiary-details">
      <div>
        <span>Criatura</span>
        <strong>{displayName}</strong>
      </div>
      <div>
        <span>Stage</span>
        <strong>{progress.stage}</strong>
      </div>
      <div>
        <span>Kills</span>
        <strong>{progress.kills.toLocaleString("en-US")} / {threshold.completeKills.toLocaleString("en-US")}</strong>
      </div>
      <div>
        <span>Reveal</span>
        <strong>{threshold.revealKills.toLocaleString("en-US")}</strong>
      </div>
      <div>
        <span>Charm Reward</span>
        <strong>{threshold.charmPointsReward}</strong>
      </div>
      {monster && progress.stage !== "started" ? (
        <>
          <div>
            <span>Level</span>
            <strong>{monster.level}</strong>
          </div>
          <div>
            <span>XP</span>
            <strong>{monster.experience}</strong>
          </div>
          <div>
            <span>Gold</span>
            <strong>{monster.goldMin}-{monster.goldMax}</strong>
          </div>
        </>
      ) : null}
    </div>
  );
}
