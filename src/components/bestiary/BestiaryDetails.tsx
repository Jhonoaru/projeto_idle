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
  const percent = Math.min(100, Math.max(0, Math.round((progress.kills / threshold.completeKills) * 100)));
  const sigil = displayName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="bestiary-details">
      <div className="bestiary-dossier-identity">
        <span className="bestiary-dossier-sigil">{sigil}</span>
        <div>
          <span>{progress.stage} record</span>
          <strong>{displayName}</strong>
          <small>{monster && progress.stage !== "started" ? `Level ${monster.level}` : "Classification pending"}</small>
        </div>
      </div>
      <div className="bestiary-dossier-progress">
        <div><span>Research progress</span><strong>{percent}%</strong></div>
        <i><b style={{ width: `${percent}%` }} /></i>
        <small>{progress.kills.toLocaleString("en-US")} / {threshold.completeKills.toLocaleString("en-US")} kills</small>
      </div>
      <div className="bestiary-dossier-stats">
        <DossierStat label="Reveal at" value={`${threshold.revealKills} kills`} />
        <DossierStat label="Charm reward" value={`${threshold.charmPointsReward} pts`} />
        <DossierStat label="Reward" value={progress.charmPointsClaimed ? "Claimed" : progress.stage === "completed" ? "Available" : "Locked"} />
        <DossierStat label="Experience" value={monster && progress.stage !== "started" ? `${monster.experience}` : "Unknown"} />
        <DossierStat label="Gold range" value={monster && progress.stage !== "started" ? `${monster.goldMin}-${monster.goldMax}` : "Unknown"} />
        <DossierStat label="Knowledge" value={progress.stage === "completed" ? "Complete" : progress.stage === "revealed" ? "Revealed" : "Tracking"} />
      </div>
    </div>
  );
}

function DossierStat({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}
