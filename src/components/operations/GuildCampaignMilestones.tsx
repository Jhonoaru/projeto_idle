import { useMemo } from "react";
import type { GuildRenownObjectiveDefinition } from "../../data/guildRenownObjectives";
import { getGuildRenownObjectiveStatus } from "../../game-engine/guild-progression/getGuildRenownObjectiveStatus";
import type { Character, Guild } from "../../shared/types";
import type { MainPanelTab } from "../layout/MainPanel";

interface GuildCampaignMilestonesProps {
  characters: Character[];
  guild: Guild;
  onClaim: (objectiveId: string) => void;
  onOpenSystem: (tab: MainPanelTab) => void;
}

const commandRanks = [
  "Unproven Office",
  "Reporting Office",
  "Established Office",
  "Coordinated Office",
  "Seasoned Command",
  "Proven Command",
  "Veteran Command",
] as const;

export function GuildCampaignMilestones({
  characters,
  guild,
  onClaim,
  onOpenSystem,
}: GuildCampaignMilestonesProps) {
  const status = useMemo(
    () => getGuildRenownObjectiveStatus(guild, characters).groups.campaign,
    [characters, guild],
  );
  const commandRank = commandRanks[Math.min(commandRanks.length - 1, status.completedCount)];
  const nextMilestone = status.objectives.find((milestone) => !milestone.completed);

  return (
    <section className="guild-campaign-milestones">
      <header>
        <div className="guild-campaign-milestones-seal" aria-hidden="true">
          <i>CM</i><span>{status.completedCount}/{status.objectives.length}</span>
        </div>
        <div>
          <span>Permanent operation record</span>
          <h4>Guild Campaign Milestones</h4>
          <p>Boss and Contract totals advance one local command track. Rewards are small, manual Renown claims.</p>
        </div>
        <div className="guild-campaign-milestones-summary" aria-live="polite">
          <Summary label="Command rank" value={commandRank} />
          <Summary label="Completed" value={`${status.completedCount}/${status.objectives.length}`} />
          <Summary label="Claims ready" value={String(status.claimableCount)} tone={status.claimableCount > 0 ? "ready" : undefined} />
          <Summary label="Renown ready" value={`+${status.unclaimedRenown}`} tone={status.unclaimedRenown > 0 ? "ready" : undefined} />
        </div>
      </header>

      <div className="guild-campaign-milestone-track" aria-label="Campaign milestone progression">
        {status.objectives.map((milestone, index) => {
          const { definition } = milestone;
          const current = Math.min(milestone.current, definition.target);
          return (
            <article
              className={`${milestone.claimed ? "is-claimed" : ""} ${milestone.claimable ? "is-claimable" : ""} ${nextMilestone?.definition.id === definition.id ? "is-current" : ""}`.trim()}
              key={definition.id}
            >
              <div className="guild-campaign-milestone-heading">
                <i>{definition.sigil}</i>
                <span>
                  <small>Chapter {index + 1} / {sourceLabel(definition.destination)}</small>
                  <strong>{definition.title}</strong>
                </span>
                <b>+{definition.rewardRenown} R</b>
              </div>
              <p>{definition.description}</p>
              <div className="guild-campaign-milestone-progress">
                <span
                  aria-label={`${definition.title} progress`}
                  aria-valuemax={definition.target}
                  aria-valuemin={0}
                  aria-valuenow={current}
                  role="progressbar"
                >
                  <i style={{ width: `${milestone.progressPercent}%` }} />
                </span>
                <strong>{current}/{definition.target}</strong>
              </div>
              <button
                disabled={milestone.claimed}
                onClick={() => {
                  if (milestone.claimable) onClaim(definition.id);
                  else onOpenSystem(sourceDestination(definition.destination));
                }}
                type="button"
              >
                {milestone.claimed
                  ? "Recorded"
                  : milestone.claimable
                    ? `Claim +${definition.rewardRenown} Renown`
                    : sourceAction(definition.destination)}
              </button>
            </article>
          );
        })}
      </div>
      <footer>
        <span>Lifetime counters</span>
        <p>Progress survives the 24-report analytics window and never falls when older reports leave the visible archive.</p>
      </footer>
    </section>
  );
}

function Summary({ label, value, tone }: { label: string; value: string; tone?: "ready" }) {
  return <div className={tone ? `is-${tone}` : undefined}><span>{label}</span><strong>{value}</strong></div>;
}

type CampaignDestination = GuildRenownObjectiveDefinition["destination"];

function sourceLabel(destination: CampaignDestination) {
  if (destination === "bosses") return "Boss campaign";
  if (destination === "contracts") return "Contract network";
  return "Combined operations";
}

function sourceAction(destination: CampaignDestination) {
  if (destination === "bosses") return "Open Bosses";
  if (destination === "contracts") return "Open Contracts";
  return "Plan Operation";
}

function sourceDestination(destination: CampaignDestination): MainPanelTab {
  if (destination === "contracts") return "contracts";
  return "bosses";
}
