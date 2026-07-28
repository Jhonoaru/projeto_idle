import type { CampaignCommandBriefing as CampaignCommandBriefingModel } from "../../game-engine/regional-orders/buildCampaignCommandBriefing";

interface CampaignCommandBriefingProps {
  briefing: CampaignCommandBriefingModel;
  onOpenOperations: () => void;
}

export function CampaignCommandBriefing({ briefing, onOpenOperations }: CampaignCommandBriefingProps) {
  return (
    <section className={`campaign-command-briefing is-${briefing.tone}`} aria-label="Campaign command briefing">
      <header>
        <i aria-hidden="true">CB</i>
        <div>
          <span>Local command dispatch / {briefing.cycleKey}</span>
          <strong>{briefing.title}</strong>
          <p>{briefing.description}</p>
        </div>
        <button onClick={onOpenOperations} type="button">{briefing.actionLabel}</button>
      </header>

      <div className="campaign-command-briefing-summary" aria-live="polite">
        <Summary label="Available" value={String(briefing.availableCount)} />
        <Summary label="Completed today" value={`${briefing.completedCount}/3`} />
        <Summary label="Reward claim" value={briefing.rewardReady ? "Ready" : "None"} tone={briefing.rewardReady ? "ready" : undefined} />
      </div>

      <div className="campaign-command-briefing-orders">
        {briefing.orders.map((order) => (
          <article className={`is-${order.state}`} key={order.id}>
            <i aria-hidden="true">{order.regionSigil}</i>
            <div>
              <span>{order.objectiveLabel}{order.previousCycle ? " / Previous cycle" : ""}</span>
              <strong>{order.regionName}</strong>
              <small>{order.title}</small>
            </div>
            <b>{briefingStatusLabel(order.state)}</b>
            <div className="campaign-command-briefing-progress">
              <span
                aria-label={`${order.regionName} order progress`}
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={order.progressPercent}
                role="progressbar"
              ><i style={{ width: `${order.progressPercent}%` }} /></span>
              <strong>{order.progressLabel}</strong>
              <em>{order.rewardGold.toLocaleString("en-US")}g</em>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Summary({ label, value, tone }: { label: string; value: string; tone?: "ready" }) {
  return <div className={tone ? `is-${tone}` : ""}><span>{label}</span><strong>{value}</strong></div>;
}

function briefingStatusLabel(state: string) {
  if (state === "ready") return "Claim ready";
  if (state === "active") return "In progress";
  if (state === "claimed") return "Completed";
  if (state === "unavailable") return "Stand by";
  return "Available";
}
