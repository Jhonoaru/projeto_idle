import { useMemo, useState } from "react";
import { buildWeeklyCampaignArchive } from "../../game-engine/regional-orders/buildWeeklyCampaignArchive";
import { buildWeeklyCampaignBriefing } from "../../game-engine/regional-orders/buildWeeklyCampaignBriefing";
import { buildWeeklyCampaignRecords, type WeeklyCampaignRecords } from "../../game-engine/regional-orders/buildWeeklyCampaignRecords";
import { buildWeeklyCampaignTrend, type WeeklyCampaignTrend } from "../../game-engine/regional-orders/buildWeeklyCampaignTrend";
import type { Guild } from "../../shared/types";
import { useLocalCampaignNow } from "../hooks/useLocalCampaignNow";

interface WeeklyCampaignBriefingProps {
  guild: Guild;
  onReviewOrders: () => void;
}

export function WeeklyCampaignBriefing({ guild, onReviewOrders }: WeeklyCampaignBriefingProps) {
  const [archiveOpen, setArchiveOpen] = useState(false);
  const campaignNow = useLocalCampaignNow();
  const briefing = useMemo(() => buildWeeklyCampaignBriefing(guild, campaignNow), [campaignNow, guild]);
  const archive = useMemo(
    () => archiveOpen ? buildWeeklyCampaignArchive(guild, campaignNow) : undefined,
    [archiveOpen, campaignNow, guild],
  );
  const trend = useMemo(
    () => archive ? buildWeeklyCampaignTrend(guild, campaignNow, archive) : undefined,
    [archive, campaignNow, guild],
  );
  const records = useMemo(() => archive ? buildWeeklyCampaignRecords(archive) : undefined, [archive]);

  return (
    <section className={`weekly-campaign-briefing is-${briefing.tone}`} aria-label="Weekly campaign briefing">
      <header>
        <div className="weekly-campaign-seal" aria-hidden="true"><i>WK</i><span>{briefing.completedOrders}</span></div>
        <div>
          <span>Monday-Sunday command record / {briefing.rangeLabel}</span>
          <h4>{briefing.title}</h4>
          <p>{briefing.description}</p>
        </div>
        <button onClick={onReviewOrders} type="button">Review Daily Orders</button>
      </header>

      <div className="weekly-campaign-summary">
        <Summary label="Orders" value={`${briefing.completedOrders}/5`} />
        <Summary label="Regions" value={`${briefing.regionsCovered}/3`} />
        <Summary label="Order families" value={`${briefing.objectivesCovered}/${briefing.objectivesAvailable}`} />
        <Summary label="Daily gold earned" value={`${briefing.earnedGold.toLocaleString("en-US")}g`} />
        <Summary label="Days remaining" value={String(briefing.daysRemaining)} />
      </div>

      <div className="weekly-campaign-body">
        <div className="weekly-campaign-goals">
          {briefing.goals.map((goal) => (
            <article className={goal.complete ? "is-complete" : ""} key={goal.id}>
              <i aria-hidden="true">{goal.complete ? "OK" : goal.id.slice(0, 1).toUpperCase()}</i>
              <div><span>Weekly objective</span><strong>{goal.label}</strong><small>{goal.description}</small></div>
              <b>{goal.progress}/{goal.target}</b>
              <progress aria-label={`${goal.label} progress`} max={goal.target} value={goal.progress} />
            </article>
          ))}
        </div>

        <div className="weekly-campaign-coverage">
          <Coverage title="Region coverage" entries={briefing.regionCoverage} />
          <Coverage title="Order families" entries={briefing.objectiveCoverage} />
        </div>
      </div>

      <footer>
        <span>Weekly goals are derived only. Daily orders remain the only source of campaign gold.</span>
        <div>
          <strong>{briefing.weekStartKey} / {briefing.weekEndKey}</strong>
          <button aria-controls="weekly-campaign-archive" aria-expanded={archiveOpen} onClick={() => setArchiveOpen((current) => !current)} type="button">
            {archiveOpen ? "Close Archive" : "Open Archive"}
          </button>
        </div>
      </footer>

      {archive ? (
        <section className="weekly-campaign-archive" id="weekly-campaign-archive" aria-label="Weekly campaign archive">
          <header>
            <div><span>Retained command history</span><h5>Campaign Archive</h5><p>The eight completed weeks before the current campaign, reconstructed from canonical daily order claims.</p></div>
            <strong>{archive.recordedWeeks}/{archive.entries.length} weeks recorded</strong>
          </header>
          <div className="weekly-campaign-archive-summary">
            <Summary label="Secured weeks" value={`${archive.securedWeeks}/${archive.entries.length}`} />
            <Summary label="Recorded weeks" value={`${archive.recordedWeeks}/${archive.entries.length}`} />
            <Summary label="Archived orders" value={String(archive.completedOrders)} />
            <Summary label="Daily gold recorded" value={`${archive.earnedGold.toLocaleString("en-US")}g`} />
          </div>
          {trend ? <CampaignTrendComparison trend={trend} /> : null}
          {records ? <CampaignPerformanceRecords records={records} /> : null}
          <div className="weekly-campaign-archive-grid">
            {archive.entries.map((entry, index) => (
              <article className={`is-${entry.status}`} key={entry.weekStartKey}>
                <header><i aria-hidden="true">{index + 1}</i><span><small>{entry.rangeLabel}</small><strong>{entry.statusLabel}</strong></span><b>{entry.goalsCompleted}/3</b></header>
                <div>
                  <span>Orders<strong>{entry.completedOrders}/5</strong></span>
                  <span>Regions<strong>{entry.regionsCovered}/3</strong></span>
                  <span>Families<strong>{entry.objectivesCovered}/{entry.objectivesAvailable}</strong></span>
                  <span>Gold<strong>{entry.earnedGold.toLocaleString("en-US")}g</strong></span>
                </div>
                <footer>{entry.weekStartKey} / {entry.weekEndKey}</footer>
              </article>
            ))}
          </div>
          <footer>Archive depth depends on the retained ledger of up to {archive.ledgerLimit} canonical Regional Order claims.</footer>
        </section>
      ) : null}
    </section>
  );
}

function CampaignPerformanceRecords({ records }: { records: WeeklyCampaignRecords }) {
  return (
    <section className={`weekly-campaign-records ${records.hasRecordedHistory ? "" : "is-empty"}`.trim()} aria-label="Campaign performance records">
      <header>
        <i aria-hidden="true">PR</i>
        <div><span>Retained personal bests</span><h6>Campaign Performance Records</h6><p>Best completed-week results inside the retained local archive.</p></div>
        <strong>{records.recordedWeeks} recorded week{records.recordedWeeks === 1 ? "" : "s"}</strong>
      </header>
      <div className="weekly-campaign-records-grid">
        {records.records.map((record) => (
          <article key={record.id}>
            <i aria-hidden="true">{record.sigil}</i>
            <span><small>{record.label}</small><strong>{record.valueLabel}</strong><em>{record.weekLabel}</em></span>
            <b>{record.tiedWeeks > 1 ? `${record.tiedWeeks} tied` : record.weekStartKey ? "Record" : "Open"}</b>
          </article>
        ))}
      </div>
      <footer>
        <span>Best secured run<strong>{records.bestSecuredStreak} week{records.bestSecuredStreak === 1 ? "" : "s"}</strong></span>
        <small>{records.bestSecuredStreakLabel}</small>
      </footer>
    </section>
  );
}

function CampaignTrendComparison({ trend }: { trend: WeeklyCampaignTrend }) {
  return (
    <section className={`weekly-campaign-trend is-${trend.tone}`} aria-label="Campaign trend comparison">
      <header>
        <i aria-hidden="true">{trend.tone === "ahead" ? "+" : trend.tone === "behind" ? "-" : "="}</i>
        <div><span>Current checkpoint vs previous week</span><h6>{trend.title}</h6><p>{trend.description}</p></div>
        <strong>{trend.checkpointLabel}</strong>
      </header>
      <div className="weekly-campaign-trend-grid">
        {trend.metrics.map((metric) => (
          <article className={`is-${metric.tone}`} key={metric.id}>
            <header><span>{metric.label}</span><b>{metric.deltaLabel}</b></header>
            <div><span>Current<strong>{metric.currentLabel}</strong></span><span>Previous<strong>{metric.previousLabel}</strong></span></div>
          </article>
        ))}
      </div>
      <footer>
        <span>Projected orders<strong>{trend.projectedOrders}</strong></span>
        <span>Previous final<strong>{trend.previousFinalOrders} / {trend.previousFinalGold.toLocaleString("en-US")}g</strong></span>
        <span>Recorded baseline<strong>{trend.baselineWeeks}/8 weeks</strong></span>
        <span>Archive average<strong>{trend.averageOrders} orders / {trend.averageGold.toLocaleString("en-US")}g</strong></span>
        <span>Secured rate<strong>{trend.securedRate}%</strong></span>
      </footer>
      <small>{trend.currentCheckpointKey} compared with {trend.previousCheckpointKey}. Projection is informational only.</small>
    </section>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function Coverage({ title, entries }: { title: string; entries: Array<{ id: string; label: string; sigil: string; completed: number; covered: boolean; available: boolean }> }) {
  const availableEntries = entries.filter((entry) => entry.available);
  return (
    <section>
      <header><span>{title}</span><strong>{availableEntries.filter((entry) => entry.covered).length}/{availableEntries.length}</strong></header>
      <div>
        {entries.map((entry) => (
          <article className={`${entry.covered ? "is-covered" : ""} ${entry.available ? "" : "is-unavailable"}`.trim()} key={entry.id}>
            <i aria-hidden="true">{entry.sigil}</i>
            <span><strong>{entry.label}</strong><small>{entry.available ? `${entry.completed} completed` : "Not offered this week"}</small></span>
          </article>
        ))}
      </div>
    </section>
  );
}
