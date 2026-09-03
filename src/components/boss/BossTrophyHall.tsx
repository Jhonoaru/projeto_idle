import { buildBossTrophyHall, getBossTrophyTierLabel } from "../../game-engine/boss/buildBossTrophyHall";
import type { Boss, Guild } from "../../shared/types";
import { BossSprite } from "./BossSprite";
import { CollectionPreview } from "../collections/CollectionPreview";

interface BossTrophyHallProps {
  bosses: Boss[];
  guild: Guild;
  selectedBoss?: Boss;
  onClaimReward: (rewardId: string) => void;
  onSelectBoss: (boss: Boss) => void;
}

export function BossTrophyHall({ bosses, guild, selectedBoss, onClaimReward, onSelectBoss }: BossTrophyHallProps) {
  const hall = buildBossTrophyHall(guild, bosses);
  const selected = hall.wings.find((wing) => wing.boss.id === selectedBoss?.id) ?? hall.wings[0];
  if (!selected) return null;
  return (
    <section className="boss-trophy-hall">
      <header>
        <div><span>Permanent cosmetic archive</span><h3>Boss Trophy Hall</h3></div>
        <dl>
          <div><dt>Archived</dt><dd>{hall.claimedCount}/{hall.totalRewards}</dd></div>
          <div className={hall.availableCount > 0 ? "has-ready" : ""}><dt>Available</dt><dd>{hall.availableCount}</dd></div>
          <div><dt>Boss wings</dt><dd>{hall.wings.length}</dd></div>
        </dl>
      </header>
      <nav aria-label="Boss Trophy Hall wings" className="boss-trophy-wings">
        {hall.wings.map((wing) => (
          <button aria-pressed={wing.boss.id === selected.boss.id} key={wing.boss.id} onClick={() => onSelectBoss(wing.boss)} type="button">
            <BossSprite boss={wing.boss} fallbackSymbol="T" size="small" />
            <span><strong>{wing.boss.name}</strong><small>{wing.claimedCount}/3 archived</small></span>
            {wing.availableCount > 0 ? <b title={`${wing.availableCount} reward available`}>!</b> : null}
          </button>
        ))}
      </nav>
      <div className="boss-trophy-display">
        <header>
          <BossSprite boss={selected.boss} fallbackSymbol="T" size="medium" />
          <div><span>{selected.boss.city} trophy wing</span><h4>{selected.boss.name}</h4><small>Cosmetic honors only. No combat statistics are granted.</small></div>
          <strong>{selected.claimedCount}/3</strong>
        </header>
        <div className="boss-trophy-rewards">
          {selected.rewards.map((reward) => {
            const state = reward.claimed ? "claimed" : reward.available ? "available" : "locked";
            return (
              <article className={`is-${state}`} key={reward.definition.id}>
                <span>{getBossTrophyTierLabel(reward.definition.tier)}</span>
                <i aria-hidden="true"><CollectionPreview item={reward.collectionItem} /></i>
                <strong>{reward.collectionItem?.name ?? reward.definition.label}</strong>
                <small>{reward.definition.description}</small>
                <button disabled={!reward.available} onClick={() => onClaimReward(reward.definition.id)} type="button">
                  {reward.claimed ? "Archived" : reward.available ? "Claim reward" : reward.eligible ? "Claim prior tier" : "Locked"}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
