import { useMemo, useState } from "react";
import { items } from "../../data/items";
import { getSalvageAvailability } from "../../game-engine/crafting/getSalvageAvailability";
import { normalizeGuildCraftingState } from "../../game-engine/crafting/normalizeGuildCraftingState";
import type { Guild, GuildDepot } from "../../shared/types";
import { EquipmentSetBadge } from "../items/EquipmentSetBadge";
import { ItemIcon } from "../items/ItemIcon";
import { ItemProgressionBadge } from "../items/ItemProgressionBadge";

interface SalvageBenchPanelProps {
  guild: Guild;
  depot: GuildDepot;
  onSalvage: (inventoryItemId: string) => void;
}

export function SalvageBenchPanel({ guild, depot, onSalvage }: SalvageBenchPanelProps) {
  const equipment = depot.items.filter((entry) => entry.item.type === "equipment");
  const [selectedItemId, setSelectedItemId] = useState(equipment[0]?.id);
  const [armedItemId, setArmedItemId] = useState<string>();
  const selectedItem = equipment.find((entry) => entry.id === selectedItemId) ?? equipment[0];
  const availability = selectedItem ? getSalvageAvailability(depot, selectedItem.id) : undefined;
  const crafting = normalizeGuildCraftingState(guild.crafting);
  const eligibleCount = useMemo(
    () => equipment.filter((entry) => getSalvageAvailability(depot, entry.id).available).length,
    [depot, equipment],
  );

  function selectItem(inventoryItemId: string) {
    setSelectedItemId(inventoryItemId);
    setArmedItemId(undefined);
  }

  function requestSalvage() {
    if (!selectedItem || !availability?.available) return;
    if (armedItemId !== selectedItem.id) {
      setArmedItemId(selectedItem.id);
      return;
    }
    onSalvage(selectedItem.id);
    setArmedItemId(undefined);
  }

  return (
    <div className="salvage-panel">
      <section className="salvage-summary">
        <div><span>Eligible Equipment</span><strong>{eligibleCount}/{equipment.length}</strong></div>
        <div><span>Protected</span><strong>{equipment.length - eligibleCount}</strong></div>
        <div><span>Salvage Orders</span><strong>{crafting.totalSalvages}</strong></div>
        <div><span>Materials Recovered</span><strong>{crafting.totalRecoveredMaterials}</strong></div>
      </section>

      <div className="salvage-layout">
        <section className="salvage-item-list" aria-label="Guild Depot salvage equipment">
          {equipment.length === 0 ? <p>No equipment stored in the Guild Depot.</p> : equipment.map((inventoryItem) => {
            const status = getSalvageAvailability(depot, inventoryItem.id);
            return (
              <button
                className={`${selectedItem?.id === inventoryItem.id ? "is-selected" : ""} ${status.available ? "is-available" : "is-protected"}`}
                key={inventoryItem.id}
                onClick={() => selectItem(inventoryItem.id)}
                type="button"
              >
                <ItemIcon inventoryItem={inventoryItem} showQuantity={false} size="small" />
                <span>
                  <small>{inventoryItem.item.rarity} / {inventoryItem.item.equipmentSlot ?? "equipment"}</small>
                  <strong>{inventoryItem.item.name}</strong>
                  <em>{status.available ? "Recoverable" : "Protected"}</em>
                </span>
              </button>
            );
          })}
        </section>

        <section className="salvage-order">
          {selectedItem && availability ? (
            <>
              <header className="salvage-order-header">
                <ItemIcon inventoryItem={selectedItem} showQuantity={false} size="large" />
                <div>
                  <span>Selected equipment</span>
                  <h3>{selectedItem.item.name}</h3>
                  <ItemProgressionBadge item={selectedItem.item} />
                  <EquipmentSetBadge item={selectedItem.item} />
                </div>
              </header>
              <p>{selectedItem.item.description}</p>

              <div className="salvage-protection-ledger">
                <div><span>Upgrade</span><strong>+{selectedItem.upgradeLevel ?? 0}</strong></div>
                <div><span>Tier</span><strong>{selectedItem.tier ?? 0}</strong></div>
                <div><span>Imbuements</span><strong>{selectedItem.imbuements?.length ?? 0}</strong></div>
                <div><span>Locked</span><strong>{selectedItem.locked ? "Yes" : "No"}</strong></div>
              </div>

              <div className="salvage-yield" aria-label="Recovered materials preview">
                {availability.recoveredMaterials.length > 0 ? availability.recoveredMaterials.map((material) => (
                  <article key={material.itemId}>
                    <ItemIcon item={items[material.itemId]} quantity={material.quantity} size="medium" />
                    <span><small>Recovered</small><strong>{items[material.itemId]?.name ?? material.itemId}</strong><em>x{material.quantity}</em></span>
                  </article>
                )) : <p>{availability.reason}</p>}
              </div>

              <button
                className={`salvage-action-button ${armedItemId === selectedItem.id ? "is-armed" : ""}`}
                disabled={!availability.available}
                onClick={requestSalvage}
                type="button"
              >
                {!availability.available
                  ? availability.reason
                  : armedItemId === selectedItem.id
                    ? `Confirm Salvage: ${selectedItem.item.name}`
                    : `Prepare Salvage: ${selectedItem.item.name}`}
              </button>
            </>
          ) : <p className="salvage-empty">No equipment selected.</p>}
        </section>

        <aside className="salvage-history">
          <header><span>Recovery ledger</span><strong>Last 20 orders</strong></header>
          {crafting.salvageHistory.length === 0 ? <p>No equipment salvaged yet.</p> : crafting.salvageHistory.map((entry) => (
            <article key={entry.id}>
              <span>{new Date(entry.salvagedAt).toLocaleDateString("en-US")}</span>
              <strong>{entry.itemName}</strong>
              <small>{entry.recoveredMaterials.map((material) => `${items[material.itemId]?.name ?? material.itemId} x${material.quantity}`).join(" / ")}</small>
            </article>
          ))}
          <footer><span>Lifetime recovered</span><strong>{crafting.totalRecoveredMaterials} materials</strong><small>{crafting.totalSalvages} equipment salvaged</small></footer>
        </aside>
      </div>
    </div>
  );
}
