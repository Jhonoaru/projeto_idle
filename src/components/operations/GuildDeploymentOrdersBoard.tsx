import type { GuildDeploymentOrdersView } from "../../game-engine/deployment-orders/buildGuildDeploymentOrders";
import type { GuildDeploymentOrderSlotId, GuildSquadSlotId } from "../../shared/types";

interface GuildDeploymentOrdersBoardProps {
  orders: GuildDeploymentOrdersView;
  selectedSlotId: GuildDeploymentOrderSlotId;
  onSelectSlot: (slotId: GuildDeploymentOrderSlotId) => void;
  onClear: (slotId: GuildDeploymentOrderSlotId) => void;
  onPrepareBoss: (slotId: GuildSquadSlotId, bossId: string) => void;
  onPrepareContract: (slotId: GuildSquadSlotId, contractId: string) => void;
}

export function GuildDeploymentOrdersBoard({ orders, selectedSlotId, onSelectSlot, onClear, onPrepareBoss, onPrepareContract }: GuildDeploymentOrdersBoardProps) {
  return (
    <section className="guild-deployment-orders">
      <header>
        <div><span>Persistent operation desk</span><h4>Deployment Orders</h4></div>
        <strong>{orders.readyCount}/{orders.configuredCount || 0} ready</strong>
      </header>
      <div className="guild-deployment-order-grid">
        {orders.slots.map((slot) => (
          <article className={`${slot.ready ? "is-ready" : ""} ${slot.order ? "" : "is-empty"}`} key={slot.definition.id}>
            <button
              aria-label={`Select ${slot.definition.name}`}
              aria-pressed={selectedSlotId === slot.definition.id}
              className="guild-deployment-order-select"
              onClick={() => onSelectSlot(slot.definition.id)}
              type="button"
            >
              <i>{slot.definition.sigil}</i>
              <span>{slot.order ? slot.order.kind === "boss" ? "Boss order" : "Contract order" : "Open order"}</span>
              <strong>{slot.target?.name ?? slot.definition.name}</strong>
              <small>{slot.candidate ? `${slot.candidate.slotName} / ${slot.reason}` : slot.reason}</small>
            </button>
            {slot.order && slot.target && slot.candidate ? (
              <div className="guild-deployment-order-actions">
                <b>{slot.ready ? "Ready now" : "Needs review"}</b>
                <button disabled={!slot.candidate.unlocked || !slot.candidate.configured} onClick={() => slot.order?.kind === "boss"
                  ? onPrepareBoss(slot.order.squadSlotId, slot.order.targetId)
                  : onPrepareContract(slot.order!.squadSlotId, slot.order!.targetId)} type="button">Prepare</button>
                <button aria-label={`Clear ${slot.definition.name}`} onClick={() => onClear(slot.definition.id)} title="Clear order" type="button">X</button>
              </div>
            ) : <span className="guild-deployment-order-hint">Select this slot, then assign a planner candidate.</span>}
          </article>
        ))}
      </div>
      <small>Orders remember intent only. Readiness is recalculated from the current roster, access, cooldowns and guild funds.</small>
    </section>
  );
}
