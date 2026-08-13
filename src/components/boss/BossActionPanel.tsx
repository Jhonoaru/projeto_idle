import { calculateBossRisk } from "../../game-engine/boss/calculateBossRisk";
import { calculateBossPartyThreat } from "../../game-engine/boss/calculateBossThreat";
import { canStartBoss } from "../../game-engine/boss/canStartBoss";
import { GameButton } from "../ui/GameButton";
import type { Boss, BossParty, Character } from "../../shared/types";

interface BossActionPanelProps {
  boss?: Boss;
  characters: Character[];
  guildGold: number;
  party: BossParty;
  onStartBoss: () => void;
  onFinishBoss: () => void;
  onCancelBoss: () => void;
}

export function BossActionPanel({
  boss,
  characters,
  guildGold,
  party,
  onStartBoss,
  onFinishBoss,
  onCancelBoss,
}: BossActionPanelProps) {
  if (!boss) {
    return <div className="hunt-action-empty">Select a boss contract.</div>;
  }

  const threat = calculateBossPartyThreat(characters, party, boss);
  const risk = calculateBossRisk(characters, party, boss, {
    attackBonusPercent: 0,
    deathRiskReductionPercent: 0,
    threat,
  });
  const validation = canStartBoss(characters, boss, party, guildGold);
  const isInProgress = party.members.some((member) => {
    const character = characters.find((candidate) => candidate.id === member.characterId);
    return character?.status === "bossing" && character.currentAction?.targetId === boss.id;
  });
  const partyNames = party.members
    .map((member) => characters.find((character) => character.id === member.characterId)?.name)
    .filter(Boolean)
    .join(", ");

  return (
    <div className="boss-action-panel">
      <div className="assignment-summary">
        <div>
          <span>Boss</span>
          <strong>{boss.name}</strong>
        </div>
        <div>
          <span>Party</span>
          <strong>{partyNames || "No party"}</strong>
        </div>
        <div>
          <span>Success</span>
          <strong>{Math.round(risk.successChance * 100)}%</strong>
        </div>
        <div>
          <span>Death</span>
          <strong>{Math.round(risk.deathChance * 100)}%</strong>
        </div>
      </div>

      {threat.members.length > 0 ? (
        <div className="party-threat-strip is-preview" aria-label="Projected boss aggro">
          <div>
            <span>Projected Aggro</span>
            <strong>{threat.totalIncomingAttacks.toLocaleString("en-US")} attacks</strong>
            <small>{threat.tankAggroControlPercent}% tank control / -{threat.aggroRiskReductionPercent}% risk</small>
          </div>
          {threat.members.map((member) => (
            <span className={member.primaryTarget ? "is-primary" : ""} key={member.characterId}>
              <b>{member.characterName}</b>
              <small>{member.role} / {member.threatPercent}%</small>
              <small>{member.incomingAttacks.toLocaleString("en-US")} incoming</small>
            </span>
          ))}
        </div>
      ) : null}

      <div className="assignment-summary">
        <div>
          <span>Power</span>
          <strong>{risk.power.totalPower}</strong>
        </div>
        <div>
          <span>Target</span>
          <strong>{risk.power.targetPower}</strong>
        </div>
        <div>
          <span>Offense</span>
          <strong>{risk.power.offense}</strong>
        </div>
        <div>
          <span>Survival</span>
          <strong>{risk.power.survival}</strong>
        </div>
        <div>
          <span>Entry fee</span>
          <strong>{boss.entryCost.toLocaleString("en-US")}g</strong>
        </div>
        <div>
          <span>Guild balance</span>
          <strong>{normalizeGold(guildGold).toLocaleString("en-US")}g</strong>
        </div>
      </div>

      {risk.warnings.length > 0 ? (
        <div className="boss-warning-list">
          {risk.warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      ) : null}

      {!validation.canStart && !isInProgress ? (
        <p className="action-block-reason">{validation.reason}</p>
      ) : null}

      <div className="hunt-action-buttons">
        <GameButton disabled={!validation.canStart || isInProgress} onClick={onStartBoss}>
          Launch Raid
        </GameButton>
        <GameButton disabled={!isInProgress} onClick={onFinishBoss}>
          Collect Raid Report
        </GameButton>
        <GameButton disabled={!isInProgress} onClick={onCancelBoss}>
          Abort and Return
        </GameButton>
      </div>
    </div>
  );
}

function normalizeGold(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}
