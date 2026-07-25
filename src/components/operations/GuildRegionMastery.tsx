import { useMemo, useState } from "react";
import { buildGuildRegionMastery } from "../../game-engine/region-mastery/guildRegionMastery";
import type { Guild } from "../../shared/types";
import type { MainPanelTab } from "../layout/MainPanel";

interface GuildRegionMasteryProps {
  guild: Guild;
  onOpenSystem: (tab: MainPanelTab) => void;
}

export function GuildRegionMastery({ guild, onOpenSystem }: GuildRegionMasteryProps) {
  const regions = useMemo(() => buildGuildRegionMastery(guild), [guild]);
  const [selectedRegionId, setSelectedRegionId] = useState(regions[0]?.definition.id ?? "");
  const selected = regions.find((entry) => entry.definition.id === selectedRegionId) ?? regions[0];
  const totalPoints = regions.reduce((total, region) => total + region.points, 0);
  const rankedRegions = regions.filter((region) => region.rank > 0).length;

  if (!selected) return null;

  return (
    <section className="guild-region-mastery">
      <header>
        <div className="guild-region-mastery-seal" aria-hidden="true">
          <i>RM</i><span>{rankedRegions}/{regions.length}</span>
        </div>
        <div>
          <span>Lifetime regional command</span>
          <h4>Campaign Region Mastery</h4>
          <p>Successful field time, Boss reports and support Contracts establish permanent local expertise.</p>
        </div>
        <div className="guild-region-mastery-summary" aria-live="polite">
          <Summary label="Regions charted" value={`${rankedRegions}/${regions.length}`} />
          <Summary label="Mastery points" value={String(totalPoints)} />
          <Summary label="Highest rank" value={highestRankName(regions)} />
          <Summary label="Local ceiling" value="+4% XP / gold" />
        </div>
      </header>

      <div
        aria-label="Campaign regions"
        aria-orientation="horizontal"
        className="guild-region-mastery-tabs"
        role="tablist"
      >
        {regions.map((region) => (
          <button
            aria-controls="guild-region-mastery-dossier"
            aria-selected={region.definition.id === selected.definition.id}
            id={`guild-region-tab-${region.definition.id}`}
            key={region.definition.id}
            onClick={() => setSelectedRegionId(region.definition.id)}
            onKeyDown={handleTabKeyDown}
            role="tab"
            tabIndex={region.definition.id === selected.definition.id ? 0 : -1}
            type="button"
          >
            <i aria-hidden="true">{region.definition.sigil}</i>
            <span>
              <small>Rank {region.rank} / {region.rankName}</small>
              <strong>{region.definition.name}</strong>
              <em>{region.points} mastery points</em>
            </span>
            <b>+{region.rank}%</b>
            <progress
              aria-label={`${region.definition.name} rank progress`}
              max={100}
              value={region.progressPercent}
            />
          </button>
        ))}
      </div>

      <div
        aria-labelledby={`guild-region-tab-${selected.definition.id}`}
        className="guild-region-mastery-dossier"
        id="guild-region-mastery-dossier"
        role="tabpanel"
        tabIndex={0}
      >
        <header>
          <i aria-hidden="true">{selected.definition.sigil}</i>
          <div>
            <span>{selected.definition.cities.join(" / ")} campaign territory</span>
            <h5>{selected.definition.name}</h5>
            <p>{selected.definition.description}</p>
          </div>
          <div>
            <span>Current patent</span>
            <strong>{selected.rankName}</strong>
            <small>
              {selected.nextRankPoints
                ? `${selected.nextRankPoints - selected.points} points to ${selected.nextRankName}`
                : "Maximum regional mastery"}
            </small>
          </div>
        </header>

        <div className="guild-region-mastery-progress">
          <span>
            <i style={{ width: `${selected.progressPercent}%` }} />
          </span>
          <strong>{selected.points}{selected.nextRankPoints ? ` / ${selected.nextRankPoints}` : " / MAX"}</strong>
        </div>

        <div className="guild-region-mastery-sources">
          <Source
            detail={`${selected.progress.successfulHuntMinutes} successful minutes`}
            label="Field Hunts"
            points={`${Math.floor(selected.progress.successfulHuntMinutes / 15)} pts`}
            value={`${selected.progress.successfulHunts} reports`}
          />
          <Source
            detail="+1 attempt / +4 victory"
            label="Boss Campaign"
            points={`${selected.progress.bossAttempts + selected.progress.bossDefeats * 4} pts`}
            value={`${selected.progress.bossDefeats}/${selected.progress.bossAttempts} defeated`}
          />
          <Source
            detail="+1 return / +3 success"
            label="Support Contracts"
            points={`${selected.progress.contractsCompleted + selected.progress.contractsSucceeded * 3} pts`}
            value={`${selected.progress.contractsSucceeded}/${selected.progress.contractsCompleted} succeeded`}
          />
          <div className="guild-region-mastery-bonus">
            <span>Regional expertise</span>
            <strong>+{selected.huntXpBonusPercent}% Hunt XP</strong>
            <strong>+{selected.huntGoldBonusPercent}% Hunt Gold</strong>
            <small>Only applies to hunts in {selected.definition.cities.join(" / ")}.</small>
          </div>
        </div>

        <footer>
          <span>Commands</span>
          <div>
            <button onClick={() => onOpenSystem("hunts")} type="button">Open Hunts</button>
            <button onClick={() => onOpenSystem("bosses")} type="button">Open Bosses</button>
            <button onClick={() => onOpenSystem("contracts")} type="button">Open Contracts</button>
          </div>
          <p>Every 15 successful hunt minutes grants one point. Failed hunts grant none.</p>
        </footer>
      </div>
    </section>
  );
}

function handleTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
  const tabs = Array.from(
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [],
  );
  const currentIndex = tabs.indexOf(event.currentTarget);
  if (currentIndex < 0 || tabs.length === 0) return;
  let nextIndex: number | undefined;
  if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (currentIndex + 1) % tabs.length;
  if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
  if (event.key === "Home") nextIndex = 0;
  if (event.key === "End") nextIndex = tabs.length - 1;
  if (nextIndex === undefined) return;
  event.preventDefault();
  tabs[nextIndex].focus();
  tabs[nextIndex].click();
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function Source({ detail, label, points, value }: { detail: string; label: string; points: string; value: string }) {
  return (
    <article>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
      <b>{points}</b>
    </article>
  );
}

function highestRankName(regions: ReturnType<typeof buildGuildRegionMastery>) {
  return regions.reduce((highest, region) => region.rank > highest.rank ? region : highest, regions[0]).rankName;
}
