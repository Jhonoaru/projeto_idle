import { useMemo, useState } from "react";
import { buildRegionalRewardCompendium, type RegionalRewardCompendiumMaterial } from "../../game-engine/regional-orders/buildRegionalRewardCompendium";
import type { GuildDepot } from "../../shared/types";
import { ItemIcon } from "../items/ItemIcon";

interface RegionalRewardCompendiumProps {
  depot: GuildDepot;
}

export function RegionalRewardCompendium({ depot }: RegionalRewardCompendiumProps) {
  const compendium = useMemo(() => buildRegionalRewardCompendium(depot), [depot]);
  const [selectedRegionId, setSelectedRegionId] = useState(() => compendium.regions[0]?.regionId ?? "");
  const selectedRegion = compendium.regions.find((region) => region.regionId === selectedRegionId) ?? compendium.regions[0];
  if (!selectedRegion) return null;

  return (
    <section className="regional-reward-compendium" aria-labelledby="regional-reward-compendium-title">
      <header>
        <div className="regional-reward-compendium-seal" aria-hidden="true"><i>RR</i><span>{compendium.routeCount}</span></div>
        <div>
          <span>Quartermaster field index</span>
          <h4 id="regional-reward-compendium-title">Regional Reward Compendium</h4>
          <p>Compare every deterministic Veteran and Elite cache before choosing a daily campaign route.</p>
        </div>
        <div className="regional-reward-compendium-summary">
          <Summary label="Regional tables" value={String(compendium.regions.length)} />
          <Summary label="Reward routes" value={String(compendium.routeCount)} />
          <Summary label="Unique materials" value={String(compendium.uniqueMaterialCount)} />
          <Summary label="Depot stock" value={String(compendium.stockedMaterials)} />
        </div>
      </header>

      <div className="regional-reward-compendium-tabs" role="tablist" aria-label="Regional reward tables">
        {compendium.regions.map((region) => (
          <button
            aria-controls="regional-reward-compendium-panel"
            aria-selected={region.regionId === selectedRegion.regionId}
            className={region.regionId === selectedRegion.regionId ? "is-selected" : undefined}
            id={`regional-reward-tab-${region.regionId}`}
            key={region.regionId}
            onClick={() => setSelectedRegionId(region.regionId)}
            onKeyDown={handleTabKeyDown}
            role="tab"
            tabIndex={region.regionId === selectedRegion.regionId ? 0 : -1}
            type="button"
          >
            <i aria-hidden="true">{region.regionSigil}</i>
            <span><strong>{region.regionName}</strong><small>{region.tableShortLabel} / {region.stockedMaterials} stocked</small></span>
          </button>
        ))}
      </div>

      <div
        aria-labelledby={`regional-reward-tab-${selectedRegion.regionId}`}
        className="regional-reward-compendium-panel"
        id="regional-reward-compendium-panel"
        role="tabpanel"
        tabIndex={0}
      >
        <header>
          <div><span>{selectedRegion.tableShortLabel}</span><strong>{selectedRegion.tableLabel}</strong></div>
          <p>{selectedRegion.description}</p>
        </header>
        <div className="regional-reward-compendium-routes">
          {selectedRegion.routes.map((route) => (
            <article key={route.objective}>
              <header><i aria-hidden="true">{route.sigil}</i><span><small>{route.shortLabel}</small><strong>{route.label}</strong></span></header>
              <p>{route.description}</p>
              <RewardMaterial difficulty="Veteran" material={route.veteran} />
              <RewardMaterial difficulty="Elite" material={route.elite} />
            </article>
          ))}
        </div>
      </div>

      <footer><span>Standard orders remain treasury-only.</span><strong>Rewards are fixed at acceptance and delivered to the Guild Depot.</strong></footer>
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

function RewardMaterial({ difficulty, material }: { difficulty: "Veteran" | "Elite"; material: RegionalRewardCompendiumMaterial }) {
  return (
    <div className={`regional-reward-compendium-material is-${difficulty.toLowerCase()}`}>
      <ItemIcon item={material.item} quantity={material.quantity} showBadges={false} size="small" />
      <span><small>{difficulty} cache</small><strong>{material.item.name} x{material.quantity}</strong><em>{material.useLabels.join(" / ")}</em></span>
      <b title={`${material.owned.toLocaleString("en-US")} currently stored in the Guild Depot`}>{material.owned.toLocaleString("en-US")}<small>Owned</small></b>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}
