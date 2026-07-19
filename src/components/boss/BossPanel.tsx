import { getAccessName } from "../../data/accesses";
import { getItemById } from "../../data/items";
import { BossActionPanel } from "./BossActionPanel";
import { BossCard } from "./BossCard";
import { BossCooldownList } from "./BossCooldownList";
import { BossResultPanel } from "./BossResultPanel";
import { PartyBuilder } from "./PartyBuilder";
import { ItemIcon } from "../items/ItemIcon";
import type {
  Boss,
  BossParty,
  BossSimulationResult,
  BossStatus,
  Character,
  PartyRole,
} from "../../shared/types";

interface BossPanelProps {
  bosses: Boss[];
  characters: Character[];
  guildGold: number;
  selectedCharacter: Character;
  selectedBoss?: Boss;
  party: BossParty;
  lastResult?: BossSimulationResult;
  showCatalog?: boolean;
  onSelectBoss: (boss: Boss) => void;
  onToggleMember: (characterId: string) => void;
  onChangeRole: (characterId: string, role: PartyRole) => void;
  onStartBoss: () => void;
  onFinishBoss: () => void;
  onCancelBoss: () => void;
}

export function BossPanel({
  bosses,
  characters,
  guildGold,
  selectedCharacter,
  selectedBoss,
  party,
  lastResult,
  showCatalog = true,
  onSelectBoss,
  onToggleMember,
  onChangeRole,
  onStartBoss,
  onFinishBoss,
  onCancelBoss,
}: BossPanelProps) {
  return (
    <div className="boss-panel raid-board">
      <section className="raid-board-hero">
        <i aria-hidden="true">R</i>
        <div>
          <span>Offline guild operation</span>
          <h3>{selectedBoss?.name ?? "Select a Raid Contract"}</h3>
          <p>{selectedBoss?.description ?? "Choose a boss contract before assembling the strike team."}</p>
        </div>
        <dl>
          <div><dt>Guild gold</dt><dd>{normalizeGold(guildGold).toLocaleString("en-US")}g</dd></div>
          <div><dt>Entry fee</dt><dd>{selectedBoss ? `${selectedBoss.entryCost.toLocaleString("en-US")}g` : "-"}</dd></div>
          <div><dt>Cooldown</dt><dd>{selectedBoss ? `${selectedBoss.cooldownHours}h` : "-"}</dd></div>
          <div><dt>Party</dt><dd>{selectedBoss ? `${selectedBoss.requirements.minPartySize}-${selectedBoss.requirements.maxPartySize}` : "-"}</dd></div>
        </dl>
      </section>

      <div className="boss-command-grid">
        <section className="boss-command-section">
          <header><span>Selected operation</span><h3>Raid Briefing</h3></header>
          <BossActionPanel
            boss={selectedBoss}
            characters={characters}
            guildGold={guildGold}
            onCancelBoss={onCancelBoss}
            onFinishBoss={onFinishBoss}
            onStartBoss={onStartBoss}
            party={party}
          />
        </section>
        <section className="boss-command-section">
          <header><span>Manual deployment</span><h3>Strike Team</h3></header>
          {selectedBoss ? (
            <PartyBuilder
              boss={selectedBoss}
              characters={characters}
              onChangeRole={onChangeRole}
              onToggleMember={onToggleMember}
              party={party}
            />
          ) : (
            <div className="empty-list">Select a boss to build a party.</div>
          )}
        </section>
      </div>

      {selectedBoss ? (
        <section className="raid-loot-table">
          <header>
            <div><span>Deterministic roll table</span><h3>Possible Guild Depot Loot</h3></div>
            <strong>{selectedBoss.reward.lootTable.length} entries</strong>
          </header>
          <div>
            {selectedBoss.reward.lootTable.map((entry) => {
              const item = getItemById(entry.itemId);
              return (
                <article key={entry.itemId}>
                  <ItemIcon item={item} showBadges={false} showQuantity={false} size="small" />
                  <div><strong>{item.name}</strong><small>{item.rarity} / x{entry.minQuantity}-{entry.maxQuantity}</small></div>
                  <b>{formatChance(entry.chance)}</b>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <div className="raid-board-secondary">
        <section className="boss-command-section">
          <header><span>Personal lockouts</span><h3>{selectedCharacter.name} Cooldowns</h3></header>
          <BossCooldownList bosses={bosses} character={selectedCharacter} />
        </section>
        <section className="boss-command-section">
          <header><span>Last resolved operation</span><h3>Raid Report</h3></header>
          <BossResultPanel characters={characters} result={lastResult} />
        </section>
      </div>

      {showCatalog ? (
        <div className="boss-list">
          {bosses.map((boss) => {
            const status = getBossStatus(selectedCharacter, boss);
            const reason = getBossReason(selectedCharacter, boss, status);
            return (
              <BossCard
                boss={boss}
                isSelected={selectedBoss?.id === boss.id}
                key={boss.id}
                onSelect={() => onSelectBoss(boss)}
                reason={reason}
                status={status}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function formatChance(chance: number) {
  const percent = Math.max(0, Math.min(100, chance * 100));
  return percent < 10 ? `${percent.toFixed(1)}%` : `${Math.round(percent)}%`;
}

function normalizeGold(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function getBossStatus(character: Character, boss: Boss): BossStatus {
  if (character.status === "bossing" && character.currentAction?.targetId === boss.id) return "in_progress";
  if (character.bossCooldowns.some((cooldown) => cooldown.bossId === boss.id && Date.parse(cooldown.availableAt) > Date.now())) return "cooldown";
  if (character.level < boss.requirements.requiredLevel) return "locked";
  if (boss.requirements.requiredAccessIds?.some((accessId) => !character.accessIds.includes(accessId))) return "locked";
  return "available";
}

function getBossReason(character: Character, boss: Boss, status: BossStatus) {
  if (status === "cooldown") return "Cooldown ativo.";
  if (status === "in_progress") return `${character.name} esta enfrentando este boss.`;
  if (status !== "locked") return undefined;
  if (character.level < boss.requirements.requiredLevel) return `Requer level ${boss.requirements.requiredLevel}.`;
  const missingAccess = boss.requirements.requiredAccessIds?.find((accessId) => !character.accessIds.includes(accessId));
  return missingAccess ? `Requer acesso: ${getAccessName(missingAccess)}.` : "Requisitos pendentes.";
}
