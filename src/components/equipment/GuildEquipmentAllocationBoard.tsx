import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildGuildEquipmentAllocation,
  type GuildEquipmentAllocation,
} from "../../game-engine/equipment/buildGuildEquipmentAllocation";
import type {
  GuildEquipmentOrderRequest,
  GuildEquipmentOrderResult,
} from "../../game-engine/equipment/executeGuildEquipmentOrder";
import { getItemVisualIdentity } from "../../game-engine/items/getItemVisualIdentity";
import type { Character, EquipmentSlot, GuildDepot } from "../../shared/types";
import { ItemIcon } from "../items/ItemIcon";

interface GuildEquipmentAllocationBoardProps {
  characters: Character[];
  depot: GuildDepot;
  selectedCharacterId: string;
  onOpenDepot: (characterId: string) => void;
  onOpenForge: (characterId: string) => void;
  onOpenInventory: (characterId: string) => void;
  onSelectCharacter: (characterId: string) => void;
  onExecuteAllOrders: () => GuildEquipmentOrderResult;
  onExecuteOrder: (request: GuildEquipmentOrderRequest) => GuildEquipmentOrderResult;
}

const slotLabels: Record<EquipmentSlot, string> = {
  weapon: "Weapon", offhand: "Offhand", helmet: "Helmet", armor: "Armor", legs: "Legs",
  boots: "Boots", amulet: "Amulet", ring: "Ring", backpack: "Backpack",
};

export function GuildEquipmentAllocationBoard({
  characters,
  depot,
  selectedCharacterId,
  onOpenDepot,
  onOpenForge,
  onOpenInventory,
  onSelectCharacter,
  onExecuteAllOrders,
  onExecuteOrder,
}: GuildEquipmentAllocationBoardProps) {
  const plan = useMemo(() => buildGuildEquipmentAllocation(characters, depot), [characters, depot]);
  const selectedCharacter = plan.roster.find((entry) => entry.characterId === selectedCharacterId) ?? plan.roster[0];
  const [selectedAllocationId, setSelectedAllocationId] = useState("");
  const [confirmation, setConfirmation] = useState<"all" | "single">();
  const [feedback, setFeedback] = useState<{ message: string; success: boolean }>();
  const executingRef = useRef(false);
  const initializedSelection = useRef(false);
  const selectedAllocation = selectedCharacter?.allocations.find((allocation) => allocation.id === selectedAllocationId)
    ?? selectedCharacter?.allocations[0];

  useEffect(() => {
    if (initializedSelection.current || !plan.allocations[0]) return;
    initializedSelection.current = true;
    if (selectedCharacter?.allocations.length === 0) {
      onSelectCharacter(plan.allocations[0].characterId);
    }
  }, [onSelectCharacter, plan.allocations, selectedCharacter?.allocations.length]);

  function executeConfirmedOrder() {
    if (executingRef.current || !confirmation) return;
    executingRef.current = true;
    const result = confirmation === "all"
      ? onExecuteAllOrders()
      : selectedAllocation
        ? onExecuteOrder({
            characterId: selectedAllocation.characterId,
            inventoryItemId: selectedAllocation.inventoryItem.id,
            slot: selectedAllocation.slot,
          })
        : undefined;
    if (result) setFeedback({ message: result.message, success: result.success });
    setConfirmation(undefined);
    window.setTimeout(() => {
      executingRef.current = false;
    }, 250);
  }

  return (
    <section className="equipment-allocation-board">
      <div className="allocation-summary">
        <Summary label="Depot copies" value={String(plan.summary.depotEquipment)} />
        <Summary label="Allocated" value={String(plan.summary.allocations)} />
        <Summary label="Roster gain" value={`+${plan.summary.totalGain}`} />
        <Summary label="Ready transfer" value={`${plan.summary.readyTransfers}/${plan.summary.allocations}`} />
        <Summary label="Conflicts resolved" value={String(plan.summary.contestedEntries)} />
      </div>

      <div className="allocation-roster" aria-label="Equipment allocation roster">
        {plan.roster.map((entry) => (
          <button aria-pressed={entry.characterId === selectedCharacter?.characterId} key={entry.characterId} onClick={() => onSelectCharacter(entry.characterId)} type="button">
            <i>{entry.name.charAt(0)}</i>
            <span><strong>{entry.name}</strong><small>Lv {entry.level} {entry.vocation}</small></span>
            <b>{entry.allocations.length} assigned</b>
            <em>+{entry.totalGain} rating / {entry.readyTransfers} ready</em>
          </button>
        ))}
      </div>

      {plan.allocations.length > 0 ? (
        <div className="allocation-workspace">
          <section className="allocation-character">
            <header>
              <div><span>{selectedCharacter?.name ?? "Guild roster"}</span><strong>Assigned Upgrades</strong></div>
              <b>{selectedCharacter?.allocations.length ?? 0} item(s)</b>
            </header>
            <div>
              {selectedCharacter?.allocations.length ? selectedCharacter.allocations.map((allocation) => (
                <AllocationButton
                  allocation={allocation}
                  isSelected={allocation.id === selectedAllocation?.id}
                  key={allocation.id}
                  onSelect={() => setSelectedAllocationId(allocation.id)}
                />
              )) : <p>No Guild Depot upgrade is assigned to this adventurer.</p>}
            </div>
          </section>

          {selectedAllocation ? <section className="allocation-order">
            <header><span>Quartermaster order</span><strong>{selectedAllocation.inventoryItem.item.name}</strong><b>+{selectedAllocation.delta}</b></header>
            <div className="allocation-order-item">
              <ItemIcon inventoryItem={selectedAllocation.inventoryItem} showQuantity={false} size="large" />
              <div>
                <span>{selectedAllocation.characterName} / {slotLabels[selectedAllocation.slot]}</span>
                <strong>{selectedAllocation.currentItem?.item.name ?? "Empty slot"} → {selectedAllocation.inventoryItem.item.name}</strong>
                <small>{selectedAllocation.currentScore} → {selectedAllocation.targetScore} rating</small>
              </div>
              <em className={selectedAllocation.canCarry ? "is-ready" : "is-blocked"}>
                {selectedAllocation.canCarry ? "Transfer ready" : "Capacity blocked"}
              </em>
            </div>
            <div className="allocation-command-row">
              <button onClick={() => onOpenDepot(selectedAllocation.characterId)} type="button">Open Depot</button>
              <button onClick={() => onOpenInventory(selectedAllocation.characterId)} type="button">Open Inventory</button>
              <button onClick={() => onOpenForge(selectedAllocation.characterId)} type="button">Open Forge</button>
            </div>
            <div className="quartermaster-execution-row">
              <button disabled={!selectedAllocation.canCarry} onClick={() => setConfirmation("single")} type="button">Execute Order</button>
              <button disabled={plan.summary.readyTransfers === 0} onClick={() => setConfirmation("all")} type="button">
                Execute All Ready ({plan.summary.readyTransfers})
              </button>
            </div>
            {confirmation ? <div className="quartermaster-confirmation" role="alert">
              <span>Confirm distribution</span>
              <strong>{confirmation === "all"
                ? `Transfer and equip ${plan.summary.readyTransfers} ready ${plan.summary.readyTransfers === 1 ? "order" : "orders"}?`
                : `Transfer and equip ${selectedAllocation.inventoryItem.item.name} on ${selectedAllocation.characterName}?`}</strong>
              <small>Items currently equipped return safely to the character inventory.</small>
              <div>
                <button onClick={() => setConfirmation(undefined)} type="button">Cancel</button>
                <button onClick={executeConfirmedOrder} type="button">Confirm</button>
              </div>
            </div> : null}
            <dl>
              <div><dt>Character</dt><dd>{selectedAllocation.characterName}</dd></div>
              <div><dt>Vocation</dt><dd>{selectedAllocation.vocation}</dd></div>
              <div><dt>Level</dt><dd>{selectedAllocation.level}</dd></div>
              <div><dt>Free capacity</dt><dd>{selectedAllocation.freeCapacity.toFixed(1)}</dd></div>
              </dl>
          </section> : <section className="allocation-order is-empty">
            <header><span>Quartermaster order</span><strong>No assigned item</strong></header>
            <div className="allocation-order-empty">Select an allocated adventurer or choose an order from the guild ledger.</div>
          </section>}

          <aside className="allocation-ledger">
            <header><span>Guild distribution</span><strong>Allocation Ledger</strong><b>{plan.allocations.length}</b></header>
            <div>
              {plan.allocations.map((allocation) => (
                <button aria-pressed={allocation.id === selectedAllocation?.id} key={allocation.id} onClick={() => {
                  onSelectCharacter(allocation.characterId);
                  setSelectedAllocationId(allocation.id);
                }} type="button">
                  <span>{allocation.characterName}</span>
                  <strong>{allocation.inventoryItem.item.name}</strong>
                  <small>{slotLabels[allocation.slot]} / +{allocation.delta}</small>
                </button>
              ))}
            </div>
            <footer>
              <span>Unassigned equipment</span>
              <strong>{plan.summary.unassignedEquipment} {plan.summary.unassignedEquipment === 1 ? "copy" : "copies"}</strong>
              {plan.unassignedEquipment.slice(0, 5).map((entry) => (
                <small key={entry.inventoryItem.id}>{entry.inventoryItem.item.name} x{entry.quantity}</small>
              ))}
            </footer>
          </aside>
        </div>
      ) : (
        <div className="allocation-empty">
          <strong>No distributable upgrades</strong>
          <span>The Guild Depot has no compatible equipment that improves a roster slot.</span>
        </div>
      )}
      {feedback ? <p className={feedback.success ? "quartermaster-feedback is-success" : "quartermaster-feedback is-warning"}>{feedback.message}</p> : null}
    </section>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function AllocationButton({
  allocation,
  isSelected,
  onSelect,
}: {
  allocation: GuildEquipmentAllocation;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const identity = getItemVisualIdentity(allocation.inventoryItem.item, allocation.inventoryItem);
  return (
    <button aria-pressed={isSelected} className={identity.className} onClick={onSelect} type="button">
      <ItemIcon inventoryItem={allocation.inventoryItem} showQuantity={false} size="small" />
      <span><small>{slotLabels[allocation.slot]}</small><strong>{allocation.inventoryItem.item.name}</strong><em>{allocation.currentItem?.item.name ?? "Empty slot"} / {identity.combinedLabel}</em></span>
      <b>+{allocation.delta}</b>
    </button>
  );
}
