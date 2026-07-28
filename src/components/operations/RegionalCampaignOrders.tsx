import { useMemo } from "react";
import { guildCampaignRegions } from "../../data/guildCampaignRegions";
import { normalizeGuildOperationOutcomes } from "../../game-engine/operations/normalizeGuildOperationOutcomes";
import { buildRegionalCampaignOrderStatuses, getLocalCampaignCycleKey } from "../../game-engine/regional-orders/regionalCampaignOrders";
import type { Guild } from "../../shared/types";
import type { MainPanelTab } from "../layout/MainPanel";

interface RegionalCampaignOrdersProps {
  guild: Guild;
  onAccept: (orderId: string) => void;
  onAbandon: () => void;
  onClaim: () => void;
  onOpenSystem: (tab: MainPanelTab) => void;
}

export function RegionalCampaignOrders({ guild, onAccept, onAbandon, onClaim, onOpenSystem }: RegionalCampaignOrdersProps) {
  const orders = useMemo(() => buildRegionalCampaignOrderStatuses(guild), [guild]);
  const history = useMemo(
    () => normalizeGuildOperationOutcomes(guild.operationOutcomes).regionalOrders?.claimHistory.slice(0, 5) ?? [],
    [guild.operationOutcomes],
  );
  const active = orders.find((order) => order.state === "active" || order.state === "ready");
  const available = orders.filter((order) => order.state === "available").length;

  return (
    <section className="regional-campaign-orders">
      <header>
        <div className="regional-campaign-orders-seal" aria-hidden="true"><i>RO</i><span>{available}</span></div>
        <div>
          <span>Daily local dispatches</span>
          <h4>Regional Campaign Orders</h4>
          <p>Accept one field order at a time. Only operations completed after acceptance count toward its objective.</p>
        </div>
        <div className="regional-campaign-orders-summary" aria-live="polite">
          <Summary label="Cycle" value={getLocalCampaignCycleKey()} />
          <Summary label="Available" value={String(available)} />
          <Summary label="Active order" value={active?.regionName ?? "None"} />
          <Summary label="Status" value={active?.state === "ready" ? "Reward ready" : active ? "In progress" : "Standing by"} />
        </div>
      </header>

      <div className="regional-campaign-orders-grid">
        {orders.map((order) => (
          <article className={`is-${order.state}`} key={order.id}>
            <header>
              <i aria-hidden="true">{order.regionSigil}</i>
              <div><span>{order.regionName}</span><strong>{order.title}</strong></div>
              <b>{statusLabel(order.state)}</b>
            </header>
            <p>{order.description}</p>
            <div className="regional-campaign-order-progress">
              <span><i style={{ width: `${order.progressPercent}%` }} /></span>
              <strong>{order.progress}/{order.target} {objectiveUnit(order.objective)}</strong>
            </div>
            <footer>
              <span>Reward <strong>{order.rewardGold.toLocaleString("en-US")} gold</strong></span>
              {order.state === "available" ? <button onClick={() => onAccept(order.id)} type="button">Accept Order</button> : null}
              {order.state === "active" ? <button onClick={() => onOpenSystem(order.destination)} type="button">Open {destinationLabel(order.destination)}</button> : null}
              {order.state === "ready" ? <button onClick={onClaim} type="button">Claim Reward</button> : null}
              {order.state === "claimed" ? <button disabled type="button">Completed</button> : null}
              {order.state === "unavailable" ? <button disabled type="button">Order Active</button> : null}
            </footer>
          </article>
        ))}
      </div>

      {history.length > 0 ? (
        <div className="regional-campaign-orders-history">
          <header><span>Recent completed orders</span><strong>{history.length}/20 shown</strong></header>
          <div>
            {history.map((entry) => (
              <article key={entry.orderId}>
                <i aria-hidden="true">{regionSigil(entry.regionId)}</i>
                <span><strong>{regionName(entry.regionId)}</strong><small>{objectiveHistoryLabel(entry.objective)}</small></span>
                <b>+{entry.rewardGold.toLocaleString("en-US")} gold</b>
                <time dateTime={entry.claimedAt}>{formatClaimDate(entry.claimedAt)}</time>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      <footer>
        <span>Orders rotate at the next local day. An accepted order remains active until completed or abandoned.</span>
        {active ? <button onClick={onAbandon} type="button">Abandon Active Order</button> : null}
      </footer>
    </section>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function statusLabel(state: string) {
  if (state === "ready") return "Reward ready";
  if (state === "active") return "In progress";
  if (state === "claimed") return "Completed";
  if (state === "unavailable") return "Stand by";
  return "Available";
}

function objectiveUnit(objective: string) {
  if (objective === "hunt_minutes") return "min";
  if (objective === "boss_defeats") return "Boss";
  return "Contract";
}

function destinationLabel(destination: string) {
  if (destination === "bosses") return "Bosses";
  if (destination === "contracts") return "Contracts";
  return "Hunts";
}

function regionName(regionId: string) {
  return guildCampaignRegions.find((region) => region.id === regionId)?.name ?? "Unknown region";
}

function regionSigil(regionId: string) {
  return guildCampaignRegions.find((region) => region.id === regionId)?.sigil ?? "?";
}

function objectiveHistoryLabel(objective: string) {
  if (objective === "hunt_minutes") return "Hunt line secured";
  if (objective === "boss_defeats") return "Regional threat defeated";
  return "Support route secured";
}

function formatClaimDate(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? date.toLocaleString(undefined, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })
    : "Unknown date";
}
