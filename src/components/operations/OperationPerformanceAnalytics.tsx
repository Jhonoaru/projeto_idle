import { useEffect, useMemo, useState } from "react";
import {
  buildOperationPerformanceAnalytics,
  type OperationTargetPerformance,
} from "../../game-engine/operations/buildOperationPerformanceAnalytics";
import type { OperationOutcomeKind } from "../../game-engine/operations/buildOperationOutcomeLedger";
import type { Character, Guild } from "../../shared/types";

interface OperationPerformanceAnalyticsProps {
  guild: Guild;
  characters: Character[];
}

type AnalyticsScope = "all" | OperationOutcomeKind;

export function OperationPerformanceAnalytics({ guild, characters }: OperationPerformanceAnalyticsProps) {
  const analytics = useMemo(
    () => buildOperationPerformanceAnalytics(guild, characters),
    [characters, guild],
  );
  const [scope, setScope] = useState<AnalyticsScope>("all");
  const scopedAnalytics = analytics.scopes[scope];
  const targets = scopedAnalytics.targets;
  const summary = scopedAnalytics.summary;
  const [selectedId, setSelectedId] = useState<string | null>(analytics.targets[0]?.id ?? null);
  const selected = targets.find((target) => target.id === selectedId) ?? targets[0];

  useEffect(() => {
    if (selected?.id !== selectedId) setSelectedId(selected?.id ?? null);
  }, [selected?.id, selectedId]);

  return (
    <section className="operation-performance-analytics">
      <header>
        <div>
          <span>Recorded performance</span>
          <h4>Operation Performance Analytics</h4>
          <small>Derived from the latest {analytics.windowSize} archived report(s).</small>
        </div>
        <div className="operation-performance-summary">
          <Metric label="Operations" value={String(summary.operations)} />
          <Metric label="Success rate" value={`${summary.successRate}%`} />
          <Metric label="Gross gold" value={`${formatNumber(summary.grossGold)}g`} />
          <Metric label="Costs" value={`${formatNumber(summary.costs)}g`} />
          <Metric label="Net result" value={formatSignedGold(summary.netGold)} tone={summary.netGold >= 0 ? "positive" : "negative"} />
          <Metric label="Average net" value={formatSignedGold(summary.averageNetGold)} tone={summary.averageNetGold >= 0 ? "positive" : "negative"} />
        </div>
      </header>

      <div className="operation-performance-toolbar">
        <div role="group" aria-label="Performance scope">
          <ScopeButton active={scope === "all"} label="All Operations" onClick={() => setScope("all")} />
          <ScopeButton active={scope === "boss"} label="Bosses" onClick={() => setScope("boss")} />
          <ScopeButton active={scope === "contract"} label="Contracts" onClick={() => setScope("contract")} />
        </div>
        <span>{summary.profitableOperations}/{summary.operations} profitable / {summary.failures} failed</span>
      </div>

      {targets.length > 0 && selected ? (
        <div className="operation-performance-body">
          <div className="operation-performance-ranking" aria-label="Target performance ranking">
            {targets.map((target, index) => (
              <button
                aria-pressed={target.id === selected.id}
                className={target.netGold >= 0 ? "is-positive" : "is-negative"}
                key={target.id}
                onClick={() => setSelectedId(target.id)}
                type="button"
              >
                <i>{index + 1}</i>
                <span>
                  <small>{target.kind} / {target.region}</small>
                  <strong>{target.targetName}</strong>
                  <em>{target.successes}/{target.operations} successful / {target.successRate}%</em>
                </span>
                <b>{formatSignedGold(target.netGold)}</b>
              </button>
            ))}
          </div>
          <TargetPerformanceDossier target={selected} />
        </div>
      ) : (
        <div className="operation-performance-empty">
          <i>A</i>
          <div><strong>No performance sample available</strong><span>Complete a Boss or Contract to begin comparing operation results.</span></div>
        </div>
      )}

      <div className="operation-performance-insights" aria-live="polite">
        <Insight label="Most profitable" target={scopedAnalytics.highlights.mostProfitable} value={(target) => formatSignedGold(target.netGold)} />
        <Insight label="Most reliable" target={scopedAnalytics.highlights.mostReliable} value={(target) => `${target.successRate}% / ${target.operations} report(s)`} />
        <Insight label="Most active" target={scopedAnalytics.highlights.mostActive} value={(target) => `${target.operations} report(s)`} />
        <div>
          <span>Recent form</span>
          <strong>{recentDirectionLabel(scopedAnalytics.recentDirection)}</strong>
          <small>{scopedAnalytics.recent.successRate}% success / {formatSignedGold(scopedAnalytics.recent.averageNetGold)} avg.</small>
        </div>
      </div>
    </section>
  );
}

function TargetPerformanceDossier({ target }: { target: OperationTargetPerformance }) {
  return (
    <article className={`operation-performance-dossier is-${target.kind}`}>
      <header>
        <i>{target.kind === "boss" ? "B" : "C"}</i>
        <div>
          <span>{target.kind} performance / {target.region}</span>
          <h5>{target.targetName}</h5>
          <small>Last report {formatDate(target.lastCompletedAt)}</small>
        </div>
        <b>{target.successRate}% success</b>
      </header>
      <div className="operation-performance-dossier-metrics">
        <Metric label="Attempts" value={String(target.operations)} />
        <Metric label="Wins / losses" value={`${target.successes} / ${target.failures}`} />
        <Metric label="Gross" value={`${formatNumber(target.grossGold)}g`} />
        <Metric label="Costs" value={`${formatNumber(target.costs)}g`} />
        <Metric label="Net" value={formatSignedGold(target.netGold)} tone={target.netGold >= 0 ? "positive" : "negative"} />
        <Metric label="Average" value={formatSignedGold(target.averageNetGold)} tone={target.averageNetGold >= 0 ? "positive" : "negative"} />
      </div>
      <div className="operation-performance-yields">
        <div><span>Renown</span><strong>+{formatNumber(target.renown)}</strong></div>
        <div><span>Loot units</span><strong>{formatNumber(target.lootItems)}</strong></div>
        <div><span>Experience</span><strong>+{formatNumber(target.experience)}</strong></div>
        <div><span>Profitable runs</span><strong>{target.profitableOperations}/{target.operations}</strong></div>
      </div>
      <div className="operation-performance-rate">
        <span>Success consistency</span>
        <progress aria-label={`${target.targetName} success rate`} max={100} value={target.successRate} />
        <strong>{target.successRate}%</strong>
      </div>
    </article>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "positive" | "negative" }) {
  return <div className={tone ? `is-${tone}` : undefined}><span>{label}</span><strong>{value}</strong></div>;
}

function ScopeButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return <button aria-pressed={active} onClick={onClick} type="button">{label}</button>;
}

function Insight({
  label,
  target,
  value,
}: {
  label: string;
  target?: OperationTargetPerformance;
  value: (target: OperationTargetPerformance) => string;
}) {
  return (
    <div>
      <span>{label}</span>
      <strong>{target?.targetName ?? "No report"}</strong>
      <small>{target ? value(target) : "Awaiting operations"}</small>
    </div>
  );
}

function recentDirectionLabel(direction: "empty" | "positive" | "negative" | "improving" | "declining") {
  if (direction === "improving") return "Improving";
  if (direction === "declining") return "Declining";
  if (direction === "positive") return "Positive";
  if (direction === "negative") return "Negative";
  return "No sample";
}

function formatNumber(value: number) {
  return Math.max(0, Math.floor(value)).toLocaleString("en-US");
}

function formatSignedGold(value: number) {
  const amount = Math.floor(value);
  return `${amount >= 0 ? "+" : "-"}${Math.abs(amount).toLocaleString("en-US")}g`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(new Date(value));
}
