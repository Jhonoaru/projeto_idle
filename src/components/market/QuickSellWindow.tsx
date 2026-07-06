import { useEffect, useMemo, useRef, useState } from "react";
import { ItemIcon } from "../items/ItemIcon";
import { ItemTooltip } from "../items/ItemTooltip";
import { getQuickSellCandidates, summarizeQuickSellSelection } from "../../game-engine/market/quickSellItems";
import type { Character, GuildDepot, InventoryItem, SellSource } from "../../shared/types";

type QuickSellFilter = "safe" | "loot" | "materials" | "equipment" | "all";

interface QuickSellWindowProps {
  character: Character;
  guildDepot: GuildDepot;
  onSellItems: (source: SellSource, inventoryItemIds: string[]) => void;
}

export function QuickSellWindow({ character, guildDepot, onSellItems }: QuickSellWindowProps) {
  const [source, setSource] = useState<SellSource>("character_inventory");
  const [filter, setFilter] = useState<QuickSellFilter>("safe");
  const [isSelling, setIsSelling] = useState(false);
  const isSellingRef = useRef(false);
  const sourceItems = getSourceItems(source, character, guildDepot);
  const candidates = useMemo(() => getQuickSellCandidates(sourceItems, source), [source, sourceItems]);
  const filteredCandidates = candidates.filter((candidate) => matchesFilter(candidate.inventoryItem, filter, candidate.canQuickSell));
  const defaultIds = candidates
    .filter((candidate) => candidate.selectedByDefault)
    .map((candidate) => candidate.inventoryItem.id);
  const [selectedIds, setSelectedIds] = useState<string[]>(defaultIds);
  const summary = summarizeQuickSellSelection(filteredCandidates, selectedIds);

  useEffect(() => {
    setSelectedIds(defaultIds);
  }, [source, filter, defaultIds.join("|")]);

  function toggleSelected(inventoryItemId: string) {
    setSelectedIds((currentIds) =>
      currentIds.includes(inventoryItemId)
        ? currentIds.filter((id) => id !== inventoryItemId)
        : [...currentIds, inventoryItemId],
    );
  }

  function sellSelected() {
    if (summary.selectedIds.length === 0 || isSellingRef.current) return;

    isSellingRef.current = true;
    setIsSelling(true);
    onSellItems(source, summary.selectedIds);
    setSelectedIds([]);
    window.setTimeout(() => {
      isSellingRef.current = false;
      setIsSelling(false);
    }, 0);
  }

  return (
    <div className="quick-sell-window">
      <div className="market-heading">
        <div>
          <span>Venda Rapida</span>
          <strong>Loot seguro para vender</strong>
        </div>
        <p>Seleciona por padrao apenas loot/material comum sem avisos.</p>
      </div>

      <div className="quick-sell-toolbar">
        <select onChange={(event) => setSource(event.target.value as SellSource)} value={source}>
          <option value="character_inventory">Inventory</option>
          <option value="character_depot">Character Depot</option>
          <option value="guild_depot">Guild Depot</option>
        </select>
        <select onChange={(event) => setFilter(event.target.value as QuickSellFilter)} value={filter}>
          <option value="safe">Safe default</option>
          <option value="loot">Loot</option>
          <option value="materials">Materials</option>
          <option value="equipment">Equipment</option>
          <option value="all">All sellable</option>
        </select>
      </div>

      <div className="quick-sell-summary">
        <div>
          <span>Selecionados</span>
          <strong>{summary.selectedCount}/{filteredCandidates.length}</strong>
        </div>
        <div>
          <span>Total gold</span>
          <strong>{summary.totalGold.toLocaleString("en-US")}g</strong>
        </div>
        <button disabled={summary.totalGold <= 0 || isSelling} onClick={sellSelected} type="button">
          Vender
        </button>
        <button onClick={() => setSelectedIds([])} type="button">
          Cancelar
        </button>
      </div>

      <div className="quick-sell-grid">
        {filteredCandidates.length > 0 ? (
          filteredCandidates.map((candidate) => {
            const selected = selectedIds.includes(candidate.inventoryItem.id) && candidate.canQuickSell;

            return (
              <button
                className={`quick-sell-card ${selected ? "is-selected" : ""} ${candidate.canQuickSell ? "" : "is-blocked"}`.trim()}
                disabled={!candidate.canQuickSell}
                key={candidate.inventoryItem.id}
                onClick={() => toggleSelected(candidate.inventoryItem.id)}
                type="button"
              >
                <ItemIcon inventoryItem={candidate.inventoryItem} selected={selected} size="medium" />
                <strong>{candidate.inventoryItem.item.name}</strong>
                <span>x{candidate.inventoryItem.quantity} / {candidate.totalGold.toLocaleString("en-US")}g</span>
                {candidate.reason ? <small>{candidate.reason}</small> : <small>Safe quick sell</small>}
                <ItemTooltip inventoryItem={candidate.inventoryItem} sellReason={candidate.reason} />
              </button>
            );
          })
        ) : (
          <div className="empty-list">Nenhum item seguro para venda rapida nesta origem.</div>
        )}
      </div>
    </div>
  );
}

function getSourceItems(source: SellSource, character: Character, guildDepot: GuildDepot): InventoryItem[] {
  if (source === "character_depot") return character.characterDepot;
  if (source === "guild_depot") return guildDepot.items;
  return character.inventory.filter((item) => !item.parentContainerId);
}

function matchesFilter(inventoryItem: InventoryItem, filter: QuickSellFilter, canQuickSell: boolean) {
  if (filter === "safe") return canQuickSell;
  if (filter === "loot") return inventoryItem.item.type === "creature_product";
  if (filter === "materials") return inventoryItem.item.type === "material";
  if (filter === "equipment") return inventoryItem.item.type === "equipment";
  return true;
}
