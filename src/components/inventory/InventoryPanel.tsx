import { useMemo, useState } from "react";
import { calculateContainerUsedSlots } from "../../game-engine/container/calculateContainerUsedSlots";
import { canMoveItemToContainer } from "../../game-engine/container/canMoveItemToContainer";
import { getContainerContents } from "../../game-engine/container/getContainerContents";
import { isContainerItem } from "../../game-engine/container/isContainerItem";
import { CapacityBar } from "./CapacityBar";
import { InventoryGrid } from "./InventoryGrid";
import { InventoryItemRow } from "./InventoryItemRow";
import type { Character, InventoryItem } from "../../shared/types";

interface InventoryPanelProps {
  character: Character;
  onSendToDepot: (inventoryItem: InventoryItem) => void;
  onSendToGuildDepot?: (inventoryItem: InventoryItem) => void;
  onEquipItem: (inventoryItem: InventoryItem) => void;
  onToggleLock?: (inventoryItem: InventoryItem) => void;
  onMoveToContainer?: (inventoryItem: InventoryItem, container: InventoryItem) => void;
  onMoveOutOfContainer?: (inventoryItem: InventoryItem) => void;
}

export function InventoryPanel({
  character,
  onEquipItem,
  onSendToDepot,
  onSendToGuildDepot,
  onToggleLock,
  onMoveToContainer,
  onMoveOutOfContainer,
}: InventoryPanelProps) {
  const [openContainerId, setOpenContainerId] = useState<string | undefined>();
  const containers = useMemo(
    () =>
      [
        ...character.inventory,
        ...Object.values(character.equipment).filter(Boolean),
      ].filter((inventoryItem): inventoryItem is InventoryItem =>
        Boolean(inventoryItem && isContainerItem(inventoryItem)),
      ),
    [character.equipment, character.inventory],
  );
  const openContainer = containers.find((container) => container.id === openContainerId);
  const visibleItems = openContainer
    ? getContainerContents(character.inventory, openContainer.id)
    : character.inventory.filter((inventoryItem) => !inventoryItem.parentContainerId);

  function getMoveTargets(inventoryItem: InventoryItem) {
    if (!onMoveToContainer) return [];

    return containers.filter((container) => {
      if (container.id === inventoryItem.id) return false;
      if (inventoryItem.parentContainerId === container.id) return false;

      return canMoveItemToContainer(inventoryItem, container, character.inventory).canMove;
    });
  }

  return (
    <div className="inventory-panel">
      <CapacityBar used={character.capacityUsed} max={character.capacityMax} />
      <InventoryGrid
        emptySlots={24}
        equippedItemIds={new Set(Object.values(character.equipment).filter(Boolean).map((item) => item.id))}
        items={visibleItems}
        onOpenContainer={(container) => setOpenContainerId(container.id)}
      />
      <div className="container-browser">
        <div className="container-browser-header">
          <div>
            <span>{openContainer ? "Container aberto" : "Raiz do inventario"}</span>
            <strong>{openContainer?.item.name ?? "Mochila principal / raiz"}</strong>
          </div>
          {openContainer ? (
            <button onClick={() => setOpenContainerId(undefined)} type="button">
              Voltar para raiz
            </button>
          ) : null}
        </div>

        <div className="container-strip">
          {containers.length > 0 ? (
            containers.map((container) => {
              const usedSlots = calculateContainerUsedSlots(character.inventory, container.id);
              const maxSlots = container.item.containerSlots ?? 0;

              return (
                <button
                  className={openContainer?.id === container.id ? "is-selected" : ""}
                  key={container.id}
                  onClick={() => setOpenContainerId(container.id)}
                  type="button"
                >
                  <span>[Bag] {container.item.name}</span>
                  <strong>{usedSlots}/{maxSlots}</strong>
                  <em>{container.item.containerType ?? "generic"}</em>
                </button>
              );
            })
          ) : (
            <div className="empty-list">Nenhum container disponivel.</div>
          )}
        </div>
      </div>
      <div className="inventory-list">
        {visibleItems.length > 0 ? (
          visibleItems.map((inventoryItem) => (
            <InventoryItemRow
              actionLabel="Enviar para Depot Pessoal"
              inventoryItem={inventoryItem}
              key={inventoryItem.id}
              onEquip={onEquipItem}
              onOpenContainer={(container) => setOpenContainerId(container.id)}
              onAction={onSendToDepot}
              onMoveOutOfContainer={onMoveOutOfContainer}
              onMoveToContainer={onMoveToContainer}
              onSecondaryAction={onSendToGuildDepot}
              onToggleLock={onToggleLock}
              moveToContainerTargets={getMoveTargets(inventoryItem)}
              secondaryActionLabel={onSendToGuildDepot ? "Enviar para Guild Depot" : undefined}
              sourceItems={character.inventory}
            />
          ))
        ) : (
          <div className="empty-list">
            {openContainer ? "Container vazio." : "Inventory is empty."}
          </div>
        )}
      </div>
    </div>
  );
}
