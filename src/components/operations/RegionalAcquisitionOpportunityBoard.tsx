import { useMemo, type KeyboardEvent } from "react";
import {
  buildRegionalAcquisitionOpportunityBoard,
  type RegionalAcquisitionOpportunity,
  type RegionalAcquisitionOpportunityState,
} from "../../game-engine/regional-orders/buildRegionalAcquisitionOpportunityBoard";
import type { Character, Guild, GuildDepot } from "../../shared/types";
import { useLocalCampaignNow } from "../hooks/useLocalCampaignNow";
import { ItemIcon } from "../items/ItemIcon";

interface RegionalAcquisitionOpportunityBoardProps {
  characters: Character[];
  depot: GuildDepot;
  guild: Guild;
  onReviewOrder: (orderId: string) => void;
}

export function RegionalAcquisitionOpportunityBoard({ characters, depot, guild, onReviewOrder }: RegionalAcquisitionOpportunityBoardProps) {
  const campaignNow = useLocalCampaignNow();
  const board = useMemo(
    () => buildRegionalAcquisitionOpportunityBoard(guild, depot, characters, campaignNow),
    [campaignNow, characters, depot, guild],
  );

  return (
    <section className="regional-opportunity-board" aria-labelledby="regional-opportunity-board-title">
      <header>
        <div className="regional-opportunity-board-seal" aria-hidden="true"><i>OM</i><span>{board.actionableCount}</span></div>
        <div>
          <span>Current rotation material match</span>
          <h4 id="regional-opportunity-board-title">Regional Acquisition Opportunity Board</h4>
          <p>Compare today's three local orders with live Logistics shortages before choosing a command difficulty.</p>
        </div>
        <div className="regional-opportunity-board-summary">
          <Summary label="Cycle" value={board.cycleKey} />
          <Summary label="Short materials" value={String(board.shortageCount)} />
          <Summary label="Matched today" value={String(board.matchedMaterialCount)} />
          <Summary label="Actionable" value={String(board.actionableCount)} />
        </div>
      </header>

      {board.opportunities.length > 0 ? (
        <div className="regional-opportunity-board-grid">
          {board.opportunities.map((entry) => (
            <OpportunityCard entry={entry} key={entry.id} onReview={() => onReviewOrder(entry.orderId)} />
          ))}
        </div>
      ) : (
        <div className="regional-opportunity-board-empty">
          <i aria-hidden="true">0</i>
          <div><strong>No current order supplies an active shortage</strong><span>The next deterministic local rotation begins {formatRotation(board.nextRotationAt)}.</span></div>
        </div>
      )}

      <footer>
        <span>One best material match per regional offer. Reviewing never accepts or changes an order.</span>
        <strong>Next rotation {formatRotation(board.nextRotationAt)}</strong>
      </footer>
    </section>
  );
}

function OpportunityCard({ entry, onReview }: { entry: RegionalAcquisitionOpportunity; onReview: () => void }) {
  const reviewFromKeyboard = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onReview();
  };

  return (
    <article className={`is-${entry.state}`}>
      <header>
        <i aria-hidden="true">{entry.regionSigil}</i>
        <div><span>{entry.regionName} / {entry.objectiveLabel}</span><strong>{entry.orderTitle}</strong></div>
        <b>{stateLabel(entry.state)}</b>
      </header>
      <div className="regional-opportunity-board-reward">
        <ItemIcon item={entry.item} showBadges={false} size="small" />
        <span><small>{entry.rewardTableLabel}</small><strong>{entry.item.name} x{entry.quantity}</strong><em>{entry.contribution}/{entry.missing} shortage covered</em></span>
        <b>{entry.remainingAfterClaim}<small>left after claim</small></b>
      </div>
      <footer>
        <span>{entry.difficultyLabel} / Guild Lv {entry.requiredGuildLevel} / {entry.rewardGold.toLocaleString("en-US")}g</span>
        <button
          aria-label={`Review ${entry.regionName} order: ${entry.orderTitle}`}
          onClick={onReview}
          onKeyDown={reviewFromKeyboard}
          type="button"
        >Review Order</button>
      </footer>
    </article>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function stateLabel(state: RegionalAcquisitionOpportunityState) {
  if (state === "ready") return "Reward ready";
  if (state === "active") return "In progress";
  if (state === "available") return "Available now";
  if (state === "blocked") return "Finish active order";
  if (state === "locked") return "Guild level locked";
  return "Completed today";
}

function formatRotation(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? date.toLocaleString(undefined, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })
    : "next local day";
}
