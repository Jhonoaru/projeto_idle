import type { CombatSkillEffectSummary, CombatSkillPartyEffectSummary } from "../../shared/types";

interface CombatSkillReportProps {
  effects: CombatSkillEffectSummary;
  compact?: boolean;
}

export function CombatSkillReport({ effects, compact = false }: CombatSkillReportProps) {
  return (
    <div className={`combat-skill-report${compact ? " is-compact" : ""}`}>
      <div className="combat-skill-report-summary">
        <ReportMetric label="Damage" value={effects.totalDamage} detail={`${effects.damagePerMinute.toLocaleString("en-US")}/min`} />
        <ReportMetric label="Healing" value={effects.totalHealing} detail={`${effects.healingPerMinute.toLocaleString("en-US")}/min`} />
        <ReportMetric label="Prevented" value={effects.totalDamagePrevented} />
        <ReportMetric label="Mana" value={effects.manaSpent} detail={`${effects.totalCasts} casts`} />
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
    </div>
  );
}

export function PartyCombatSkillReport({ effects }: { effects: CombatSkillPartyEffectSummary }) {
  return (
    <div className="party-combat-skill-report">
      <div className="combat-skill-report-summary">
        <ReportMetric label="Party Damage" value={effects.totalDamage} />
        <ReportMetric label="Party Healing" value={effects.totalHealing} />
        <ReportMetric label="Party Prevented" value={effects.totalDamagePrevented} />
        <ReportMetric label="Mana" value={effects.manaSpent} detail={`${effects.totalCasts} casts`} />
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
