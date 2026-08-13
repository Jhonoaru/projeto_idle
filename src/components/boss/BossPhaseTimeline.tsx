import type { BossThreatSummary } from "../../shared/types";

interface BossPhaseTimelineProps {
  threat: BossThreatSummary;
  progressPercent?: number;
  compact?: boolean;
}

export function BossPhaseTimeline({ threat, progressPercent, compact = false }: BossPhaseTimelineProps) {
  if (threat.phases.length <= 1) return null;
  const progress = clamp(progressPercent ?? -1, -1, 100);

  return (
    <div className={`boss-phase-timeline${compact ? " is-compact" : ""}`} aria-label="Boss phase and target timeline">
      <header>
        <span>Encounter phases</span>
        <strong>{threat.baseIncomingAttacks} → {threat.totalIncomingAttacks} attacks / {threat.attackPressurePercent}% pressure</strong>
      </header>
      <div>
        {threat.phases.map((phase) => {
          const primary = phase.members.find((member) => member.characterId === phase.primaryTargetCharacterId);
          const active = progress >= phase.startPercent && (progress < phase.endPercent || phase.endPercent === 100 && progress === 100);
          const completed = progress >= phase.endPercent;
          return (
            <article className={`${active ? "is-active" : ""}${completed ? " is-complete" : ""}`} key={phase.phaseId} style={{ flexGrow: Math.max(1, phase.endPercent - phase.startPercent) }}>
              <i />
              <span>{Math.round(phase.startPercent)}-{Math.round(phase.endPercent)}%</span>
              <b>{phase.phaseName}</b>
              <small>{primary ? `${primary.characterName} / ${primary.role}` : "No target"}</small>
              <small className="boss-phase-pressure">{formatMultiplier(phase.attackRateMultiplier)} rate / {formatMultiplier(phase.incomingDamageMultiplier)} damage / {formatMultiplier(phase.conditionChanceMultiplier)} condition</small>
              {phase.specialAbility ? (
                <small className="boss-phase-ability" title={phase.specialAbility.description}>
                  Ability: {phase.specialAbility.name}{phase.specialAbility.conditionAttack ? ` / ${phase.specialAbility.conditionAttack.type}` : ""} / {formatSeconds(phase.specialAbility.castTimeSeconds)} cast / {phase.specialAbility.interruptResistancePercent}% resist / {formatSeconds(phase.specialAbility.cooldownSeconds)} CD / {phase.abilityCasts.length} uses
                </small>
              ) : null}
              {!compact ? <p>{phase.description}</p> : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function formatMultiplier(value: number) {
  return `${value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}x`;
}

function formatSeconds(value = 0) {
  return `${Number(value.toFixed(1))}s`;
}

export function getActiveBossPhase(threat: BossThreatSummary, progressPercent: number) {
  const progress = clamp(progressPercent, 0, 100);
  return threat.phases.find((phase) => progress >= phase.startPercent && (
    progress < phase.endPercent || phase.endPercent === 100 && progress === 100
  )) ?? threat.phases.at(-1);
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}
