import { useMemo } from "react";
import {
  buildRegionalMaterialRotationSchedule,
  type RegionalMaterialRotationEntry,
  type RegionalMaterialRotationOccurrence,
} from "../../game-engine/regional-orders/buildRegionalMaterialRotationSchedule";
import type { Character, Guild, GuildDepot } from "../../shared/types";
import { useLocalCampaignNow } from "../hooks/useLocalCampaignNow";
import { ItemIcon } from "../items/ItemIcon";

interface RegionalMaterialRotationScheduleProps {
  characters: Character[];
  depot: GuildDepot;
  guild: Guild;
}

export function RegionalMaterialRotationSchedule({ characters, depot, guild }: RegionalMaterialRotationScheduleProps) {
  const campaignNow = useLocalCampaignNow();
  const schedule = useMemo(
    () => buildRegionalMaterialRotationSchedule(guild, depot, characters, campaignNow),
    [campaignNow, characters, depot, guild],
  );

  return (
    <section className="regional-material-rotation-schedule" aria-labelledby="regional-material-rotation-schedule-title">
      <header>
        <div className="regional-material-rotation-schedule-seal" aria-hidden="true"><i>RS</i><span>MAT</span></div>
        <div>
          <span>Material-centric regional outlook</span>
          <h4 id="regional-material-rotation-schedule-title">Regional Material Rotation Schedule</h4>
          <p>Consolidated cache windows for every material shortage currently tracked by Logistics.</p>
        </div>
        <div className="regional-material-rotation-schedule-summary" aria-label="Rotation schedule summary">
          <Summary label="Horizon" value={`${schedule.startDateKey} / ${schedule.endDateKey}`} />
          <Summary label="Scheduled" value={`${schedule.scheduledMaterialCount}/${schedule.shortageCount}`} />
          <Summary label="Reachable" value={String(schedule.reachableMaterialCount)} />
          <Summary label="No cache" value={String(schedule.unscheduledMaterialCount)} />
        </div>
      </header>

      {schedule.entries.length > 0 ? (
        <div className="regional-material-rotation-schedule-grid" role="list" aria-label="Regional material rotation schedule">
          {schedule.entries.map((entry) => <ScheduleEntry entry={entry} key={entry.item.id} />)}
        </div>
      ) : (
        <div className="regional-material-rotation-schedule-empty">
          <strong>No active material shortages</strong>
          <span>Logistics is fully supplied for the objectives currently in scope.</span>
        </div>
      )}

      <footer>
        <span>Potential yield assumes every displayed cache is claimed; live order availability is recalculated each local day.</span>
        <strong>{schedule.totalOccurrences} cache window{schedule.totalOccurrences === 1 ? "" : "s"} across {schedule.horizonDays} days</strong>
      </footer>
    </section>
  );
}

function ScheduleEntry({ entry }: { entry: RegionalMaterialRotationEntry }) {
  const titleId = `regional-material-rotation-${entry.item.id}`;
  return (
    <article aria-labelledby={titleId} className={`is-${entry.state}`} role="listitem">
      <header>
        <ItemIcon item={entry.item} showBadges={false} size="small" />
        <div><span>{stateEyebrow(entry)}</span><strong id={titleId}>{entry.item.name}</strong><small>{entry.missing} missing in Logistics</small></div>
        <b>{stateLabel(entry)}</b>
      </header>
      <div className="regional-material-rotation-schedule-metrics">
        <Metric label="Next cache" value={entry.firstDateKey ? relativeDay(entry.firstDaysFromNow) : "Beyond 7d"} />
        <Metric label="Appearances" value={String(entry.occurrenceCount)} />
        <Metric label="Potential" value={`${entry.usefulYield}/${entry.missing}`} />
        <Metric label="Regions" value={String(entry.regionCount)} />
      </div>
      <div className="regional-material-rotation-schedule-progress">
        <span><b>Potential coverage</b><strong>{entry.coveragePercent}%</strong></span>
        <progress aria-label={`${entry.item.name} potential coverage`} max={100} value={entry.coveragePercent} />
      </div>
      {entry.occurrences.length > 0 ? (
        <div className="regional-material-rotation-schedule-occurrences" role="list" aria-label={`${entry.item.name} cache windows`}>
          {entry.occurrences.map((occurrence) => <Occurrence entry={occurrence} itemName={entry.item.name} key={occurrence.id} />)}
        </div>
      ) : (
        <p>No matching Veteran or Elite cache appears in the current seven-day horizon.</p>
      )}
      <footer>{entry.remainingAfterHorizon > 0 ? `${entry.remainingAfterHorizon} still missing after potential yield` : "Potential horizon yield covers this shortage"}</footer>
    </article>
  );
}

function Occurrence({ entry, itemName }: { entry: RegionalMaterialRotationOccurrence; itemName: string }) {
  return (
    <div
      aria-label={`${itemName} x${entry.quantity}, ${entry.regionName}, ${entry.dateKey}, ${entry.unlocked ? "reachable" : `Guild Level ${entry.requiredGuildLevel}`}`}
      className={entry.unlocked ? "is-reachable" : "is-locked"}
      role="listitem"
    >
      <time dateTime={entry.dateKey}>{formatDateKey(entry.dateKey)}</time>
      <span>{entry.regionSigil} / {entry.difficultyLabel}</span>
      <b>x{entry.quantity}</b>
    </div>
  );
}

function stateEyebrow(entry: RegionalMaterialRotationEntry) {
  if (entry.state === "reachable") return `${entry.reachableOccurrenceCount} reachable window${entry.reachableOccurrenceCount === 1 ? "" : "s"}`;
  if (entry.state === "locked") return `Next unlock Guild Lv ${entry.nextUnlockLevel}`;
  return "No regional cache scheduled";
}

function stateLabel(entry: RegionalMaterialRotationEntry) {
  if (entry.state === "reachable") return entry.firstReachableDateKey ? relativeDay(entry.firstReachableDaysFromNow) : "Reachable";
  if (entry.state === "locked") return `Lv ${entry.nextUnlockLevel}`;
  return "Unscheduled";
}

function relativeDay(days: number | null) {
  if (days === 1) return "Tomorrow";
  return days ? `In ${days} days` : "Unavailable";
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function formatDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  return Number.isFinite(date.getTime())
    ? date.toLocaleDateString(undefined, { month: "short", day: "2-digit" })
    : value;
}
