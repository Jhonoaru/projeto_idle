import { getItemById } from "../../data/items";
import { buildBossRaidCodex, getBossRaidCodexStatusLabel } from "../../game-engine/boss/buildBossRaidCodex";
import type { Boss, Guild } from "../../shared/types";
import { ItemIcon } from "../items/ItemIcon";
import { BossSprite } from "./BossSprite";

interface RaidCodexProps {
  bosses: Boss[];
  guild: Guild;
  selectedBoss?: Boss;
  onSelectBoss: (boss: Boss) => void;
}

export function RaidCodex({ bosses, guild, selectedBoss, onSelectBoss }: RaidCodexProps) {
  const codex = buildBossRaidCodex(guild, bosses);
  const selected = codex.entries.find((entry) => entry.boss.id === selectedBoss?.id) ?? codex.entries[0];
  if (!selected) return null;
  return (
    <section className="raid-codex">
      <header>
        <div><span>Persistent operation archive</span><h3>Raid Codex</h3></div>
        <dl>
          <div><dt>Conquered</dt><dd>{codex.summary.conquered}/{bosses.length}</dd></div>
          <div><dt>Mastered</dt><dd>{codex.summary.mastered}</dd></div>
          <div><dt>Attempts</dt><dd>{codex.summary.trackedAttempts}</dd></div>
          <div><dt>Win rate</dt><dd>{codex.summary.winRatePercent}%</dd></div>
        </dl>
      </header>

      <nav aria-label="Raid Codex bosses" className="raid-codex-index">
        {codex.entries.map((entry) => (
          <button
            aria-pressed={entry.boss.id === selected.boss.id}
            className={`status-${entry.status}`}
            key={entry.boss.id}
            onClick={() => onSelectBoss(entry.boss)}
            type="button"
          >
            <BossSprite boss={entry.boss} fallbackSymbol="B" size="small" />
            <span><strong>{entry.boss.name}</strong><small>{getBossRaidCodexStatusLabel(entry.status)}</small></span>
            <b>{entry.defeats}/{entry.attempts}</b>
          </button>
        ))}
      </nav>

      <article className={`raid-codex-dossier status-${selected.status}`}>
        <header>
          <BossSprite boss={selected.boss} fallbackSymbol="B" size="small" />
          <div><span>{selected.boss.city} archive</span><h4>{selected.boss.name}</h4></div>
          <strong>{getBossRaidCodexStatusLabel(selected.status)}</strong>
        </header>
        <dl className="raid-codex-metrics">
          <div><dt>Attempts</dt><dd>{selected.attempts}</dd></div>
          <div><dt>Victories</dt><dd>{selected.defeats}</dd></div>
          <div><dt>Win rate</dt><dd>{selected.winRatePercent}%</dd></div>
          <div><dt>Net settlement</dt><dd className={selected.netGold >= 0 ? "is-positive" : "is-negative"}>{formatSignedGold(selected.netGold)}</dd></div>
          <div><dt>Experience</dt><dd>{selected.totalExperienceGained.toLocaleString("en-US")}</dd></div>
          <div><dt>Renown</dt><dd>{selected.totalRenownGained.toLocaleString("en-US")}</dd></div>
          <div><dt>Perfect</dt><dd>{selected.totalPerfectReactions}</dd></div>
          <div><dt>Best chain</dt><dd>x{selected.bestPerfectChain}</dd></div>
        </dl>
        <div className="raid-codex-ledgers">
          <section>
            <header><span>Recovered spoils</span><strong>{selected.lootTotals.length} discovered</strong></header>
            <div className="raid-codex-loot">
              {selected.lootTotals.length > 0 ? selected.lootTotals.map((loot) => {
                const item = getItemById(loot.itemId);
                return <div key={loot.itemId}><ItemIcon item={item} showBadges={false} showQuantity={false} size="small" /><span><strong>{item.name}</strong><small>x{loot.quantity.toLocaleString("en-US")}</small></span></div>;
              }) : <p>No recovered loot recorded.</p>}
            </div>
          </section>
          <section>
            <header><span>Recent operations</span><strong>{selected.recentOutcomes.length} retained</strong></header>
            <div className="raid-codex-history">
              {selected.recentOutcomes.length > 0 ? selected.recentOutcomes.map((outcome) => (
                <div className={outcome.defeated ? "is-victory" : "is-defeat"} key={outcome.id}>
                  <span><strong>{outcome.defeated ? "Victory" : "Defeat"}</strong><small>{formatDate(outcome.completedAt)}</small></span>
                  <b>{formatSignedGold(outcome.goldGained - outcome.goldLost - outcome.entryCost)}</b>
                </div>
              )) : <p>No operation history recorded.</p>}
            </div>
          </section>
        </div>
        <footer>
          <span>Last attempt</span><strong>{selected.lastAttemptAt ? formatDate(selected.lastAttemptAt) : "Not attempted"}</strong>
          <span>Qualified execution victories</span><strong>{selected.qualifiedVictories}</strong>
        </footer>
      </article>
    </section>
  );
}

function formatSignedGold(value: number) {
  const rounded = Number.isFinite(value) ? Math.trunc(value) : 0;
  return `${rounded > 0 ? "+" : ""}${rounded.toLocaleString("en-US")}g`;
}

function formatDate(value: string) {
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Unknown";
}
