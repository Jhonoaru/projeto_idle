import { useMemo } from "react";
import { buildWeeklyCampaignBriefing } from "../../game-engine/regional-orders/buildWeeklyCampaignBriefing";
import type { Guild } from "../../shared/types";
import { useLocalCampaignNow } from "../hooks/useLocalCampaignNow";

interface WeeklyCampaignBriefingProps {
  guild: Guild;
  onReviewOrders: () => void;
}

export function WeeklyCampaignBriefing({ guild, onReviewOrders }: WeeklyCampaignBriefingProps) {
  const campaignNow = useLocalCampaignNow();
  const briefing = useMemo(() => buildWeeklyCampaignBriefing(guild, campaignNow), [campaignNow, guild]);

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
        <strong>{briefing.weekStartKey} / {briefing.weekEndKey}</strong>
      </footer>
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
