import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { bosses } from "../../data/bosses";
import { hunts } from "../../data/hunts";
import { items } from "../../data/items";
import {
  buildGuildLoadoutProcurementBoard,
  type GuildLoadoutProcurementRoute,
  type GuildLoadoutProcurementRouteKind,
} from "../../game-engine/loadout-templates/buildGuildLoadoutProcurementBoard";
import { buildGuildLoadoutProcurementOrderTracker } from "../../game-engine/loadout-templates/buildGuildLoadoutProcurementOrderTracker";
import type { GuildLoadoutProcurementOrderRequest } from "../../game-engine/loadout-templates/updateGuildLoadoutProcurementOrder";
import type { GuildLoadoutProcurementReservationRequest } from "../../game-engine/loadout-templates/updateGuildLoadoutProcurementReservation";
import type { GuildLoadoutProcurementFulfillmentRequest } from "../../game-engine/loadout-templates/fulfillGuildLoadoutProcurementReservation";
import { getItemVisualIdentity } from "../../game-engine/items/getItemVisualIdentity";
import type {
  Boss,
  Character,
  EquipmentSlot,
  Guild,
  GuildDepot,
  GuildLoadoutProcurementOrder,
  HuntArea,
  Item,
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
  onAcknowledgeProcurementAlerts: () => void;
  onUpdateProcurementOrder: (request: GuildLoadoutProcurementOrderRequest) => void;
  onUpdateProcurementReservation: (request: GuildLoadoutProcurementReservationRequest) => void;
  onFulfillProcurementReservation: (request: GuildLoadoutProcurementFulfillmentRequest) => void;
  onFulfillProcurementBatch: (requests: GuildLoadoutProcurementFulfillmentRequest[]) => void;
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

interface ReservedDispatchReviewEntry {
  order: GuildLoadoutProcurementOrder;
  request: GuildLoadoutProcurementFulfillmentRequest;
  characterName: string;
  item?: Item;
}

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
  onAcknowledgeProcurementAlerts,
  onUpdateProcurementOrder,
  onUpdateProcurementReservation,
  onFulfillProcurementReservation,
  onFulfillProcurementBatch,
}: GuildLoadoutProcurementBoardProps) {
  const board = useMemo(
    () => buildGuildLoadoutProcurementBoard(guild, characters, depot),
    [characters, depot, guild],
  );
  const [filter, setFilter] = useState<ProcurementFilter>("all");
  const tracker = useMemo(
    () => buildGuildLoadoutProcurementOrderTracker(guild, characters, depot),
    [characters, depot, guild],
  );
  const filteredRoutes = board.routes.filter((route) => matchesFilter(route, filter));
  const [selectedRouteKey, setSelectedRouteKey] = useState("");
  const [pendingFulfillment, setPendingFulfillment] = useState<GuildLoadoutProcurementFulfillmentRequest>();
  const [batchReview, setBatchReview] = useState<ReservedDispatchReviewEntry[]>();
  const selectedRoute = filteredRoutes.find((route) => route.key === selectedRouteKey)
    ?? filteredRoutes[0];

  useEffect(() => {
    if (selectedRoute && selectedRoute.key !== selectedRouteKey) {
      setSelectedRouteKey(selectedRoute.key);
    }
  }, [selectedRoute, selectedRouteKey]);
  const procurementOrders = board.dashboard.state.procurementOrders;
  const fulfillmentHistory = tracker.state.fulfillmentHistory.slice(-6).reverse();
  const queuedKeys = new Set(procurementOrders.map((order) =>
    `${order.characterId}:${order.templateId}:${order.slot}`));
  const reservedDispatch = procurementOrders.flatMap((order) => {
    const reservation = tracker.state.procurementReservations.find((entry) =>
      entry.characterId === order.characterId
      && entry.templateId === order.templateId
      && entry.slot === order.slot
      && entry.itemId === order.itemId);
    return reservation ? [{
      order,
      request: fulfillmentRequest(order, reservation.inventoryItemId),
      characterName: characters.find((entry) => entry.id === order.characterId)?.name ?? "Adventurer",
      item: items[order.itemId],
    }] : [];
  });

  useEffect(() => {
    if (!batchReview) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setBatchReview(undefined);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [batchReview]);

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
          <span className="procurement-ledger-actions">
            <b>{procurementOrders.length}/5 queued / {tracker.state.procurementReservations.length} reserved / {tracker.summary.unread} unread</b>
            {reservedDispatch.length >= 2 ? (
              <button
                onClick={() => {
                  setPendingFulfillment(undefined);
                  setBatchReview(reservedDispatch.map((entry) => ({
                    ...entry,
                    order: { ...entry.order },
                    request: { ...entry.request },
                  })));
                }}
                type="button"
              >
                Review Dispatch ({reservedDispatch.length})
              </button>
            ) : null}
          </span>
        </header>
        {tracker.summary.unread > 0 ? (
          <aside className="procurement-readiness-alert" role="status">
            <span><strong>{tracker.summary.unread} order alert{tracker.summary.unread === 1 ? "" : "s"}</strong><small>Exact targets are ready or already fulfilled.</small></span>
            <button onClick={onAcknowledgeProcurementAlerts} type="button">Mark Reviewed</button>
          </aside>
        ) : null}
        {pendingFulfillment ? (
          <aside className="procurement-fulfillment-confirm" role="alertdialog" aria-label="Confirm reserved gear issue">
            <span>
              <strong>Issue this exact reserved copy?</strong>
              <small>The item will move from the Guild Depot and equip on its assigned adventurer.</small>
            </span>
            <button onClick={() => setPendingFulfillment(undefined)} type="button">Cancel</button>
            <button
              className="is-confirm"
              onClick={() => {
                onFulfillProcurementReservation(pendingFulfillment);
                setPendingFulfillment(undefined);
              }}
              type="button"
            >
              Issue Gear
            </button>
          </aside>
        ) : null}
        {batchReview ? createPortal((
          <div className="procurement-batch-backdrop">
            <aside className="procurement-batch-review" role="dialog" aria-label="Review reserved gear dispatch" aria-modal="true">
              <header>
                <div><span>Armory issue order</span><strong>Reserved Gear Dispatch</strong></div>
                <b>{batchReview.length} exact pieces</b>
              </header>
              <div className="procurement-batch-list">
                {batchReview.map(({ order, characterName, item, request }) => (
                  <article key={request.inventoryItemId}>
                    <ItemIcon item={item} showQuantity={false} size="small" />
                    <span>
                      <small>{characterName} / {slotLabels[order.slot]}</small>
                      <strong>{item?.name ?? order.itemId}</strong>
                      <em>Reserved copy {request.inventoryItemId}</em>
                    </span>
                  </article>
                ))}
              </div>
              <p>
                This reviewed list is fixed. If any reserved copy changed or became invalid,
                the entire issue order will be cancelled.
              </p>
              <footer>
                <button autoFocus onClick={() => setBatchReview(undefined)} type="button">Cancel</button>
                <button
                  className="is-confirm"
                  onClick={() => {
                    onFulfillProcurementBatch(batchReview.map((entry) => entry.request));
                    setBatchReview(undefined);
                  }}
                  type="button"
                >
                  Issue All Reserved
                </button>
              </footer>
            </aside>
          </div>
        ), document.body) : null}
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
              const tracking = tracker.entries.find((entry) =>
                entry.order.characterId === order.characterId
                && entry.order.templateId === order.templateId
                && entry.order.slot === order.slot
                && entry.order.itemId === order.itemId);
              const unread = tracking
                ? tracker.state.procurementAlerts.unreadReadyKeys.includes(tracking.key)
                : false;
              const reservation = tracker.state.procurementReservations.find((entry) =>
                entry.characterId === order.characterId
                && entry.templateId === order.templateId
                && entry.slot === order.slot
                && entry.itemId === order.itemId);
              const reservableItem = review?.target
                ? findReservableDepotItem(depot, review.target)
                : undefined;
              return (
                <article
                  className={`is-${tracking?.status ?? "blocked"}${unread ? " is-unread" : ""}${reservation ? " is-reserved" : ""}`}
                  key={objectiveId}
                >
                  <i>{index + 1}</i>
                  <ItemIcon item={item} showQuantity={false} size="small" />
                  <span>
                    <small>{dashboardEntry?.character.name ?? "Adventurer"} / {slotLabels[order.slot]}</small>
                    <strong>{item?.name ?? order.itemId}</strong>
                    <em>
                      {reservation
                        ? "Reserved in Guild Depot / protected from sale and salvage"
                        : `${tracking?.statusLabel ?? (fulfilled ? "Target fulfilled" : "Route unavailable")} / ${fulfilled ? "remove when reviewed" : objective?.recommended.label ?? "review plan"}`}
                    </em>
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
                    {reservation ? (
                      <>
                        <button
                          className="is-fulfillment"
                          onClick={() => {
                            setBatchReview(undefined);
                            setPendingFulfillment(fulfillmentRequest(order, reservation.inventoryItemId));
                          }}
                          type="button"
                        >
                          Issue Gear
                        </button>
                        <button
                          className="is-reservation"
                          onClick={() => onUpdateProcurementReservation(reservationRequest("release", order, reservation.inventoryItemId))}
                          type="button"
                        >
                          Release
                        </button>
                      </>
                    ) : (
                      <button
                        className="is-reservation"
                        disabled={!reservableItem || fulfilled}
                        onClick={() => reservableItem && onUpdateProcurementReservation(reservationRequest("reserve", order, reservableItem.id))}
                        title={reservableItem ? "Protect this exact Guild Depot copy" : "No unlocked matching Guild Depot copy"}
                        type="button"
                      >
                        Reserve
                      </button>
                    )}
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

      <section className="procurement-fulfillment-history">
        <header>
          <div><span>Armory audit trail</span><strong>Recent Gear Issues</strong></div>
          <b>{tracker.state.fulfillmentHistory.length}/30 retained</b>
        </header>
        {fulfillmentHistory.length > 0 ? (
          <div>
            {fulfillmentHistory.map((record) => {
              const catalogItem = getHistoricalCatalogItem(record.itemId);
              return (
                <article key={record.id}>
                  {catalogItem ? (
                    <ItemIcon item={catalogItem} showQuantity={false} size="small" />
                  ) : (
                    <div
                      aria-label={record.itemName}
                      className="item-icon item-icon-small fulfillment-history-fallback"
                      title={`${record.itemName} / Historical item`}
                    >
                      <strong>{historicalItemSymbol(record.itemName)}</strong>
                    </div>
                  )}
                  <span>
                    <small>{record.characterName} / {slotLabels[record.slot]} / {record.templateName}</small>
                    <strong>{record.itemName}</strong>
                    <em>{record.previousItemName ? `Replaced ${record.previousItemName}` : "Filled empty equipment slot"}</em>
                  </span>
                  <time dateTime={record.fulfilledAt}>{formatFulfillmentTime(record.fulfilledAt)}</time>
                </article>
              );
            })}
          </div>
        ) : (
          <p>No reserved gear has been issued yet.</p>
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

function reservationRequest(
  action: GuildLoadoutProcurementReservationRequest["action"],
  order: GuildLoadoutProcurementOrder,
  inventoryItemId: string,
): GuildLoadoutProcurementReservationRequest {
  return {
    action,
    characterId: order.characterId,
    templateId: order.templateId,
    slot: order.slot,
    itemId: order.itemId,
    inventoryItemId,
  };
}

function fulfillmentRequest(
  order: GuildLoadoutProcurementOrder,
  inventoryItemId: string,
): GuildLoadoutProcurementFulfillmentRequest {
  return {
    characterId: order.characterId,
    templateId: order.templateId,
    slot: order.slot,
    itemId: order.itemId,
    inventoryItemId,
  };
}

function findReservableDepotItem(
  depot: GuildDepot,
  target: NonNullable<ReturnType<typeof buildGuildLoadoutProcurementBoard>["dashboard"]["entries"][number]["review"]["reviews"][number]["target"]>,
) {
  return depot.items.find((entry) =>
    entry.itemId === target.itemId
    && entry.item?.id === target.itemId
    && entry.item.type === "equipment"
    && entry.item.equipmentSlot === target.slot
    && entry.location === "guildDepot"
    && !entry.ownerCharacterId
    && !entry.parentContainerId
    && !entry.locked
    && Number.isSafeInteger(entry.quantity)
    && entry.quantity === 1
    && (entry.tier ?? 0) >= target.minimumTier
    && (entry.upgradeLevel ?? 0) >= target.minimumUpgradeLevel);
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function formatFulfillmentTime(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    : "Unknown";
}

function getHistoricalCatalogItem(itemId: string) {
  return Object.prototype.hasOwnProperty.call(items, itemId) ? items[itemId] : undefined;
}

function historicalItemSymbol(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return (words.length > 1 ? `${words[0][0]}${words[1][0]}` : words[0]?.slice(0, 2) ?? "?").toUpperCase();
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
    "characters" | "depot" | "guild" | "onAcknowledgeProcurementAlerts" | "onUpdateProcurementOrder" | "onUpdateProcurementReservation" | "onFulfillProcurementReservation" | "onFulfillProcurementBatch"
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
