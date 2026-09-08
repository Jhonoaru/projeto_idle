import { getBestiaryThreshold } from "../../data/bestiaryThresholds";
import { monsters } from "../../data/monsters";
import { getItemById } from "../../data/items";
import type { MonsterBestiaryProgress } from "../../shared/types";
import { CreatureSprite } from "../creatures/CreatureSprite";
import { ItemIcon } from "../items/ItemIcon";

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
  const lootRevealed = Boolean(monster && (progress.stage === "revealed" || progress.stage === "completed"));

  return (
    <div className="bestiary-details">
      <div className="bestiary-dossier-identity">
        <CreatureSprite
          className="bestiary-dossier-sigil"
          fallbackSymbol={sigil}
          monster={monster}
          size="large"
        />
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
      <section className="bestiary-dossier-loot">
        <header><span>Field loot</span><strong>{lootRevealed ? `${monster!.lootTable.length} known` : "Classified"}</strong></header>
        {lootRevealed ? (
          <div className="bestiary-loot-grid">
            {monster!.lootTable.map((drop) => {
              const item = getItemById(drop.itemId);
              if (!item) return null;
              return (
                <article key={drop.itemId} title={`${item.name}: ${formatDropChance(drop.chance)} chance`}>
                  <ItemIcon item={item} showBadges={false} showQuantity={false} showRarity={false} size="small" />
                  <div><strong>{item.name}</strong><small>{formatDropChance(drop.chance)} / {formatQuantity(drop.minQuantity, drop.maxQuantity)}</small></div>
                </article>
              );
            })}
          </div>
        ) : (
          <p>Reach {threshold.revealKills.toLocaleString("en-US")} kills to reveal this creature's loot record.</p>
        )}
      </section>
    </div>
  );
}

function DossierStat({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function formatDropChance(chance: number) {
  const percent = chance * 100;
  return `${percent >= 1 ? percent.toFixed(percent % 1 === 0 ? 0 : 1) : percent.toFixed(2)}%`;
}

function formatQuantity(minimum: number, maximum: number) {
  return minimum === maximum ? `x${minimum}` : `x${minimum}-${maximum}`;
}
