import { useEffect, useMemo, useState } from "react";
import { bosses } from "../../data/bosses";
import { hunts } from "../../data/hunts";
import {
  buildGuildLoadoutProcurementBoard,
  type GuildLoadoutProcurementRoute,
  type GuildLoadoutProcurementRouteKind,
} from "../../game-engine/loadout-templates/buildGuildLoadoutProcurementBoard";
import type { GuildLoadoutProcurementOrderRequest } from "../../game-engine/loadout-templates/updateGuildLoadoutProcurementOrder";
import { getItemVisualIdentity } from "../../game-engine/items/getItemVisualIdentity";
import type {
  Boss,
  Character,
  EquipmentSlot,
  Guild,
  GuildDepot,
  GuildLoadoutProcurementOrder,
  HuntArea,
} from "../../shared/types";
import { ItemIcon } from "../items/ItemIcon";

interface GuildLoadoutProcurementBoardProps {
  characters: Character[];
  depot: GuildDepot;
  guild: Guild;
  onOpenAcquisition: (characterId: string) => void;
  onOpenBoss: (boss: Boss) => void;
  onOpenForge: (characterId: string) => void;
  onOpenHunt: (hunt: HuntArea, characterId?: string) => void;
  onOpenInventory: (characterId: string) => void;
  onOpenMarket: () => void;
  onOpenQuartermaster: (characterId: string) => void;
  onOpenTemplates: (characterId: string) => void;
  onUpdateProcurementOrder: (request: GuildLoadoutProcurementOrderRequest) => void;
}

type ProcurementFilter =
  | "all"
  | "ready"
  | "holdings"
  | "hunt"
  | "boss"
  | "crafting"
  | "bazaar"
  | "blocked";

const slotLabels: Record<EquipmentSlot, string> = {
  weapon: "Weapon", offhand: "Offhand", helmet: "Helmet", armor: "Armor", legs: "Legs",
  boots: "Boots", amulet: "Amulet", ring: "Ring", backpack: "Backpack",
};

export function GuildLoadoutProcurementBoard({
  characters,
  depot,
  guild,
  onOpenAcquisition,
  onOpenBoss,
  onOpenForge,
  onOpenHunt,
  onOpenInventory,
  onOpenMarket,
  onOpenQuartermaster,
  onOpenTemplates,
  onUpdateProcurementOrder,
}: GuildLoadoutProcurementBoardProps) {
  const board = useMemo(
    () => buildGuildLoadoutProcurementBoard(guild, characters, depot),
    [characters, depot, guild],
  );
  const [filter, setFilter] = useState<ProcurementFilter>("all");
  const filteredRoutes = board.routes.filter((route) => matchesFilter(route, filter));
  const [selectedRouteKey, setSelectedRouteKey] = useState("");
  const selectedRoute = filteredRoutes.find((route) => route.key === selectedRouteKey)
    ?? filteredRoutes[0];

  useEffect(() => {
    if (selectedRoute && selectedRoute.key !== selectedRouteKey) {
      setSelectedRouteKey(selectedRoute.key);
    }
  }, [selectedRoute, selectedRouteKey]);
  const procurementOrders = board.dashboard.state.procurementOrders;
  const queuedKeys = new Set(procurementOrders.map((order) =>
    `${order.characterId}:${order.templateId}:${order.slot}`));

  return (
    <section className="loadout-procurement-board">
      <div className="procurement-summary">
        <Summary label="Active plans" value={String(board.summary.activePlans)} />
        <Summary label="Targets" value={String(board.summary.totalTargets)} />
        <Summary label="Equipped" value={String(board.summary.equippedTargets)} />
        <Summary label="Pending" value={String(board.summary.pendingTargets)} />
        <Summary label="Operations" value={String(board.summary.operations)} />
        <Summary label="Ready now" value={String(board.summary.readyOperations)} />
      </div>

      <section className="procurement-command">
        <header>
          <div><span>Guild equipment logistics</span><strong>Loadout Procurement Board</strong></div>
          <p>Consolidated manual routes for every unresolved target in the guild's active loadouts.</p>
          <b>{board.summary.completePlans}/{board.summary.activePlans} plans complete</b>
        </header>
        <div className="procurement-filter" role="group" aria-label="Procurement route filter">
          {([
            ["all", "All"],
            ["ready", "Ready"],
            ["holdings", "Holdings"],
            ["hunt", "Hunts"],
            ["boss", "Bosses"],
            ["crafting", "Crafting"],
            ["bazaar", "Bazaar"],
            ["blocked", "Blocked"],
          ] as Array<[ProcurementFilter, string]>).map(([id, label]) => (
            <button aria-pressed={filter === id} key={id} onClick={() => setFilter(id)} type="button">{label}</button>
          ))}
        </div>
      </section>

      <section className="procurement-priority-queue">
        <header>
          <div><span>Manual priority ledger</span><strong>Procurement Orders</strong></div>
          <b>{procurementOrders.length}/5 queued</b>
        </header>
        {procurementOrders.length > 0 ? (
          <div>
            {procurementOrders.map((order, index) => {
              const objectiveId = `${order.characterId}:${order.templateId}:${order.slot}`;
              const objective = board.objectives.find((entry) => entry.id === objectiveId);
              const dashboardEntry = board.dashboard.entries.find((entry) =>
                entry.character.id === order.characterId && entry.template?.id === order.templateId);
              const review = dashboardEntry?.review.reviews.find((entry) => entry.slot === order.slot);
              const fulfilled = review?.status === "equipped";
              const item = review?.item;
              return (
                <article className={fulfilled ? "is-fulfilled" : ""} key={objectiveId}>
                  <i>{index + 1}</i>
                  <ItemIcon item={item} showQuantity={false} size="small" />
                  <span>
                    <small>{dashboardEntry?.character.name ?? "Adventurer"} / {slotLabels[order.slot]}</small>
                    <strong>{item?.name ?? order.itemId}</strong>
                    <em>{fulfilled ? "Target fulfilled / remove when reviewed" : objective ? objective.recommended.label : "Route unavailable"}</em>
                  </span>
                  <div>
                    <button
                      aria-label={`Move ${item?.name ?? order.itemId} up`}
                      disabled={index === 0}
                      onClick={() => onUpdateProcurementOrder(orderRequest("move-up", order))}
                      title="Move priority up"
                      type="button"
                    >
                      ^
                    </button>
                    <button
                      aria-label={`Move ${item?.name ?? order.itemId} down`}
                      disabled={index === procurementOrders.length - 1}
                      onClick={() => onUpdateProcurementOrder(orderRequest("move-down", order))}
                      title="Move priority down"
                      type="button"
                    >
                      v
                    </button>
                    {objective ? (
                      <button
                        className="is-view-route"
                        onClick={() => {
                          setFilter("all");
                          setSelectedRouteKey(objective.recommended.key);
                        }}
                        type="button"
                      >
                        View Route
                      </button>
                    ) : null}
                    <button
                      aria-label={`Remove ${item?.name ?? order.itemId} from procurement orders`}
                      className="is-remove"
                      onClick={() => onUpdateProcurementOrder(orderRequest("remove", order))}
                      title="Remove priority"
                      type="button"
                    >
                      x
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p>Select unresolved targets below to build a five-item manual priority queue.</p>
        )}
      </section>

      {board.summary.activePlans === 0 ? (
        <div className="procurement-empty">
          <strong>No active loadout plans</strong>
          <span>Activate a saved template before building guild procurement routes.</span>
          <button onClick={() => onOpenTemplates(characters[0]?.id ?? "")} type="button">Open Loadout Templates</button>
        </div>
      ) : board.objectives.length === 0 ? (
        <div className="procurement-empty is-complete">
          <strong>All active loadouts are complete</strong>
          <span>Every assigned target is currently equipped by its intended adventurer.</span>
        </div>
      ) : filteredRoutes.length === 0 || !selectedRoute ? (
        <div className="procurement-empty">
          <strong>No routes match this filter</strong>
          <span>Choose another procurement category to continue.</span>
        </div>
      ) : (
        <div className="procurement-workspace">
          <section className="procurement-routes">
            <header><div><span>Recommended operations</span><strong>{filteredRoutes.length} routes</strong></div><b>{board.summary.pendingTargets} targets pending</b></header>
            <div>
              {filteredRoutes.map((route) => (
                <button
                  aria-pressed={route.key === selectedRoute.key}
                  className={`is-${route.kind}`}
                  key={route.key}
                  onClick={() => setSelectedRouteKey(route.key)}
                  type="button"
                >
                  <i>{routeSigil(route.kind)}</i>
                  <span><small>{routeKindLabel(route.kind)}</small><strong>{route.label}</strong><em>{route.characterNames.join(", ")}</em></span>
                  <b>{route.objectives.length}</b>
                  <small>{routeStatus(route)}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="procurement-dossier">
            <header>
              <div><span>{routeKindLabel(selectedRoute.kind)}</span><strong>{selectedRoute.label}</strong></div>
              <b className={selectedRoute.availableNow ? "is-ready" : "is-review"}>{routeStatus(selectedRoute)}</b>
            </header>
            <p>{selectedRoute.detail}</p>
            <div className="procurement-route-command">
              <span>{selectedRoute.objectives.length} target{selectedRoute.objectives.length === 1 ? "" : "s"} / {selectedRoute.characterNames.length} adventurer{selectedRoute.characterNames.length === 1 ? "" : "s"}</span>
              {routeAction(selectedRoute, {
                onOpenAcquisition,
                onOpenBoss,
                onOpenForge,
                onOpenHunt,
                onOpenInventory,
                onOpenMarket,
                onOpenQuartermaster,
                onOpenTemplates,
              })}
            </div>
            <div className="procurement-targets">
              {selectedRoute.objectives.map((objective) => {
                const identity = getItemVisualIdentity(objective.item);
                return (
                  <article className={identity.className} key={objective.id}>
                    <ItemIcon item={objective.item} showQuantity={false} size="small" />
                    <span>
                      <small>{objective.character.name} / {slotLabels[objective.slot]}</small>
                      <strong>{objective.item.name}</strong>
                      <em>{objective.templateName} / T{objective.target.minimumTier} +{objective.target.minimumUpgradeLevel}</em>
                    </span>
                    <b>{objective.candidates.length} route{objective.candidates.length === 1 ? "" : "s"}</b>
                    <button
                      disabled={queuedKeys.has(objective.id) || procurementOrders.length >= 5}
                      onClick={() => onUpdateProcurementOrder({
                        action: "add",
                        characterId: objective.character.id,
                        templateId: objective.templateId,
                        slot: objective.slot,
                        itemId: objective.item.id,
                      })}
                      type="button"
                    >
                      {queuedKeys.has(objective.id) ? "Queued" : "Queue Target"}
                    </button>
                  </article>
                );
              })}
            </div>
            <section className="procurement-alternatives">
              <span>Alternative registered routes</span>
              <div>
                {uniqueAlternatives(selectedRoute).map((candidate) => (
                  <article key={candidate.key}>
                    <i>{routeSigil(candidate.kind)}</i>
                    <span><strong>{candidate.label}</strong><small>{candidate.detail}</small></span>
                    <b>{candidate.availableNow ? "Ready" : "Review"}</b>
                  </article>
                ))}
                {uniqueAlternatives(selectedRoute).length === 0 ? <p>No alternate route is registered for these targets.</p> : null}
              </div>
            </section>
          </section>
        </div>
      )}
      <small className="procurement-note">Planning only. Commands open existing systems and never start, buy, craft, transfer, forge or equip automatically.</small>
    </section>
  );
}

function orderRequest(
  action: GuildLoadoutProcurementOrderRequest["action"],
  order: GuildLoadoutProcurementOrder,
): GuildLoadoutProcurementOrderRequest {
  return {
    action,
    characterId: order.characterId,
    templateId: order.templateId,
    slot: order.slot,
    itemId: order.itemId,
  };
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function matchesFilter(route: GuildLoadoutProcurementRoute, filter: ProcurementFilter) {
  if (filter === "all") return true;
  if (filter === "ready") return route.availableNow && route.kind !== "invalid" && route.kind !== "unknown";
  if (filter === "holdings") return route.kind === "quartermaster" || route.kind === "inventory";
  if (filter === "blocked") return !route.availableNow;
  return route.kind === filter;
}

function routeAction(
  route: GuildLoadoutProcurementRoute,
  actions: Omit<
    GuildLoadoutProcurementBoardProps,
    "characters" | "depot" | "guild" | "onUpdateProcurementOrder"
  >,
) {
  const characterId = route.objectives[0]?.character.id ?? "";
  if (route.kind === "quartermaster") {
    return <button onClick={() => actions.onOpenQuartermaster(characterId)} type="button">Open Quartermaster</button>;
  }
  if (route.kind === "inventory") {
    return <button onClick={() => actions.onOpenInventory(route.targetId ?? characterId)} type="button">Open Inventory</button>;
  }
  if (route.kind === "hunt") {
    const hunt = hunts.find((entry) => entry.id === route.targetId);
    return (
      <button
        disabled={!hunt || !route.availableNow || !route.actorCharacterId}
        onClick={() => hunt && actions.onOpenHunt(hunt, route.actorCharacterId)}
        type="button"
      >
        Open Hunt
      </button>
    );
  }
  if (route.kind === "boss") {
    const boss = bosses.find((entry) => entry.id === route.targetId);
    return <button disabled={!boss} onClick={() => boss && actions.onOpenBoss(boss)} type="button">Review Boss</button>;
  }
  if (route.kind === "crafting") {
    return <button onClick={() => actions.onOpenForge(characterId)} type="button">Open Forge</button>;
  }
  if (route.kind === "bazaar") {
    return <button onClick={actions.onOpenMarket} type="button">Open Bazaar</button>;
  }
  if (route.kind === "invalid") {
    return <button onClick={() => actions.onOpenTemplates(characterId)} type="button">Edit Loadout</button>;
  }
  return <button onClick={() => actions.onOpenAcquisition(characterId)} type="button">Review Sources</button>;
}

function uniqueAlternatives(route: GuildLoadoutProcurementRoute) {
  const candidates = route.objectives.flatMap((objective) =>
    objective.candidates.filter((candidate) => candidate.key !== route.key));
  return [...new Map(candidates.map((candidate) => [candidate.key, candidate])).values()].slice(0, 6);
}

function routeSigil(kind: GuildLoadoutProcurementRouteKind) {
  if (kind === "quartermaster") return "Q";
  if (kind === "inventory") return "I";
  if (kind === "hunt") return "H";
  if (kind === "boss") return "B";
  if (kind === "crafting") return "W";
  if (kind === "bazaar") return "M";
  return "!";
}

function routeKindLabel(kind: GuildLoadoutProcurementRouteKind) {
  if (kind === "quartermaster") return "Guild Depot";
  if (kind === "inventory") return "Guild Holding";
  if (kind === "hunt") return "Hunt Route";
  if (kind === "boss") return "Boss Route";
  if (kind === "crafting") return "Guild Workbench";
  if (kind === "bazaar") return "Offline Bazaar";
  if (kind === "invalid") return "Invalid Plan";
  return "Unknown Source";
}

function routeStatus(route: GuildLoadoutProcurementRoute) {
  if (route.kind === "invalid") return "Edit required";
  if (route.kind === "unknown") return "No source";
  return route.availableNow ? "Ready now" : "Review route";
}
