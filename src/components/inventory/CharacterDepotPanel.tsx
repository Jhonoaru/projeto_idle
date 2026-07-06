import { calculateCapacityUsed } from "../../game-engine/inventory/calculateCapacityUsed";
import { InventoryGrid } from "./InventoryGrid";
import { InventoryItemRow } from "./InventoryItemRow";
import type { Character, InventoryItem } from "../../shared/types";

interface CharacterDepotPanelProps {
  character: Character;
  onSendToInventory: (inventoryItem: InventoryItem) => void;
  onToggleLock?: (inventoryItem: InventoryItem) => void;
}

export function CharacterDepotPanel({
  character,
  onSendToInventory,
  onToggleLock,
}: CharacterDepotPanelProps) {
  const capacityUsed = calculateCapacityUsed(character.characterDepot);

  return (
    <div className="inventory-panel">
      <div className="depot-summary">
        <div>
          <span>Owner</span>
          <strong>{character.name}</strong>
        </div>
        <div>
          <span>Stored Weight</span>
          <strong>{capacityUsed.toFixed(2)} cap</strong>
        </div>
      </div>
      <InventoryGrid emptySlots={16} items={character.characterDepot} />
      <div className="inventory-list">
        {character.characterDepot.length > 0 ? (
          character.characterDepot.map((inventoryItem) => (
            <InventoryItemRow
              actionLabel="Enviar para Inventário"
              inventoryItem={inventoryItem}
              key={inventoryItem.id}
              onAction={onSendToInventory}
              onToggleLock={onToggleLock}
            />
          ))
        ) : (
          <div className="empty-list">Depot do personagem vazio.</div>
        )}
      </div>
    </div>
  );
}
