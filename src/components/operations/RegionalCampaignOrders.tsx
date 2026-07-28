import { useMemo, useState } from "react";
import { useLocalCampaignNow } from "../hooks/useLocalCampaignNow";
import { guildCampaignRegions } from "../../data/guildCampaignRegions";
import { getItemById } from "../../data/items";
import { normalizeGuildOperationOutcomes } from "../../game-engine/operations/normalizeGuildOperationOutcomes";
import {
  buildRegionalCampaignDifficultyOptions,
  buildRegionalCampaignOrderStatuses,
  getLocalCampaignCycleKey,
} from "../../game-engine/regional-orders/regionalCampaignOrders";
import type { Guild, GuildRegionalOrderDifficulty, GuildRegionalOrderRewardItem, GuildRegionalOrderRewardTier } from "../../shared/types";
import type { MainPanelTab } from "../layout/MainPanel";

interface RegionalCampaignOrdersProps {
  guild: Guild;
  onAccept: (orderId: string, difficulty: GuildRegionalOrderDifficulty) => void;
  onAbandon: () => void;
  onClaim: () => void;
  onOpenSystem: (tab: MainPanelTab) => void;
}

export function RegionalCampaignOrders({ guild, onAccept, onAbandon, onClaim, onOpenSystem }: RegionalCampaignOrdersProps) {
  const [selectedDifficulties, setSelectedDifficulties] = useState<Record<string, GuildRegionalOrderDifficulty>>({});
  const campaignNow = useLocalCampaignNow();
  const orders = useMemo(() => buildRegionalCampaignOrderStatuses(guild, campaignNow), [campaignNow, guild]);
  const history = useMemo(
    () => normalizeGuildOperationOutcomes(guild.operationOutcomes).regionalOrders?.claimHistory.slice(0, 5) ?? [],
    [guild.operationOutcomes],
  );
  const active = orders.find((order) => order.state === "active" || order.state === "ready");
  const available = orders.filter((order) => order.state === "available").length;

  return (
    <section className="regional-campaign-orders" id="regional-campaign-orders">
      <header>
        <div className="regional-campaign-orders-seal" aria-hidden="true"><i>RO</i><span>{available}</span></div>
        <div>
          <span>Daily local dispatches</span>
          <h4>Regional Campaign Orders</h4>
          <p>Accept one field order at a time. Higher command bands add a small Guild Depot cache to the treasury reward.</p>
        </div>
        <div className="regional-campaign-orders-summary" aria-live="polite">
          <Summary label="Cycle" value={getLocalCampaignCycleKey(campaignNow)} />
          <Summary label="Available" value={String(available)} />
          <Summary label="Active order" value={active?.regionName ?? "None"} />
          <Summary
            label="Command"
            value={active ? `${active.difficultyLabel} / ${active.state === "ready" ? "Reward ready" : "In progress"}` : "Standing by"}
          />
        </div>
      </header>

      <div className="regional-campaign-orders-grid">
        {orders.map((order) => {
          const difficultyOptions = buildRegionalCampaignDifficultyOptions(guild, order);
          const requestedDifficulty = selectedDifficulties[order.id] ?? "standard";
          const requestedOption = difficultyOptions.find((option) => option.id === requestedDifficulty);
          const selectedOption = requestedOption?.unlocked
            ? requestedOption
            : difficultyOptions.find((option) => option.unlocked) ?? difficultyOptions[0];
          const selectedDifficulty = selectedOption.id;
          const displayedDifficulty = order.state === "available" ? selectedDifficulty : order.difficulty;
          const rewardPreview = order.state === "available" ? selectedOption : order;
          return (
          <article className={`is-${order.state} difficulty-${displayedDifficulty}`} key={order.id}>
            <header>
              <i aria-hidden="true">{order.regionSigil}</i>
              <div><span>{order.regionName} / {order.difficultyLabel} / {order.intensityLabel} {order.assignmentLabel}</span><strong>{order.title}</strong></div>
              <b>{statusLabel(order.state)}</b>
            </header>
            <p>{order.description}</p>
            {order.state === "available" ? (
              <div className="regional-campaign-difficulty" aria-label={`Difficulty for ${order.title}`}>
                {difficultyOptions.map((option) => (
                  <button
                    aria-pressed={selectedDifficulty === option.id}
                    className={selectedDifficulty === option.id ? "is-selected" : undefined}
                    disabled={!option.unlocked}
                    key={option.id}
                    onClick={() => setSelectedDifficulties((current) => ({ ...current, [order.id]: option.id }))}
                    title={option.unlocked
                      ? `${option.description} ${option.target} ${objectiveUnit(order.objective)} / ${option.rewardGold.toLocaleString("en-US")} gold / ${rewardBonusLabel(option.rewardItem, option.rewardItemLabel)}.`
                      : `Requires guild level ${option.requiredGuildLevel}.`}
                    type="button"
                  >
                    <span>{option.label}</span>
                    <small>{option.unlocked ? `${option.target} / ${option.rewardTierShortLabel}` : `Lv ${option.requiredGuildLevel}`}</small>
                  </button>
                ))}
              </div>
            ) : <div className="regional-campaign-difficulty-active"><span>{order.difficultyCommandLabel}</span><strong>{order.difficultyLabel} difficulty</strong></div>}
            <div className="regional-campaign-order-progress">
              <span><i style={{ width: `${order.progressPercent}%` }} /></span>
              <strong>{order.progress}/{order.target} {objectiveUnit(order.objective)}</strong>
            </div>
            <div className={`regional-campaign-reward-tier tier-${rewardPreview.rewardTier}`}>
              <i aria-hidden="true">RC</i>
              <span><small>Reward tier</small><strong>{rewardPreview.rewardTierLabel}</strong></span>
              <b>{rewardPreview.rewardGold.toLocaleString("en-US")}g<small>{rewardBonusLabel(rewardPreview.rewardItem, rewardPreview.rewardItemLabel)}</small></b>
            </div>
            <footer>
              <span>Reward <strong>{rewardPreview.rewardGold.toLocaleString("en-US")} gold</strong></span>
              {order.state === "available" ? <button onClick={() => onAccept(order.id, selectedOption.id)} type="button">Accept Order</button> : null}
              {order.state === "active" ? <button onClick={() => onOpenSystem(order.destination)} type="button">Open {destinationLabel(order.destination)}</button> : null}
              {order.state === "ready" ? <button onClick={onClaim} type="button">Claim Reward</button> : null}
              {order.state === "claimed" ? <button disabled type="button">Completed</button> : null}
              {order.state === "unavailable" ? <button disabled type="button">Order Active</button> : null}
            </footer>
          </article>
          );
        })}
      </div>

      {history.length > 0 ? (
        <div className="regional-campaign-orders-history">
          <header><span>Recent completed orders</span><strong>{history.length}/20 shown</strong></header>
          <div>
            {history.map((entry) => (
              <article key={entry.orderId}>
                <i aria-hidden="true">{regionSigil(entry.regionId)}</i>
                <span><strong>{regionName(entry.regionId)}</strong><small>{difficultyHistoryLabel(entry.difficulty)} / {rewardTierHistoryLabel(entry.rewardTier)} / {objectiveHistoryLabel(entry.objective)}</small></span>
                <b>+{entry.rewardGold.toLocaleString("en-US")} gold<small>{historyRewardItemLabel(entry.rewardItem)}</small></b>
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

function difficultyHistoryLabel(difficulty?: GuildRegionalOrderDifficulty) {
  if (difficulty === "elite") return "Elite";
  if (difficulty === "veteran") return "Veteran";
  return "Standard";
}

function rewardTierHistoryLabel(tier?: GuildRegionalOrderRewardTier) {
  if (tier === "command") return "Command Cache";
  if (tier === "quartermaster") return "Quartermaster Cache";
  return "Field Purse";
}

function rewardBonusLabel(rewardItem?: GuildRegionalOrderRewardItem, label?: string) {
  return rewardItem ? `${label ?? rewardItem.itemId} x${rewardItem.quantity}` : "Treasury gold only";
}

function historyRewardItemLabel(rewardItem?: GuildRegionalOrderRewardItem) {
  if (!rewardItem) return "Treasury only";
  try {
    return `${getItemById(rewardItem.itemId).name} x${rewardItem.quantity}`;
  } catch {
    return "Legacy cache";
  }
}

function formatClaimDate(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? date.toLocaleString(undefined, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })
    : "Unknown date";
}
