import { useMemo } from "react";
import {
  buildRegionalAcquisitionForecast,
  type RegionalAcquisitionForecastDay,
  type RegionalAcquisitionForecastMatch,
} from "../../game-engine/regional-orders/buildRegionalAcquisitionForecast";
import type { Character, Guild, GuildDepot } from "../../shared/types";
import { useLocalCampaignNow } from "../hooks/useLocalCampaignNow";
import { ItemIcon } from "../items/ItemIcon";

interface RegionalAcquisitionForecastProps {
  characters: Character[];
  depot: GuildDepot;
  guild: Guild;
}

export function RegionalAcquisitionForecast({ characters, depot, guild }: RegionalAcquisitionForecastProps) {
  const campaignNow = useLocalCampaignNow();
  const forecast = useMemo(
    () => buildRegionalAcquisitionForecast(guild, depot, characters, campaignNow),
    [campaignNow, characters, depot, guild],
  );

  return (
    <section className="regional-acquisition-forecast" aria-labelledby="regional-acquisition-forecast-title">
      <header>
        <div className="regional-acquisition-forecast-seal" aria-hidden="true"><i>RF</i><span>7D</span></div>
        <div>
          <span>Deterministic local rotation outlook</span>
          <h4 id="regional-acquisition-forecast-title">Regional Acquisition Forecast</h4>
          <p>Preview the next seven order rotations against shortages that exist in Logistics right now.</p>
        </div>
        <div className="regional-acquisition-forecast-summary">
          <Summary label="Horizon" value={`${forecast.startDateKey} / ${forecast.endDateKey}`} />
          <Summary label="Short materials" value={String(forecast.shortageCount)} />
          <Summary label="Matched materials" value={String(forecast.forecastMaterialCount)} />
          <Summary label="Reachable" value={String(forecast.actionableMaterialCount)} />
        </div>
      </header>

      <div className="regional-acquisition-forecast-grid">
        {forecast.days.map((day) => <ForecastDay day={day} key={day.dateKey} />)}
      </div>

      <footer>
        <span>Forecast only. Future progress, availability and shortages are recalculated when that local day arrives.</span>
        <strong>{forecast.firstActionableDateKey ? `First reachable cache ${formatDateKey(forecast.firstActionableDateKey)}` : "No reachable cache in this horizon"}</strong>
      </footer>
    </section>
  );
}

function ForecastDay({ day }: { day: RegionalAcquisitionForecastDay }) {
  return (
    <article className={day.matches.length > 0 ? day.actionableCount > 0 ? "has-actionable" : "has-locked" : "is-empty"}>
      <header>
        <div><span>{day.daysFromNow === 1 ? "Tomorrow" : `In ${day.daysFromNow} days`}</span><strong>{formatDateKey(day.dateKey)}</strong></div>
        <b>{day.matches.length > 0 ? `${day.matches.length} offer${day.matches.length === 1 ? "" : "s"}` : "No match"}</b>
      </header>
      {day.matches.length > 0 ? (
        <div className="regional-acquisition-forecast-matches">
          {day.matches.map((entry) => <ForecastMatch entry={entry} key={entry.id} />)}
        </div>
      ) : (
        <p>No current Logistics shortage appears in this rotation.</p>
      )}
      <footer>{day.actionableCount > 0 ? `${day.actionableCount} reachable offer${day.actionableCount === 1 ? "" : "s"}` : day.matches.length > 0 ? "Guild Level unlock required" : "Rotation clear"}</footer>
    </article>
  );
}

function ForecastMatch({ entry }: { entry: RegionalAcquisitionForecastMatch }) {
  return (
    <div className={entry.unlocked ? "is-unlocked" : "is-locked"}>
      <ItemIcon item={entry.item} showBadges={false} size="small" />
      <span><small>{entry.regionSigil} / {entry.difficultyLabel} / {entry.rewardTableLabel}</small><strong>{entry.item.name} x{entry.quantity}</strong><em>{entry.contribution}/{entry.missing} shortage coverage</em></span>
      <b>{entry.unlocked ? "Reachable" : `Lv ${entry.requiredGuildLevel}`}</b>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function formatDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  return Number.isFinite(date.getTime())
    ? date.toLocaleDateString(undefined, { month: "short", day: "2-digit" })
    : value;
}
