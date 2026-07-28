import { useEffect, useMemo, useState } from "react";
import {
  buildRegionalMaterialAcquisitionPlan,
  type RegionalMaterialAcquisitionEntry,
} from "../../game-engine/regional-orders/buildRegionalMaterialAcquisitionPlan";
import type { Character, Guild, GuildDepot } from "../../shared/types";
import { ItemIcon } from "../items/ItemIcon";

interface RegionalMaterialAcquisitionPlannerProps {
  characters: Character[];
  depot: GuildDepot;
  guild: Guild;
  onOpenLogistics: () => void;
  onReviewOrders: () => void;
}

export function RegionalMaterialAcquisitionPlanner({
  characters,
  depot,
  guild,
  onOpenLogistics,
  onReviewOrders,
}: RegionalMaterialAcquisitionPlannerProps) {
  const plan = useMemo(
    () => buildRegionalMaterialAcquisitionPlan(guild, depot, characters),
    [characters, depot, guild],
  );
  const [selectedItemId, setSelectedItemId] = useState(() => plan.entries[0]?.item.id ?? "");
  const selected = plan.entries.find((entry) => entry.item.id === selectedItemId) ?? plan.entries[0];

  useEffect(() => {
    if (!selected || selected.item.id === selectedItemId) return;
    setSelectedItemId(selected.item.id);
  }, [selected, selectedItemId]);

  return (
    <section className="regional-acquisition-planner" aria-labelledby="regional-acquisition-planner-title">
      <header>
        <div className="regional-acquisition-planner-seal" aria-hidden="true"><i>AP</i><span>{plan.materialCount}</span></div>
        <div>
          <span>Quartermaster route intelligence</span>
          <h4 id="regional-acquisition-planner-title">Regional Material Acquisition Planner</h4>
          <p>Match live guild shortages to deterministic Veteran and Elite regional caches.</p>
        </div>
        <div className="regional-acquisition-planner-summary">
          <Summary label="Planning scope" value={plan.scope === "priorities" ? "Pinned" : "All active"} />
          <Summary label="Objectives" value={String(plan.objectiveCount)} />
          <Summary label="Short materials" value={String(plan.materialCount)} />
          <Summary label="Units missing" value={plan.missingMaterials.toLocaleString("en-US")} />
        </div>
      </header>

      {selected ? (
        <div className="regional-acquisition-planner-workspace">
          <div className="regional-acquisition-planner-materials" role="tablist" aria-label="Missing regional materials" aria-orientation="vertical">
            <div role="presentation"><span>{plan.scopeLabel}</span><strong>{plan.routedMaterialCount}/{plan.materialCount} have cache routes</strong></div>
            {plan.entries.map((entry) => (
              <button
                aria-controls="regional-acquisition-planner-dossier"
                aria-selected={entry.item.id === selected.item.id}
                className={entry.item.id === selected.item.id ? "is-selected" : undefined}
                id={`regional-acquisition-material-${entry.item.id}`}
                key={entry.item.id}
                onClick={() => setSelectedItemId(entry.item.id)}
                onKeyDown={handleMaterialKeyDown}
                role="tab"
                tabIndex={entry.item.id === selected.item.id ? 0 : -1}
                type="button"
              >
                <ItemIcon item={entry.item} showBadges={false} size="small" />
                <span><strong>{entry.item.name}</strong><small>{entry.available}/{entry.required} in Guild Depot</small></span>
                <b>Need {entry.missing.toLocaleString("en-US")}</b>
              </button>
            ))}
          </div>

          <div
            aria-labelledby={`regional-acquisition-material-${selected.item.id}`}
            className="regional-acquisition-planner-dossier"
            id="regional-acquisition-planner-dossier"
            role="tabpanel"
            tabIndex={0}
          >
            <MaterialDossier entry={selected} />
          </div>
        </div>
      ) : (
        <div className="regional-acquisition-planner-complete">
          <i aria-hidden="true">OK</i>
          <div><strong>No material shortage in this scope</strong><span>Current Guild Depot stock covers every listed logistics objective.</span></div>
        </div>
      )}

      <footer>
        <span>Planning only. No order is accepted and no material is reserved automatically.</span>
        <div><button onClick={onOpenLogistics} type="button">Open Logistics</button><button onClick={onReviewOrders} type="button">Review Regional Orders</button></div>
      </footer>
    </section>
  );
}

function MaterialDossier({ entry }: { entry: RegionalMaterialAcquisitionEntry }) {
  return (
    <>
      <header>
        <ItemIcon item={entry.item} showBadges={false} size="medium" />
        <div><span>Active material shortage</span><strong>{entry.item.name}</strong><small>{entry.available.toLocaleString("en-US")} owned / {entry.required.toLocaleString("en-US")} required</small></div>
        <b>{entry.missing.toLocaleString("en-US")}<small>Missing</small></b>
      </header>
      <div className="regional-acquisition-planner-progress">
        <span
          aria-label={`${entry.item.name} acquisition progress`}
          aria-valuemax={entry.required}
          aria-valuemin={0}
          aria-valuenow={Math.min(entry.available, entry.required)}
          role="progressbar"
        ><i style={{ width: `${Math.min(100, Math.round((entry.available / entry.required) * 100))}%` }} /></span>
        <strong>{Math.min(entry.available, entry.required).toLocaleString("en-US")} / {entry.required.toLocaleString("en-US")}</strong>
      </div>
      <div className="regional-acquisition-planner-demand">
        <span>Required by</span>
        <div>{entry.sources.map((source) => <small key={source.id}><strong>{source.title}</strong>{source.targetLabel}</small>)}</div>
      </div>
      <section className="regional-acquisition-planner-routes">
        <header><span>Regional cache routes</span><strong>{entry.routes.length} options</strong></header>
        {entry.routes.length > 0 ? (
          <div>
            {entry.routes.map((route) => (
              <article className={`${route.recommended ? "is-recommended" : ""} ${route.nextUnlock ? "is-next-unlock" : ""} ${route.unlocked ? "" : "is-locked"}`} key={route.id}>
                <i aria-hidden="true">{route.regionSigil}</i>
                <div><span>{route.regionName} / {route.tableLabel}</span><strong>{route.objectiveLabel}</strong><small>{route.difficultyLabel} cache / x{route.quantity} per claim</small></div>
                <b>{route.claimsNeeded}<small>{route.claimsNeeded === 1 ? "claim" : "claims"}</small></b>
                <em>{route.recommended ? "Best route" : route.nextUnlock ? `Next unlock / Guild Lv ${route.requiredGuildLevel}` : route.unlocked ? "Unlocked" : `Guild Lv ${route.requiredGuildLevel}`}</em>
              </article>
            ))}
          </div>
        ) : <p>No Regional Order cache supplies this material. Review its Hunt sources in Logistics.</p>}
      </section>
    </>
  );
}

function handleMaterialKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
  const tabs = Array.from(event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? []);
  const currentIndex = tabs.indexOf(event.currentTarget);
  if (currentIndex < 0 || tabs.length === 0) return;
  let nextIndex: number | undefined;
  if (event.key === "ArrowDown" || event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
  if (event.key === "ArrowUp" || event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
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
