import { getAccessName } from "../../data/accesses";
import { BossActionPanel } from "./BossActionPanel";
import { BossCard } from "./BossCard";
import { BossCooldownList } from "./BossCooldownList";
import { BossResultPanel } from "./BossResultPanel";
import { PartyBuilder } from "./PartyBuilder";
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
  selectedCharacter: Character;
  selectedBoss?: Boss;
  party: BossParty;
  lastResult?: BossSimulationResult;
  onSelectBoss: (boss: Boss) => void;
  onToggleMember: (characterId: string) => void;
  onChangeRole: (characterId: string, role: PartyRole) => void;
  onStartBoss: () => void;
  onFinishBoss: () => void;
  onCancelBoss: () => void;
  onClearCooldown: (characterId: string, bossId: string) => void;
}

export function BossPanel({
  bosses,
  characters,
  selectedCharacter,
  selectedBoss,
  party,
  lastResult,
  onSelectBoss,
  onToggleMember,
  onChangeRole,
  onStartBoss,
  onFinishBoss,
  onCancelBoss,
  onClearCooldown,
}: BossPanelProps) {
  return (
    <div className="boss-panel">
      <div className="boss-command-grid">
        <section className="boss-command-section">
          <h3>Boss Assignment</h3>
          <BossActionPanel
            boss={selectedBoss}
            characters={characters}
            onCancelBoss={onCancelBoss}
            onFinishBoss={onFinishBoss}
            onStartBoss={onStartBoss}
            party={party}
          />
        </section>
        <section className="boss-command-section">
          <h3>Party Builder</h3>
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

      <section className="boss-command-section">
        <h3>{selectedCharacter.name} Boss Cooldowns</h3>
        <BossCooldownList
          bosses={bosses}
          character={selectedCharacter}
          onClearCooldown={onClearCooldown}
        />
      </section>

      <section className="boss-command-section">
        <h3>Boss Result</h3>
        <BossResultPanel characters={characters} result={lastResult} />
      </section>

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
    </div>
  );
}

function getBossStatus(character: Character, boss: Boss): BossStatus {
  if (character.status === "bossing" && character.currentAction?.targetId === boss.id) {
    return "in_progress";
  }

  if (
    character.bossCooldowns.some(
      (cooldown) =>
        cooldown.bossId === boss.id && new Date(cooldown.availableAt).getTime() > Date.now(),
    )
  ) {
    return "cooldown";
  }

  if (character.level < boss.requirements.requiredLevel) {
    return "locked";
  }

  const missingAccess = boss.requirements.requiredAccessIds?.some(
    (accessId) => !character.accessIds.includes(accessId),
  );

  if (missingAccess) {
    return "locked";
  }

  return "available";
}

function getBossReason(character: Character, boss: Boss, status: BossStatus) {
  if (status === "cooldown") return "Cooldown ativo.";
  if (status === "in_progress") return `${character.name} esta enfrentando este boss.`;
  if (status !== "locked") return undefined;

  if (character.level < boss.requirements.requiredLevel) {
    return `Requer level ${boss.requirements.requiredLevel}.`;
  }

  const missingAccess = boss.requirements.requiredAccessIds?.find(
    (accessId) => !character.accessIds.includes(accessId),
  );

  if (missingAccess) {
    return `Requer acesso: ${getAccessName(missingAccess)}.`;
  }

  return "Requisitos pendentes.";
}
