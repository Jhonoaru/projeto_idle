import type { CombatSkillEffectSummary, CombatSkillPartyEffectSummary } from "../../shared/types";
import { BossPhaseTimeline } from "../boss/BossPhaseTimeline";

interface CombatSkillReportProps {
  effects: CombatSkillEffectSummary;
  compact?: boolean;
}

export function CombatSkillReport({ effects, compact = false }: CombatSkillReportProps) {
  return (
    <div className={`combat-skill-report${compact ? " is-compact" : ""}`}>
      <div className="combat-skill-report-summary">
        <ReportMetric label="Damage" value={effects.totalDamage} detail={`${effects.damagePerMinute.toLocaleString("en-US")}/min / ${effects.totalConditionDamage.toLocaleString("en-US")} DoT / ${effects.hitRatePercent}% hit / -${effects.defenseMitigationPercent}% defense / ${formatElementalModifier(effects.elementalModifierPercent)}`} />
        <ReportMetric label="Healing" value={effects.totalHealing} detail={`${effects.healingPerMinute.toLocaleString("en-US")}/min`} />
        <ReportMetric label="Prevented" value={effects.totalDamagePrevented + effects.blockedDamage} detail={`${effects.blockedDamage.toLocaleString("en-US")} blocked / ${effects.incomingConditionPrevented} conditions prevented / ${effects.incomingConditionsCleansed} cleansed`} />
        <ReportMetric label="Mana" value={effects.manaSpent} detail={`${effects.totalCasts} casts / ${effects.totalCriticalHits} crits`} />
      </div>

      {effects.conditions.length > 0 ? (
        <div className="combat-condition-strip" aria-label="Applied combat conditions">
          {effects.conditions.map((condition) => (
            <span className={`is-${condition.type}`} key={condition.type}>
              <b>{conditionLabel(condition.type)}</b>
              <small>{condition.applications} applied / {condition.resisted} resisted / {condition.immuneHits} immune</small>
              <small>{condition.ticks > 0 ? `${condition.ticks} ticks / ${condition.damage.toLocaleString("en-US")} dmg` : `${condition.uptimePercent}% uptime / ${condition.potencyPercent}% power`} / {condition.averageEffectiveChancePercent}% chance</small>
              <small>{formatConditionResistanceProfile(condition)}</small>
            </span>
          ))}
        </div>
      ) : null}

      {effects.incomingConditionAttempts > 0 || effects.conditionProtectionUptimePercent > 0 ? (
        <div className="combat-condition-defense-strip" aria-label="Incoming condition defense">
          <div>
            <span>Condition Defense</span>
            <strong>{effects.incomingConditionPrevented} prevented / {effects.incomingConditionsCleansed} cleansed</strong>
            <small>{effects.averageConditionProtectionPercent}% protection / {effects.conditionProtectionUptimePercent}% uptime / -{effects.conditionDefenseRiskReductionPercent}% risk</small>
          </div>
          {effects.incomingConditions.map((condition) => (
            <span className={`is-${condition.type}`} key={condition.type}>
              <b>{conditionLabel(condition.type)}</b>
              <small>{condition.applications}/{condition.attempts} applied / {condition.prevented} prevented / {condition.cleansed} cleansed</small>
              <small>{condition.ticks > 0 ? `${condition.ticks} ticks / ${condition.damage.toLocaleString("en-US")} dmg` : `${condition.uptimePercent}% uptime`}</small>
            </span>
          ))}
        </div>
      ) : null}

      <div className="combat-skill-report-list" role="table" aria-label="Combat skill contribution report">
        <div className="combat-skill-report-row is-header" role="row">
          <span role="columnheader">Skill</span>
          <span role="columnheader">Hits/Casts</span>
          <span role="columnheader">Damage</span>
          <span role="columnheader">Healing</span>
          <span role="columnheader">Prevented</span>
        </div>
        {effects.entries.map((entry) => (
          <div className="combat-skill-report-row" role="row" key={entry.skillId}>
            <strong role="cell">{entry.skillName}</strong>
            <span role="cell">{entry.damageType ? `${entry.hits.toLocaleString("en-US")}/${entry.casts.toLocaleString("en-US")}` : `-/${entry.casts.toLocaleString("en-US")}`}</span>
            <span role="cell">{entry.damageDealt.toLocaleString("en-US")}</span>
            <span role="cell">{entry.healingDone.toLocaleString("en-US")}</span>
            <span role="cell">{formatEntryPrevention(entry)}</span>
          </div>
        ))}
      </div>

      {effects.timeline.events.length > 0 ? (
        <details className="combat-skill-timeline" open={!compact}>
          <summary>
            <span>Cast Timeline</span>
            <small>
              {effects.timeline.events.length} shown / {effects.timeline.totalEvents.toLocaleString("en-US")} casts
            </small>
          </summary>
          <div className="combat-skill-timeline-track" aria-hidden="true">
            {effects.timeline.events.map((event) => (
              <i
                className={`is-${event.category} is-${event.outcome}${event.critical ? " is-critical" : ""}${defenseClassName(event.defenseMitigationPercent)}${elementalClassName(event.elementalModifierPercent)}${conditionClassName(event)}`}
                key={`${event.sequence}-${event.skillId}`}
                style={{ left: `${event.progressPercent}%` }}
              />
            ))}
          </div>
          <div className="combat-skill-timeline-list" role="list" aria-label="Sampled combat cast events">
            {effects.timeline.events.map((event) => (
              <div className={`combat-skill-timeline-event is-${event.category} is-${event.outcome}${event.critical ? " is-critical" : ""}${defenseClassName(event.defenseMitigationPercent)}${elementalClassName(event.elementalModifierPercent)}${conditionClassName(event)}`} role="listitem" key={`${event.sequence}-${event.skillId}`}>
                <time>{formatElapsed(event.occurredAtMs)}</time>
                <div className="combat-skill-timeline-event-skill">
                  <span>{event.skillName}</span>
                  <small>{formatTarget(event)}{formatEventDefense(event)}{formatEventElement(event)}{formatEventCondition(event)}</small>
                </div>
                <strong>{formatEventContribution(event)}</strong>
                <small className="combat-skill-timeline-event-mana">{event.manaCost} mana</small>
              </div>
            ))}
          </div>
          {effects.timeline.omittedEvents > 0 ? (
            <p>{effects.timeline.omittedEvents.toLocaleString("en-US")} intermediate casts omitted from this sample.</p>
          ) : null}
        </details>
      ) : null}
    </div>
  );
}

export function PartyCombatSkillReport({ effects }: { effects: CombatSkillPartyEffectSummary }) {
  return (
    <div className="party-combat-skill-report">
      <div className="combat-skill-report-summary">
        <ReportMetric label="Party Damage" value={effects.totalDamage} detail={`${effects.totalConditionDamage.toLocaleString("en-US")} conditions / ${effects.hitRatePercent}% hit / -${effects.defenseMitigationPercent}% defense / ${effects.armorPenetrationPercent}% penetration / ${formatElementalModifier(effects.elementalModifierPercent)}`} />
        <ReportMetric label="Party Healing" value={effects.totalHealing} />
        <ReportMetric label="Party Prevented" value={effects.totalDamagePrevented + effects.blockedDamage} detail={`${effects.blockedDamage.toLocaleString("en-US")} blocked / ${effects.incomingConditionPrevented} conditions prevented / ${effects.incomingConditionsCleansed} cleansed`} />
        <ReportMetric label="Mana" value={effects.manaSpent} detail={`${effects.totalCasts} casts / ${effects.totalCriticalHits} crits / ${effects.totalConditionApplications} conditions`} />
      </div>
      {effects.threat.members.length > 0 ? (
        <>
          <div className="party-threat-strip" aria-label="Boss aggro distribution">
            <div>
              <span>Boss Aggro</span>
              <strong>{effects.threat.totalIncomingAttacks.toLocaleString("en-US")} attacks</strong>
              <small>{effects.threat.tankAggroControlPercent}% tank control / -{effects.threat.aggroRiskReductionPercent}% party risk</small>
            </div>
            {effects.threat.members.map((member) => (
              <span className={member.primaryTarget ? "is-primary" : ""} key={member.characterId}>
                <b>{member.characterName}</b>
                <small>{roleLabel(member.role)} / {member.threatPercent}% aggro</small>
                <small>{member.incomingAttacks.toLocaleString("en-US")} attacks / {formatRiskMultiplier(member.deathRiskMultiplier)}</small>
              </span>
            ))}
          </div>
          <BossPhaseTimeline threat={effects.threat} />
        </>
      ) : null}
      {effects.conditionSupportContributions.some((contribution) => contribution.cleansed > 0 || contribution.protectionUptimeSeconds > 0 || contribution.telegraphResponses > 0) ? (
        <div className="party-condition-support-strip" aria-label="Shared party condition support">
          <strong>Party Condition Support</strong>
          {effects.conditionSupportContributions.map((contribution) => (
            <span key={contribution.characterId}>
              <b>{contribution.characterName}</b>
              <small>{contribution.telegraphResponses} responses / {contribution.cleansed} cleansed / {formatSupportUptime(contribution.protectionUptimeSeconds)} ward coverage</small>
            </span>
          ))}
        </div>
      ) : null}
      {effects.bossDefensiveResponses.length > 0 ? (
        <div className="party-condition-support-strip" aria-label="Automatic Boss telegraph responses">
          <strong>Telegraph Responses</strong>
          {effects.bossDefensiveResponses.slice(0, 8).map((response) => (
            <span key={response.castId}>
              <b>{response.skillName} / {response.sourceCharacterName}</b>
              <small>{response.abilityName} on {response.targetCharacterName} / {response.responseType}</small>
            </span>
          ))}
        </div>
      ) : null}
      {effects.bossInterrupts.length > 0 ? (
        <div className="party-condition-support-strip" aria-label="Automatic Boss interrupts">
          <strong>Interrupt Attempts</strong>
          {effects.bossInterrupts.slice(0, 8).map((interrupt) => (
            <span key={interrupt.castId}>
              <b>{interrupt.skillName} / {interrupt.sourceCharacterName}</b>
              <small>{interrupt.abilityName} / {interrupt.interrupted ? "interrupted" : "resisted"} / {interrupt.successChancePercent}% chance</small>
            </span>
          ))}
        </div>
      ) : null}
      {effects.bossTelegraphDodges.length > 0 ? (
        <div className="party-condition-support-strip" aria-label="Automatic Boss telegraph dodges">
          <strong>Telegraph Dodges</strong>
          {effects.bossTelegraphDodges.slice(0, 8).map((dodge) => (
            <span key={dodge.castId}>
              <b>{dodge.targetCharacterName} / {dodge.dodged ? "dodged" : "caught"}</b>
              <small>{dodge.abilityName} / {dodge.successChancePercent}% chance / {dodge.reactionWindowSeconds}s reaction</small>
            </span>
          ))}
        </div>
      ) : null}
      {effects.members.map((member) => (
        <section key={member.characterId}>
          <header>
            <strong>{member.characterName}</strong>
            <span>{formatMemberAggro(effects, member.characterId)} / {member.effects.totalDamage.toLocaleString("en-US")} damage</span>
          </header>
          <CombatSkillReport effects={member.effects} compact />
        </section>
      ))}
    </div>
  );
}

function formatMemberAggro(effects: CombatSkillPartyEffectSummary, characterId: string) {
  const threat = effects.threat.members.find((member) => member.characterId === characterId);
  return threat ? `${threat.threatPercent}% aggro` : "No aggro";
}

function roleLabel(role: CombatSkillPartyEffectSummary["threat"]["members"][number]["role"]) {
  return role[0].toUpperCase() + role.slice(1);
}

function formatRiskMultiplier(multiplier: number) {
  const percent = Math.round((multiplier - 1) * 100);
  if (percent === 0) return "normal risk";
  return `${percent > 0 ? "+" : ""}${percent}% exposure risk`;
}

function formatSupportUptime(seconds: number) {
  const roundedSeconds = Math.round(seconds);
  if (roundedSeconds < 60) return `${roundedSeconds}s`;
  const minutes = Math.floor(roundedSeconds / 60);
  const remainingSeconds = roundedSeconds % 60;
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
}

function ReportMetric({ label, value, detail }: { label: string; value: number; detail?: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value.toLocaleString("en-US")}</strong>
      {detail ? <small>{detail}</small> : null}
    </div>
  );
}

function formatElapsed(elapsedMs: number) {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1_000));
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor(totalSeconds % 3_600 / 60);
  const seconds = totalSeconds % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatEventContribution(event: CombatSkillEffectSummary["timeline"]["events"][number]) {
  if (event.outcome === "miss") return "MISS";
  if (event.outcome === "dodged") return "DODGED";
  const parts = [
    event.damageDealt > 0 ? `${event.damageDealt.toLocaleString("en-US")} dmg` : "",
    event.conditionDamage > 0 ? `+${event.conditionDamage.toLocaleString("en-US")} DoT` : "",
    event.healingDone > 0 ? `${event.healingDone.toLocaleString("en-US")} heal` : "",
    event.damagePrevented > 0 ? `${event.damagePrevented.toLocaleString("en-US")} blocked` : "",
    event.conditionCleanseCount > 0 ? `cleanse ${event.conditionCleanseCount}` : "",
    event.conditionProtectionPercent > 0 ? `${event.conditionProtectionPercent}% ward / ${event.conditionProtectionDurationSeconds}s` : "",
  ].filter(Boolean);
  const contribution = parts.join(" / ") || "Utility cast";
  return event.critical ? `CRIT / ${contribution}` : contribution;
}

function formatEntryPrevention(entry: CombatSkillEffectSummary["entries"][number]) {
  const parts = [
    entry.damagePrevented > 0 ? entry.damagePrevented.toLocaleString("en-US") : "",
    entry.conditionsCleansed > 0 ? `${entry.conditionsCleansed} cleanse` : "",
    entry.conditionProtectionUptimeSeconds > 0 ? `${entry.conditionProtectionUptimeSeconds}s ward` : "",
  ].filter(Boolean);
  return parts.join(" / ") || "0";
}

function formatTarget(event: CombatSkillEffectSummary["timeline"]["events"][number]) {
  if (event.targetKind === "self") return "Self";
  return event.targetName;
}

function formatEventElement(event: CombatSkillEffectSummary["timeline"]["events"][number]) {
  if (!event.damageType || event.baseDamageDealt <= 0) return "";
  const type = event.damageType[0].toUpperCase() + event.damageType.slice(1);
  if (event.elementalModifierPercent > 0) return ` / ${type} weak +${event.elementalModifierPercent}%`;
  if (event.elementalModifierPercent < 0) return ` / ${type} resisted ${event.elementalModifierPercent}%`;
  return ` / ${type} neutral`;
}

function formatEventDefense(event: CombatSkillEffectSummary["timeline"]["events"][number]) {
  if (event.outcome !== "hit" || event.baseDamageDealt <= 0) return "";
  return ` / Defense -${event.defenseMitigationPercent}% (${event.armorPenetrationPercent}% pen)`;
}

function formatEventCondition(event: CombatSkillEffectSummary["timeline"]["events"][number]) {
  if (!event.conditionType || event.outcome !== "hit") return "";
  const label = conditionLabel(event.conditionType);
  const chance = `${event.conditionEffectiveChancePercent}% effective`;
  const resistance = formatEventConditionResistance(event);
  if (event.conditionOutcome === "immune") return ` / ${label} immune${event.conditionResistancePenetrationPercent > 0 ? ` / ${event.conditionResistancePenetrationPercent}% pen blocked` : ""}`;
  if (event.conditionOutcome === "resisted") return ` / ${label} resisted (${chance}${resistance})`;
  if (!event.conditionApplied) return ` / ${label} failed (${chance}${resistance})`;
  if (event.conditionType === "slow") return ` / ${label} ${event.conditionDurationSeconds}s at ${event.conditionPotencyPercent}% / ${chance}${resistance}`;
  return ` / ${label} ${event.conditionTicks} ticks, ${event.conditionDamage.toLocaleString("en-US")} dmg / ${chance}${resistance}`;
}

function conditionLabel(type: NonNullable<CombatSkillEffectSummary["entries"][number]["conditionType"]>) {
  return type[0].toUpperCase() + type.slice(1);
}

function conditionClassName(event: CombatSkillEffectSummary["timeline"]["events"][number]) {
  if (event.conditionOutcome === "immune") return " is-condition-immune";
  if (event.conditionOutcome === "resisted") return " is-condition-resisted";
  return event.conditionApplied && event.conditionType ? ` is-condition-${event.conditionType}` : "";
}

function formatEventConditionResistance(event: CombatSkillEffectSummary["timeline"]["events"][number]) {
  const penetration = event.conditionResistancePenetrationPercent;
  const resistance = event.conditionResistancePercent;
  if (resistance < 0) return ` / ${resistance}% vulnerability${penetration > 0 ? ` / ${penetration}% pen unused` : ""}`;
  if (resistance > 0) return ` / ${resistance}% resist -> ${event.conditionEffectiveResistancePercent}% / ${penetration}% pen`;
  return penetration > 0 ? ` / neutral resist / ${penetration}% pen` : " / neutral resist";
}

function formatConditionResistanceProfile(condition: CombatSkillEffectSummary["conditions"][number]) {
  if (condition.averageResistancePercent < 0) {
    return `${condition.averageResistancePercent}% vulnerability${condition.averageResistancePenetrationPercent > 0 ? ` / ${condition.averageResistancePenetrationPercent}% pen unused` : ""}`;
  }
  if (condition.averageResistancePercent > 0) {
    return `${condition.averageResistancePercent}% resist -> ${condition.averageEffectiveResistancePercent}% / ${condition.averageResistancePenetrationPercent}% pen`;
  }
  return `Neutral resist / ${condition.averageResistancePenetrationPercent}% pen`;
}

function formatElementalModifier(value: number) {
  if (value > 0) return `+${value}% elemental`;
  if (value < 0) return `${value}% elemental`;
  return "neutral elemental";
}

function elementalClassName(value: number) {
  if (value > 0) return " is-weakness";
  if (value < 0) return " is-resistant";
  return "";
}

function defenseClassName(value: number) {
  return value > 0 ? " is-armored" : "";
}
