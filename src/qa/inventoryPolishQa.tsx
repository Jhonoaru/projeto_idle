import { useState } from "react";
import { createRoot } from "react-dom/client";
import { InventoryGrid } from "../components/inventory/InventoryGrid";
import { EquipmentPanel } from "../components/equipment/EquipmentPanel";
import { createInitialGameState } from "../database/saveGameRepository";
import { items } from "../data/items";
import type { InventoryItem, ItemRarity } from "../shared/types";
import "../styles.css";

const rarities: ItemRarity[] = ["common", "uncommon", "rare", "epic", "legendary"];
const fixture: InventoryItem[] = rarities.map((rarity, index) => {
  const item = Object.values(items).find((entry) => entry.rarity === rarity && entry.type === "equipment")!;
  return { id: `qa-${index}`, itemId: item.id, item, quantity: 1, location: "character", tier: index === 4 ? 3 : 0 };
});
fixture.push({ id: "qa-stack", itemId: "rat-tail", item: items["rat-tail"], quantity: 9999, location: "character", locked: true });

function InventoryPolishQa() {
  const [selected, setSelected] = useState<string>();
  const [character, setCharacter] = useState(() => structuredClone(createInitialGameState().characters[0]));
  return <main className="inventory-polish-qa">
    <h1>Stage 174 - Inventory / Equipment QA</h1>
    <InventoryGrid items={fixture} selectedItemId={selected} onSelectItem={(item) => setSelected(item.id)} />
    <h2>Equipment</h2>
    <EquipmentPanel character={character} onUnequip={(slot) => setCharacter((value) => ({ ...value, equipment: { ...value.equipment, [slot]: undefined } }))} />
  </main>;
}

createRoot(document.getElementById("root")!).render(<InventoryPolishQa />);
