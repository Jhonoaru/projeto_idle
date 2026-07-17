import { useEffect, useMemo, useState } from "react";
import { items } from "../../data/items";
import {
  buildHeadquartersResourcePlan,
  type HeadquartersResourcePlanMode,
} from "../../game-engine/headquarters/buildHeadquartersResourcePlan";
import type { Character, Guild, GuildDepot, HuntArea } from "../../shared/types";
import { ItemIcon } from "../items/ItemIcon";

interface HeadquartersResourcePlannerProps {
  characters: Character[];
  depot: GuildDepot;
  guild: Guild;
  onTrackHunt: (hunt: HuntArea) => void;
}

export function HeadquartersResourcePlanner({ characters, depot, guild, onTrackHunt }: HeadquartersResourcePlannerProps) {
  const [mode, setMode] = useState<HeadquartersResourcePlanMode>("next");
  const plan = useMemo(
    () => buildHeadquartersResourcePlan(guild.headquarters, depot, characters, mode),
    [characters, depot, guild.headquarters, mode],
  );
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const selectedEntry = plan.entries.find((entry) => entry.itemId === selectedItemId) ?? plan.entries[0];

  useEffect(() => {
    if (selectedItemId && !plan.entries.some((entry) => entry.itemId === selectedItemId)) setSelectedItemId(null);
  }, [plan.entries, selectedItemId]);

  return (
    <section className="headquarters-resource-planner">
      <header className="ranking-section-heading">
        <div><span>Campaign logistics</span><h3>Resource Planner</h3></div>
        <div className="headquarters-plan-modes" aria-label="Resource plan scope">
          <button aria-pressed={mode === "next"} onClick={() => setMode("next")} type="button">Next Levels</button>
          <button aria-pressed={mode === "completion"} onClick={() => setMode("completion")} type="button">Full Completion</button>
        </div>
      </header>

      {plan.targetLevels === 0 ? (
        <div className="headquarters-plan-complete"><strong>Headquarters complete</strong><span>All twelve facility levels have been constructed.</span></div>
      ) : (
        <>
          <div className="headquarters-plan-summary">
            <Summary label="Upgrade targets" value={`${plan.targetLevels}`} />
            <Summary label="Materials required" value={`${plan.requiredMaterials}`} />
            <Summary label="Covered by Depot" value={`${plan.coveredMaterials}`} />
            <Summary label="Still to recover" value={`${plan.missingMaterials}`} alert={plan.missingMaterials > 0} />
          </div>
          <div className="headquarters-plan-workspace">
            <div className="headquarters-plan-materials" aria-label="Headquarters material targets">
              {plan.entries.map((entry) => (
                <button
                  aria-pressed={entry.itemId === selectedEntry?.itemId}
                  className={entry.missing > 0 ? "is-missing" : "is-ready"}
                  key={entry.itemId}
                  onClick={() => setSelectedItemId(entry.itemId)}
                  type="button"
                >
                  <ItemIcon item={items[entry.itemId]} showQuantity={false} size="small" />
                  <span><strong>{entry.name}</strong><small>{entry.available}/{entry.required} in Guild Depot</small></span>
                  <b>{entry.missing > 0 ? `Need ${entry.missing}` : "Ready"}</b>
                </button>
              ))}
            </div>

            <div className="headquarters-plan-sources">
              <header>
                <span>Hunt sources</span>
                <strong>{selectedEntry?.name ?? "No pending materials"}</strong>
              </header>
              {selectedEntry?.sources.length ? selectedEntry.sources.map((source) => (
                <article className={`is-${source.status}`} key={source.hunt.id}>
                  <div>
                    <span>{source.hunt.city} / Level {source.hunt.minLevel}+</span>
                    <strong>{source.hunt.name}</strong>
                    <small>{source.monsterNames.join(", ")} · {(source.bestDropChance * 100).toFixed(source.bestDropChance < 0.1 ? 1 : 0)}% · Qty {source.quantityRange}</small>
                  </div>
                  <div>
                    <em>{source.statusLabel}</em>
                    <button disabled={source.status !== "ready"} onClick={() => onTrackHunt(source.hunt)} type="button">Open Hunt</button>
                  </div>
                </article>
              )) : <p>No campaign hunt currently drops this material.</p>}
            </div>
          </div>
          <small className="headquarters-plan-note">Counts use unlocked root stacks in the Guild Depot. Drop rates come directly from each creature's local loot table.</small>
        </>
      )}
    </section>
  );
}

function Summary({ label, value, alert = false }: { label: string; value: string; alert?: boolean }) {
  return <div className={alert ? "is-alert" : ""}><span>{label}</span><strong>{value}</strong></div>;
}
