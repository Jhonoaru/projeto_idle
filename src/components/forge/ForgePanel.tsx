import { useMemo, useState } from "react";
import { imbuements, getImbuementById } from "../../data/imbuements";
import { getItemUpgradeCost } from "../../game-engine/forge/getItemUpgradeCost";
import { getItemTierCost } from "../../game-engine/forge/getItemTierCost";
import { getForgeMaterialsAvailable } from "../../game-engine/forge/getForgeMaterialsAvailable";
import { getForgeableItems } from "../../game-engine/forge/forgeInventoryHelpers";
import type { Character, EquipmentSlot, Guild, GuildDepot, InventoryItem } from "../../shared/types";

interface ForgePanelProps {
  character: Character;
  guild: Guild;
  guildDepot: GuildDepot;
  onUpgradeItem: (inventoryItem: InventoryItem) => void;
  onIncreaseTier: (inventoryItem: InventoryItem) => void;
  onApplyImbuement: (inventoryItem: InventoryItem, imbuementId: string) => void;
  onRemoveImbuements: (inventoryItem: InventoryItem) => void;
}

type ForgeFilter = "all" | "weapons" | "armor" | "accessories" | "backpack";

export function ForgePanel({
  character,
  guild,
  guildDepot,
  onUpgradeItem,
  onIncreaseTier,
  onApplyImbuement,
  onRemoveImbuements,
}: ForgePanelProps) {
  const forgeableItems = getForgeableItems(character);
  const [filter, setFilter] = useState<ForgeFilter>("all");
  const [selectedItemId, setSelectedItemId] = useState(forgeableItems[0]?.id);
  const materialsAvailable = getForgeMaterialsAvailable(character, guildDepot);
  const filteredItems = forgeableItems.filter((item) => matchesFilter(item, filter));
  const selectedItem =
    filteredItems.find((item) => item.id === selectedItemId) ??
    forgeableItems.find((item) => item.id === selectedItemId) ??
    filteredItems[0] ??
    forgeableItems[0];

  const selectedSlot = useMemo(
    () => Object.entries(character.equipment).find(([, item]) => item?.id === selectedItem?.id)?.[0] as EquipmentSlot | undefined,
    [character.equipment, selectedItem?.id],
  );
  const availableImbuements = imbuements.filter((imbuement) => {
    const slot = selectedSlot ?? selectedItem?.item.equipmentSlot;
    return slot && imbuement.allowedEquipmentSlots.includes(slot);
  });

  if (forgeableItems.length === 0) {
    return <div className="empty-list">Nenhum equipamento disponivel para Forge.</div>;
  }

  return (
    <div className="forge-panel">
      <div className="forge-summary">
        <div>
          <span>Adventurer</span>
          <strong>{character.name}</strong>
        </div>
        <div>
          <span>Guild Gold</span>
          <strong>{guild.gold.toLocaleString("en-US")}g</strong>
        </div>
        <div>
          <span>Forge Items</span>
          <strong>{forgeableItems.length}</strong>
        </div>
      </div>

      <div className="forge-filters">
        {(["all", "weapons", "armor", "accessories", "backpack"] as ForgeFilter[]).map((option) => (
          <button
            className={filter === option ? "is-selected" : ""}
            key={option}
            onClick={() => setFilter(option)}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>

      <div className="forge-layout">
        <div className="forge-item-list">
          {filteredItems.map((item) => (
            <button
              className={selectedItem?.id === item.id ? "is-selected" : ""}
              key={item.id}
              onClick={() => setSelectedItemId(item.id)}
              type="button"
            >
              <strong>{formatForgeItemName(item)}</strong>
              <span>{item.item.equipmentSlot ?? "equipment"} / {item.item.rarity}</span>
            </button>
          ))}
        </div>

        {selectedItem ? (
          <div className="forge-details">
            <div className="forge-item-header">
              <span>{selectedSlot ? `Equipped: ${selectedSlot}` : "Inventory"}</span>
              <strong>{formatForgeItemName(selectedItem)}</strong>
              <p>{selectedItem.item.description}</p>
            </div>

            <ForgeActionBox
              actionLabel="Upgrade"
              currentLabel={`+${selectedItem.upgradeLevel ?? 0} / +5`}
              cost={getItemUpgradeCost(selectedItem.upgradeLevel ?? 0)}
              materialsAvailable={materialsAvailable}
              onAction={() => onUpgradeItem(selectedItem)}
            />

            <ForgeActionBox
              actionLabel="Increase Tier"
              currentLabel={`Tier ${selectedItem.tier ?? 0} / 3`}
              cost={getItemTierCost(selectedItem.tier ?? 0)}
              materialsAvailable={materialsAvailable}
              onAction={() => onIncreaseTier(selectedItem)}
            />

            <div className="forge-action-box">
              <div>
                <span>Imbuements</span>
                <strong>{selectedItem.imbuements?.length ? "Active" : "None"}</strong>
              </div>
              {(selectedItem.imbuements ?? []).map((active) => {
                const definition = getImbuementById(active.imbuementId);
                return (
                  <p key={active.imbuementId}>
                    {definition?.name ?? active.imbuementId}: {active.remainingHunts ?? 0} hunts restantes
                  </p>
                );
              })}
              {availableImbuements.map((imbuement) => (
                <button key={imbuement.id} onClick={() => onApplyImbuement(selectedItem, imbuement.id)} type="button">
                  Apply {imbuement.name}
                </button>
              ))}
              {(selectedItem.imbuements ?? []).length > 0 ? (
                <button onClick={() => onRemoveImbuements(selectedItem)} type="button">
                  Remove Imbuements
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ForgeActionBox({
  actionLabel,
  currentLabel,
  cost,
  materialsAvailable,
  onAction,
}: {
  actionLabel: string;
  currentLabel: string;
  cost?: { goldCost: number; requiredMaterials: { itemId: string; quantity: number }[] };
  materialsAvailable: Map<string, number>;
  onAction: () => void;
}) {
  return (
    <div className="forge-action-box">
      <div>
        <span>{actionLabel}</span>
        <strong>{currentLabel}</strong>
      </div>
      {cost ? (
        <>
          <p>{cost.goldCost.toLocaleString("en-US")}g</p>
          <ul>
            {cost.requiredMaterials.map((material) => (
              <li key={material.itemId}>
                {material.itemId}: {materialsAvailable.get(material.itemId) ?? 0}/{material.quantity}
              </li>
            ))}
          </ul>
          <button onClick={onAction} type="button">{actionLabel}</button>
        </>
      ) : (
        <p>Maximo atingido.</p>
      )}
    </div>
  );
}

export function formatForgeItemName(item: InventoryItem) {
  const upgrade = item.upgradeLevel ? ` +${item.upgradeLevel}` : "";
  const tier = item.tier ? ` [T${item.tier}]` : "";
  return `${item.item.name}${upgrade}${tier}`;
}

function matchesFilter(item: InventoryItem, filter: ForgeFilter) {
  if (filter === "all") return true;
  if (filter === "weapons") return item.item.equipmentSlot === "weapon" || item.item.equipmentSlot === "offhand";
  if (filter === "armor") return ["helmet", "armor", "legs", "boots"].includes(item.item.equipmentSlot ?? "");
  if (filter === "accessories") return ["ring", "amulet"].includes(item.item.equipmentSlot ?? "");
  if (filter === "backpack") return item.item.equipmentSlot === "backpack";
  return true;
}
