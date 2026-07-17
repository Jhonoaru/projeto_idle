import { useEffect, useMemo, useState } from "react";
import { items } from "../../data/items";
import {
  buildGuildLogisticsPlan,
  type GuildLogisticsCategory,
  type GuildLogisticsDestination,
  type GuildLogisticsObjective,
} from "../../game-engine/logistics/buildGuildLogisticsPlan";
import type { Character, Guild, GuildDepot, HuntArea } from "../../shared/types";
import { MAX_GUILD_LOGISTICS_PINS } from "../../game-engine/logistics/normalizeGuildLogisticsState";
import type { GuildLogisticsPinAction } from "../../game-engine/logistics/updateGuildLogisticsPin";
import { getGuildLogisticsObjectiveAlertKey, getGuildLogisticsUnreadCount } from "../../game-engine/logistics/syncGuildLogisticsAlerts";
import { normalizeGuildLogisticsState } from "../../game-engine/logistics/normalizeGuildLogisticsState";
import { ItemIcon } from "../items/ItemIcon";

type LogisticsFilter = "all" | "pinned" | GuildLogisticsCategory;

interface GuildLogisticsBoardProps {
  characters: Character[];
  depot: GuildDepot;
  guild: Guild;
  onOpenSystem: (destination: GuildLogisticsDestination) => void;
  onTrackHunt: (hunt: HuntArea) => void;
  onUpdatePin: (objectiveId: string, action: GuildLogisticsPinAction, activeObjectiveIds: string[]) => void;
  onAcknowledgeAlerts: () => void;
}

const filters: Array<{ id: LogisticsFilter; label: string }> = [
  { id: "all", label: "All Orders" },
  { id: "pinned", label: "Pinned" },
  { id: "headquarters", label: "Headquarters" },
  { id: "projects", label: "Projects" },
  { id: "wardrobe", label: "Wardrobe" },
];

export function GuildLogisticsBoard({ characters, depot, guild, onOpenSystem, onTrackHunt, onUpdatePin, onAcknowledgeAlerts }: GuildLogisticsBoardProps) {
  const plan = useMemo(() => buildGuildLogisticsPlan(guild, depot, characters), [characters, depot, guild]);
  const [filter, setFilter] = useState<LogisticsFilter>("all");
  const filteredObjectives = filter === "all"
    ? plan.objectives
    : filter === "pinned"
      ? plan.pinnedObjectives
      : plan.objectives.filter((objective) => objective.category === filter);
  const activeObjectiveIds = plan.objectives.map((objective) => objective.id);
  const logisticsState = normalizeGuildLogisticsState(guild.logistics);
  const unreadCount = getGuildLogisticsUnreadCount(guild);
  const unreadObjectives = plan.pinnedObjectives.filter((objective) => logisticsState.unreadReadyKeys.includes(getGuildLogisticsObjectiveAlertKey(objective)));
  const [selectedObjectiveId, setSelectedObjectiveId] = useState(plan.objectives[0]?.id ?? "");
  const selectedObjective = filteredObjectives.find((objective) => objective.id === selectedObjectiveId) ?? filteredObjectives[0];
  const [selectedMaterialId, setSelectedMaterialId] = useState(selectedObjective?.materials[0]?.itemId ?? "");
  const selectedMaterial = selectedObjective?.materials.find((material) => material.itemId === selectedMaterialId) ?? selectedObjective?.materials[0];

  useEffect(() => {
    if (!selectedObjective || selectedObjective.id !== selectedObjectiveId) {
      setSelectedObjectiveId(selectedObjective?.id ?? "");
      setSelectedMaterialId(selectedObjective?.materials[0]?.itemId ?? "");
    }
  }, [selectedObjective, selectedObjectiveId]);

  function selectObjective(objective: GuildLogisticsObjective) {
    setSelectedObjectiveId(objective.id);
    setSelectedMaterialId(objective.materials.find((material) => material.missing > 0)?.itemId ?? objective.materials[0]?.itemId ?? "");
  }

  return (
    <div className="logistics-board">
      <section className="logistics-hero">
        <div className="logistics-seal" aria-hidden="true"><i>L</i><span>{plan.objectives.length}</span></div>
        <div className="logistics-identity">
          <span>Guild logistics office</span>
          <h3>Campaign Orders</h3>
          <p>One local ledger for permanent construction, guild works and Wardrobe exchanges funded by the current campaign.</p>
        </div>
        <div className="logistics-summary">
          <Summary label="Active orders" value={`${plan.objectives.length}`} />
          <Summary label="Ready now" value={`${plan.readyObjectives}`} positive={plan.readyObjectives > 0} />
          <Summary label="Materials missing" value={`${plan.missingMaterials}`} alert={plan.missingMaterials > 0} />
          <Summary label="Listed gold costs" value={`${plan.listedGoldCosts.toLocaleString("en-US")}g`} />
        </div>
      </section>

      <section className="logistics-pinboard">
        <header>
          <div><span>Guild campaign focus</span><h3>Priority Pinboard</h3></div>
          <strong>{plan.pinnedObjectives.length}/{MAX_GUILD_LOGISTICS_PINS} pinned</strong>
        </header>
        {unreadCount > 0 ? (
          <div className="logistics-ready-alert" role="status">
            <div>
              <strong>{unreadCount} {unreadCount === 1 ? "priority is" : "priorities are"} ready</strong>
              <span>{unreadObjectives.map((objective) => objective.title).join(" / ") || "Review the current campaign priorities."}</span>
            </div>
            <button onClick={onAcknowledgeAlerts} type="button">Mark reviewed</button>
          </div>
        ) : null}
        <div className="logistics-pin-summary">
          <span>Focused material progress</span>
          <strong>{plan.pinnedCoveredMaterials}/{plan.pinnedRequiredMaterials}</strong>
          <small>{plan.pinnedMissingMaterials > 0 ? `${plan.pinnedMissingMaterials} still missing` : plan.pinnedObjectives.length > 0 ? "Pinned materials ready" : "Pin an order to focus its demand"}</small>
        </div>
        <div className="logistics-pin-slots">
          {Array.from({ length: MAX_GUILD_LOGISTICS_PINS }, (_, index) => {
            const objective = plan.pinnedObjectives[index];
            return objective ? (
              <article key={objective.id} className={`is-${objective.status}${logisticsState.unreadReadyKeys.includes(getGuildLogisticsObjectiveAlertKey(objective)) ? " is-unread" : ""}`}>
                <button onClick={() => selectObjective(objective)} type="button">
                  <i>{index + 1}</i>
                  <span><small>{categoryLabel(objective.category)}</small><strong>{objective.title}</strong><em>{statusLabel(objective.status)}</em></span>
                </button>
                <div>
                  <button aria-label={`Move ${objective.title} up`} disabled={index === 0} onClick={() => onUpdatePin(objective.id, "up", activeObjectiveIds)} title="Move priority up" type="button">Up</button>
                  <button aria-label={`Move ${objective.title} down`} disabled={index === plan.pinnedObjectives.length - 1} onClick={() => onUpdatePin(objective.id, "down", activeObjectiveIds)} title="Move priority down" type="button">Down</button>
                  <button aria-label={`Unpin ${objective.title}`} onClick={() => onUpdatePin(objective.id, "unpin", activeObjectiveIds)} title="Remove from pinboard" type="button">Unpin</button>
                </div>
              </article>
            ) : <div className="logistics-pin-empty" key={`empty-${index}`}><i>{index + 1}</i><span>Open priority slot</span></div>;
          })}
        </div>
        <small>Pins define display priority only. They never reserve gold or materials and do not start activities automatically.</small>
      </section>

      <section className="logistics-material-ledger">
        <header><span>Combined material demand</span><strong>{plan.coveredMaterials}/{plan.requiredMaterials} covered by eligible Guild Depot stacks</strong></header>
        <div>
          {plan.materialTotals.map((material) => (
            <article className={material.missing > 0 ? "is-missing" : "is-ready"} key={material.itemId}>
              <ItemIcon item={items[material.itemId]} showQuantity={false} size="small" />
              <span><strong>{material.name}</strong><small>{material.available}/{material.required}</small></span>
              <b>{material.missing > 0 ? `-${material.missing}` : "OK"}</b>
            </article>
          ))}
        </div>
        <small>Combined demand is a planning total. Each order remains an independent transaction and no resource is reserved automatically.</small>
      </section>

      <div className="logistics-workspace">
        <section className="logistics-orders">
          <header className="ranking-section-heading">
            <div><span>Campaign register</span><h3>Objective Queue</h3></div>
            <strong>{filteredObjectives.length} visible</strong>
          </header>
          <div className="logistics-filters" aria-label="Logistics categories">
            {filters.map((entry) => <button aria-pressed={filter === entry.id} key={entry.id} onClick={() => setFilter(entry.id)} type="button">{entry.label}</button>)}
          </div>
          <div className="logistics-order-list">
            {filteredObjectives.map((objective) => (
              <button aria-pressed={objective.id === selectedObjective?.id} className={`is-${objective.status}${objective.isPinned ? " is-pinned" : ""}`} key={objective.id} onClick={() => selectObjective(objective)} type="button">
                <i>{categorySigil(objective.category)}</i>
                <span><small>{objective.priority ? `Priority ${objective.priority} / ` : ""}{categoryLabel(objective.category)} / {objective.targetLabel}</small><strong>{objective.title}</strong><em>{objective.subtitle}</em></span>
                <b>{statusLabel(objective.status)}</b>
              </button>
            ))}
          </div>
        </section>

        <aside className="logistics-dossier">
          {selectedObjective ? (
            <>
              <header className="logistics-dossier-heading">
                <span>Selected order</span>
                <div>
                  <strong>{selectedObjective.targetLabel}</strong>
                  <button
                    aria-pressed={selectedObjective.isPinned}
                    disabled={!selectedObjective.isPinned && plan.pinnedObjectives.length >= MAX_GUILD_LOGISTICS_PINS}
                    onClick={() => onUpdatePin(selectedObjective.id, selectedObjective.isPinned ? "unpin" : "pin", activeObjectiveIds)}
                    title={selectedObjective.isPinned ? "Remove from priority pinboard" : "Add to priority pinboard"}
                    type="button"
                  >{selectedObjective.isPinned ? "Unpin" : "Pin order"}</button>
                </div>
              </header>
              <div className="logistics-order-profile">
                <i>{categorySigil(selectedObjective.category)}</i>
                <div><span>{categoryLabel(selectedObjective.category)}</span><h3>{selectedObjective.title}</h3><p>{selectedObjective.description}</p></div>
              </div>
              <div className="logistics-cost-strip">
                <div><span>Gold cost</span><strong>{selectedObjective.goldRequired.toLocaleString("en-US")}g</strong><small>{guild.gold.toLocaleString("en-US")}g spendable</small></div>
                <div><span>Material lines</span><strong>{selectedObjective.materials.length}</strong><small>{selectedObjective.materials.filter((material) => material.missing > 0).length} incomplete</small></div>
                <div className={`is-${selectedObjective.status}`}><span>Order status</span><strong>{statusLabel(selectedObjective.status)}</strong><small>{selectedObjective.blockers.length || "No blockers"}</small></div>
              </div>
              {selectedObjective.materials.length > 0 ? (
                <div className="logistics-material-requirements" aria-label="Selected order materials">
                  {selectedObjective.materials.map((material) => (
                    <button aria-pressed={material.itemId === selectedMaterial?.itemId} className={material.missing > 0 ? "is-missing" : "is-ready"} key={material.itemId} onClick={() => setSelectedMaterialId(material.itemId)} type="button">
                      <ItemIcon item={items[material.itemId]} showQuantity={false} size="small" />
                      <span><strong>{material.name}</strong><small>{material.available}/{material.required} in Guild Depot</small></span>
                      <b>{material.missing > 0 ? `Need ${material.missing}` : "Ready"}</b>
                    </button>
                  ))}
                </div>
              ) : <div className="logistics-no-materials">This order requires guild gold only.</div>}
              {selectedObjective.blockers.length > 0 ? <div className="logistics-blockers">{selectedObjective.blockers.map((blocker) => <small key={blocker}>{blocker}</small>)}</div> : null}
              {selectedMaterial ? (
                <div className="logistics-hunt-sources">
                  <header><span>Recovery routes</span><strong>{selectedMaterial.name}</strong></header>
                  {selectedMaterial.sources.length > 0 ? selectedMaterial.sources.map((source) => (
                    <article className={`is-${source.status}`} key={source.hunt.id}>
                      <div><span>{source.hunt.city} / Level {source.hunt.minLevel}+</span><strong>{source.hunt.name}</strong><small>{source.monsterNames.join(", ")} / {(source.bestDropChance * 100).toFixed(source.bestDropChance < 0.1 ? 1 : 0)}% / Qty {source.quantityRange}</small></div>
                      <div><em>{source.statusLabel}</em><button disabled={source.status !== "ready"} onClick={() => onTrackHunt(source.hunt)} type="button">Open Hunt</button></div>
                    </article>
                  )) : <p>No campaign hunt currently lists this material.</p>}
                </div>
              ) : null}
              <button className="logistics-open-system" onClick={() => onOpenSystem(selectedObjective.destination)} type="button">Open {destinationLabel(selectedObjective.destination)}</button>
            </>
          ) : <div className="logistics-empty"><strong>No active orders</strong><span>This category has no remaining permanent objectives.</span></div>}
        </aside>
      </div>
    </div>
  );
}

function Summary({ label, value, positive = false, alert = false }: { label: string; value: string; positive?: boolean; alert?: boolean }) {
  return <div className={positive ? "is-positive" : alert ? "is-alert" : ""}><span>{label}</span><strong>{value}</strong></div>;
}

function categorySigil(category: GuildLogisticsCategory) {
  return { headquarters: "HQ", projects: "PR", wardrobe: "WD" }[category];
}

function categoryLabel(category: GuildLogisticsCategory) {
  return { headquarters: "Headquarters", projects: "Guild Project", wardrobe: "Wardrobe Exchange" }[category];
}

function statusLabel(status: GuildLogisticsObjective["status"]) {
  return { ready: "Ready", materials: "Need Materials", gold: "Need Gold", locked: "Locked" }[status];
}

function destinationLabel(destination: GuildLogisticsDestination) {
  return { headquarters: "Headquarters", projects: "Guild Projects", store: "Wardrobe" }[destination];
}
