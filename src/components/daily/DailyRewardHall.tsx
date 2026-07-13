import { dailyRewards } from "../../data/dailyRewards";
import { canClaimDailyReward } from "../../game-engine/daily-reward/canClaimDailyReward";
import { getCurrentDailyReward } from "../../game-engine/daily-reward/getCurrentDailyReward";
import { getDailyRewardPreview } from "../../game-engine/daily-reward/getDailyRewardPreview";
import { normalizeDailyRewardState } from "../../game-engine/daily-reward/normalizeDailyRewardState";
import type { DailyRewardDefinition, DailyRewardType, Guild } from "../../shared/types";

interface DailyRewardHallProps {
  guild: Guild;
  onClaim: () => void;
}

type RewardCardStatus = "claimed" | "completed" | "current" | "upcoming";

const rewardTypeLabels: Record<DailyRewardType, string> = {
  gold: "Treasury",
  item: "Equipment",
  material: "Material",
  supply: "Supplies",
  collection: "Collection",
  xp_boost_placeholder: "Guild boon",
};

export function DailyRewardHall({ guild, onClaim }: DailyRewardHallProps) {
  const dailyReward = normalizeDailyRewardState(guild.dailyReward);
  const currentReward = getCurrentDailyReward(dailyReward);
  const canClaim = canClaimDailyReward(dailyReward);
  const latestClaim = dailyReward.claimHistory.at(-1);
  const latestClaimedToday = dailyReward.claimedToday ? latestClaim : undefined;
  const completedThisCycle = dailyReward.cycleDay > 1 ? dailyReward.cycleDay - 1 : 0;

  return (
    <div className="daily-hall">
      <section className="daily-hall-hero">
        <div className="daily-hall-seal" aria-hidden="true">
          <i />
          <span>D</span>
        </div>
        <div className="daily-hall-identity">
          <span>Guild treasury dispatch</span>
          <h3>{guild.name} Daily Ledger</h3>
          <p>One local reward per day for the entire guild account.</p>
        </div>
        <div className="daily-hall-summary">
          <SummaryStat label="Status" tone={canClaim ? "available" : "claimed"} value={canClaim ? "Available" : "Claimed today"} />
          <SummaryStat label="Current streak" value={`${dailyReward.currentStreak} day${dailyReward.currentStreak === 1 ? "" : "s"}`} />
          <SummaryStat label="Total claims" value={`${dailyReward.totalClaims}`} />
          <SummaryStat label="Guild treasury" value={`${guild.gold.toLocaleString("en-US")}g`} />
        </div>
      </section>

      <section className="daily-cycle-board">
        <header className="daily-section-heading">
          <div>
            <span>Seven day rotation</span>
            <h3>Guild Dispatch Calendar</h3>
          </div>
          <strong>{canClaim ? `Day ${dailyReward.cycleDay} ready` : `Next dispatch: Day ${dailyReward.cycleDay}`}</strong>
        </header>

        <div className="daily-cycle-track" aria-label="Seven day reward cycle">
          {dailyRewards.map((reward) => {
            const status = getRewardCardStatus(
              reward.day,
              dailyReward.cycleDay,
              latestClaimedToday?.day,
              completedThisCycle,
            );

            return (
              <article className={`daily-cycle-card is-${status}`} key={reward.day}>
                <div className="daily-cycle-card-topline">
                  <span>Day {reward.day}</span>
                  <em>{getStatusLabel(status)}</em>
                </div>
                <RewardSigil reward={reward} />
                <div className="daily-cycle-card-copy">
                  <small>{rewardTypeLabels[reward.rewardType]}</small>
                  <h4>{reward.label}</h4>
                  <p>{reward.description}</p>
                </div>
                <strong className="daily-cycle-value">{getDailyRewardPreview(reward)}</strong>
              </article>
            );
          })}
        </div>
      </section>

      <div className="daily-hall-lower">
        <section className={`daily-dispatch-dossier ${canClaim ? "is-ready" : "is-claimed"}`}>
          <header className="daily-section-heading">
            <div>
              <span>{canClaim ? "Dispatch ready" : "Dispatch completed"}</span>
              <h3>{canClaim ? "Today's Guild Reward" : "Return Tomorrow"}</h3>
            </div>
            <strong>Cycle day {dailyReward.cycleDay} of 7</strong>
          </header>

          <div className="daily-dispatch-content">
            <RewardSigil reward={currentReward} featured />
            <div>
              <span>{currentReward ? rewardTypeLabels[currentReward.rewardType] : "Treasury"}</span>
              <h4>{currentReward?.label ?? "Gold fallback"}</h4>
              <p>{currentReward?.description ?? "Fallback gold will be deposited if reward data is unavailable."}</p>
              <div className="daily-delivery-note">
                <span>Delivery</span>
                <strong>{getDeliveryLabel(currentReward)}</strong>
              </div>
            </div>
          </div>

          <button className="daily-claim-command" disabled={!canClaim} onClick={onClaim} type="button">
            <span>{canClaim ? "Claim guild reward" : "Reward claimed today"}</span>
            <strong>{canClaim ? getDailyRewardPreview(currentReward) : "Available again tomorrow"}</strong>
          </button>
        </section>

        <section className="daily-claim-ledger">
          <header className="daily-section-heading">
            <div>
              <span>Account record</span>
              <h3>Recent Claims</h3>
            </div>
            <strong>{dailyReward.claimHistory.length}/20 saved</strong>
          </header>

          {dailyReward.claimHistory.length > 0 ? (
            <div className="daily-ledger-list">
              {[...dailyReward.claimHistory].reverse().slice(0, 7).map((claim, index) => (
                <div key={`${claim.claimedAt}-${claim.day}`}>
                  <span>{index + 1}</span>
                  <div>
                    <small>Day {claim.day} / {rewardTypeLabels[claim.rewardType]}</small>
                    <strong>{claim.label}</strong>
                  </div>
                  <time dateTime={claim.claimedAt}>{formatClaimDate(claim.claimedAt)}</time>
                </div>
              ))}
            </div>
          ) : (
            <div className="daily-ledger-empty">
              <span>0</span>
              <strong>No dispatches recorded</strong>
              <p>Claim today's reward to open the guild ledger.</p>
            </div>
          )}

          <div className="daily-streak-rule">
            <span>Streak rule</span>
            <p>Claim on consecutive local days to grow the streak. Missing a day starts it again at one.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

function SummaryStat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className={tone ? `is-${tone}` : undefined}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function RewardSigil({ reward, featured = false }: { reward?: DailyRewardDefinition; featured?: boolean }) {
  return (
    <div className={`daily-reward-sigil type-${reward?.rewardType ?? "gold"} ${featured ? "is-featured" : ""}`} aria-hidden="true">
      <i />
      <span>{getRewardGlyph(reward)}</span>
    </div>
  );
}

function getRewardGlyph(reward?: DailyRewardDefinition) {
  if (!reward) return "G";
  if (reward.rewardType === "gold") return "G";
  if (reward.rewardType === "supply") return reward.itemId?.includes("mana") ? "MP" : "HP";
  if (reward.rewardType === "material") return reward.itemId === "iron-ore" ? "Fe" : "MAT";
  if (reward.rewardType === "collection") return reward.previewValue ?? "C";
  if (reward.rewardType === "item") return "IT";
  return "XP";
}

function getRewardCardStatus(
  day: number,
  cycleDay: number,
  claimedTodayDay: number | undefined,
  completedThisCycle: number,
): RewardCardStatus {
  if (claimedTodayDay === day) return "claimed";
  if (cycleDay === day) return "current";
  if (day <= completedThisCycle) return "completed";
  return "upcoming";
}

function getStatusLabel(status: RewardCardStatus) {
  if (status === "claimed") return "Claimed";
  if (status === "completed") return "Complete";
  if (status === "current") return "Current";
  return "Upcoming";
}

function getDeliveryLabel(reward?: DailyRewardDefinition) {
  if (!reward || reward.rewardType === "gold") return "Guild treasury";
  if (reward.rewardType === "collection") return "Guild Collections";
  if (["item", "material", "supply"].includes(reward.rewardType)) return "Guild Depot";
  return "Guild account";
}

function formatClaimDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}
