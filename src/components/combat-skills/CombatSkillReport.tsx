import type { CombatSkillEffectSummary, CombatSkillPartyEffectSummary } from "../../shared/types";

interface CombatSkillReportProps {
  effects: CombatSkillEffectSummary;
  compact?: boolean;
}

export function CombatSkillReport({ effects, compact = false }: CombatSkillReportProps) {
  return (
    <div className={`combat-skill-report${compact ? " is-compact" : ""}`}>
      <div className="combat-skill-report-summary">
        <ReportMetric label="Damage" value={effects.totalDamage} detail={`${effects.damagePerMinute.toLocaleString("en-US")}/min / ${formatElementalModifier(effects.elementalModifierPercent)}`} />
        <ReportMetric label="Healing" value={effects.totalHealing} detail={`${effects.healingPerMinute.toLocaleString("en-US")}/min`} />
        <ReportMetric label="Prevented" value={effects.totalDamagePrevented} />
        <ReportMetric label="Mana" value={effects.manaSpent} detail={`${effects.totalCasts} casts / ${effects.totalCriticalHits} crits`} />
      </div>

      <div className="combat-skill-report-list" role="table" aria-label="Combat skill contribution report">
        <div className="combat-skill-report-row is-header" role="row">
          <span role="columnheader">Skill</span>
          <span role="columnheader">Casts</span>
          <span role="columnheader">Damage</span>
          <span role="columnheader">Healing</span>
          <span role="columnheader">Prevented</span>
        </div>
        {effects.entries.map((entry) => (
          <div className="combat-skill-report-row" role="row" key={entry.skillId}>
            <strong role="cell">{entry.skillName}</strong>
            <span role="cell">{entry.casts.toLocaleString("en-US")}</span>
            <span role="cell">{entry.damageDealt.toLocaleString("en-US")}</span>
            <span role="cell">{entry.healingDone.toLocaleString("en-US")}</span>
            <span role="cell">{entry.damagePrevented.toLocaleString("en-US")}</span>
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
                className={`is-${event.category}${event.critical ? " is-critical" : ""}${elementalClassName(event.elementalModifierPercent)}`}
                key={`${event.sequence}-${event.skillId}`}
                style={{ left: `${event.progressPercent}%` }}
              />
            ))}
          </div>
          <div className="combat-skill-timeline-list" role="list" aria-label="Sampled combat cast events">
            {effects.timeline.events.map((event) => (
              <div className={`combat-skill-timeline-event is-${event.category}${event.critical ? " is-critical" : ""}${elementalClassName(event.elementalModifierPercent)}`} role="listitem" key={`${event.sequence}-${event.skillId}`}>
                <time>{formatElapsed(event.occurredAtMs)}</time>
                <div className="combat-skill-timeline-event-skill">
                  <span>{event.skillName}</span>
                  <small>{formatTarget(event)}{formatEventElement(event)}</small>
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
        <ReportMetric label="Party Damage" value={effects.totalDamage} detail={formatElementalModifier(effects.elementalModifierPercent)} />
        <ReportMetric label="Party Healing" value={effects.totalHealing} />
        <ReportMetric label="Party Prevented" value={effects.totalDamagePrevented} />
        <ReportMetric label="Mana" value={effects.manaSpent} detail={`${effects.totalCasts} casts / ${effects.totalCriticalHits} crits`} />
      </div>
      {effects.members.map((member) => (
        <section key={member.characterId}>
          <header>
            <strong>{member.characterName}</strong>
            <span>{member.effects.totalDamage.toLocaleString("en-US")} damage</span>
          </header>
          <CombatSkillReport effects={member.effects} compact />
        </section>
      ))}
    </div>
  );
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
  const parts = [
    event.damageDealt > 0 ? `${event.damageDealt.toLocaleString("en-US")} dmg` : "",
    event.healingDone > 0 ? `${event.healingDone.toLocaleString("en-US")} heal` : "",
    event.damagePrevented > 0 ? `${event.damagePrevented.toLocaleString("en-US")} blocked` : "",
  ].filter(Boolean);
  const contribution = parts.join(" / ") || "Utility cast";
  return event.critical ? `CRIT / ${contribution}` : contribution;
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
