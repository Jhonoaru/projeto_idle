import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getItemById } from "../../data/items";
import { shopItems, type ShopItem } from "../../data/shopItems";
import { canSellItem } from "../../game-engine/market/canSellItem";
import { calculateInventoryItemSellValue } from "../../game-engine/market/calculateSellValue";
import { filterMarketItems } from "../../game-engine/market/filterMarketItems";
import { getHeadquartersBonuses } from "../../game-engine/headquarters/getHeadquartersBonuses";
import { ItemIcon } from "../items/ItemIcon";
import { ItemTooltip } from "../items/ItemTooltip";
import { MarketFilters } from "./MarketFilters";
import { MarketItemRow } from "./MarketItemRow";
import { MarketSourceTabs } from "./MarketSourceTabs";
import { QuickSellWindow } from "./QuickSellWindow";
import { SellSummaryPanel } from "./SellSummaryPanel";
import type {
  Character,
  EquipmentSlot,
  Guild,
  GuildDepot,
  InventoryItem,
  Item,
  ItemRarity,
  MarketItemCategory,
  SellSource,
  ShopCategory,
  ShopDeliveryTarget,
} from "../../shared/types";

type MarketMode = "buy" | "sell" | "quick_sell";

interface MarketPanelProps {
  character: Character;
  guild: Guild;
  guildDepot: GuildDepot;
  onSellItems: (
    source: SellSource,
    inventoryItemIds: string[],
  ) => void;
  onToggleLock: (source: SellSource, inventoryItemId: string) => void;
  onSellCategory: (
    source: SellSource,
    category: MarketItemCategory,
  ) => void;
  onBuyItem: (
    itemId: string,
    quantity: number,
    unitPrice: number,
    deliveryTarget: ShopDeliveryTarget,
  ) => void;
}

export function MarketPanel({
  character,
  guild,
  guildDepot,
  onSellItems,
  onToggleLock,
  onSellCategory,
  onBuyItem,
}: MarketPanelProps) {
  const [mode, setMode] = useState<MarketMode>("buy");
  const headquartersDiscount = getHeadquartersBonuses(guild.headquarters).npcPriceDiscountPercent;

  return (
    <div className="market-window">
      <header className="market-hero">
        <div>
          <span>Mercador da Guilda</span>
          <strong>Market NPC</strong>
          <p>Loja local offline para supplies, containers, loot e venda segura da guilda.</p>
        </div>
        <div className="market-gold">
          <span>Guild Gold</span>
          <strong>{normalizeGold(guild.gold).toLocaleString("en-US")}g</strong>
          {headquartersDiscount > 0 ? <small>Quartermaster -{headquartersDiscount}%</small> : null}
        </div>
      </header>

      <nav className="market-tabs" aria-label="Market tabs">
        <MarketTabButton active={mode === "buy"} label="Buy" onClick={() => setMode("buy")} />
        <MarketTabButton active={mode === "sell"} label="Sell" onClick={() => setMode("sell")} />
        <MarketTabButton active={mode === "quick_sell"} label="Quick Sell" onClick={() => setMode("quick_sell")} />
        <button disabled title="Placeholder visual para uma etapa futura." type="button">
          Buyback
        </button>
        <button disabled title="Placeholder visual para uma etapa futura." type="button">
          Services
        </button>
      </nav>

      {mode === "buy" ? (
        <MarketBuyTab
          character={character}
          guild={guild}
          npcDiscountPercent={headquartersDiscount}
          onBuyItem={onBuyItem}
        />
      ) : null}

      {mode === "sell" ? (
        <MarketSellTab
          character={character}
          guild={guild}
          guildDepot={guildDepot}
          onSellCategory={onSellCategory}
          onSellItems={onSellItems}
          onToggleLock={onToggleLock}
        />
      ) : null}

      {mode === "quick_sell" ? (
        <section className="market-tab-panel">
          <QuickSellWindow
            character={character}
            guildDepot={guildDepot}
            onSellItems={onSellItems}
          />
        </section>
      ) : null}
    </div>
  );
}

function MarketBuyTab({
  character,
  guild,
  npcDiscountPercent,
  onBuyItem,
}: {
  character: Character;
  guild: Guild;
  npcDiscountPercent: number;
  onBuyItem: MarketPanelProps["onBuyItem"];
}) {
  const [shopCategory, setShopCategory] = useState<ShopCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [deliveryTarget, setDeliveryTarget] = useState<ShopDeliveryTarget>("character_inventory");
  const [selectedItemId, setSelectedItemId] = useState(shopItems[0]?.itemId ?? "");
  const [quantity, setQuantity] = useState(1);
  const [isBuying, setIsBuying] = useState(false);
  const isBuyingRef = useRef(false);
  const catalog = useMemo(() => getVisibleShopItems(shopCategory, search), [shopCategory, search]);
  const selectedShopItem = catalog.find((entry) => entry.itemId === selectedItemId) ?? catalog[0] ?? shopItems[0];
  const selectedItem = safeGetItem(selectedShopItem?.itemId);
  const normalizedQuantity = normalizeQuantity(quantity);
  const totalQuantity = (selectedShopItem?.defaultQuantity ?? 1) * normalizedQuantity;
  const discountedUnitPrice = applyNpcDiscount(selectedShopItem?.buyPrice ?? 0, npcDiscountPercent);
  const totalCost = discountedUnitPrice * totalQuantity;
  const canAfford = normalizeGold(guild.gold) >= totalCost;
  const useStatus = selectedItem ? getUseStatus(selectedItem, character) : { canUse: false, message: "Item indisponivel." };
  const equippedItem = selectedItem?.equipmentSlot ? character.equipment[selectedItem.equipmentSlot as EquipmentSlot] : undefined;

  useEffect(() => {
    if (!catalog.some((entry) => entry.itemId === selectedItemId)) {
      setSelectedItemId(catalog[0]?.itemId ?? "");
    }
  }, [catalog, selectedItemId]);

  function buySelected() {
    if (!selectedShopItem || !selectedItem || !canAfford || !useStatus.canUse || isBuyingRef.current) return;

    isBuyingRef.current = true;
    setIsBuying(true);
    onBuyItem(selectedShopItem.itemId, totalQuantity, discountedUnitPrice, deliveryTarget);
    window.setTimeout(() => {
      isBuyingRef.current = false;
      setIsBuying(false);
    }, 250);
  }

  return (
    <section className="market-tab-panel market-buy-layout">
      <aside className="market-filter-rail">
        <MarketSearchBar search={search} onChangeSearch={setSearch} />
        <div className="market-category-stack">
          {(["all", "potions", "runes", "ammo", "containers", "utilities"] as Array<ShopCategory | "all">).map((entry) => (
            <button
              className={shopCategory === entry ? "is-selected" : ""}
              key={entry}
              onClick={() => setShopCategory(entry)}
              type="button"
            >
              {entry === "all" ? "All Goods" : shopCategoryLabel(entry)}
            </button>
          ))}
        </div>
      </aside>

      <div className="market-item-list">
        {catalog.length > 0 ? (
          catalog.map((shopItem) => {
            const item = safeGetItem(shopItem.itemId);
            if (!item) return null;
            const selected = shopItem.itemId === selectedShopItem?.itemId;
            const bundleCost = applyNpcDiscount(shopItem.buyPrice, npcDiscountPercent) * shopItem.defaultQuantity;

            return (
              <button
                className={`market-item-card rarity-${item.rarity} ${selected ? "market-item-card-selected" : ""}`.trim()}
                key={shopItem.itemId}
                onClick={() => setSelectedItemId(shopItem.itemId)}
                type="button"
              >
                <ItemIcon item={item} quantity={shopItem.defaultQuantity} size="medium" />
                <span>{shopCategoryLabel(shopItem.category)}</span>
                <strong>{item.name}</strong>
                <small>{item.type} / {item.rarity}</small>
                <em>{bundleCost.toLocaleString("en-US")}g per bundle</em>
              </button>
            );
          })
        ) : (
          <div className="empty-list">Nenhum item encontrado no Market NPC.</div>
        )}
      </div>

      <MarketTransactionSummary
        title="Purchase Order"
        rows={[
          ["Item", selectedItem?.name ?? "Unavailable"],
          ["Bundle", `x${selectedShopItem?.defaultQuantity ?? 0}`],
          ["Bundles", normalizedQuantity],
          ["Unit price", `${discountedUnitPrice.toLocaleString("en-US")}g`],
          ["Total", `${totalCost.toLocaleString("en-US")}g`],
          ["Gold after", `${Math.max(0, normalizeGold(guild.gold) - totalCost).toLocaleString("en-US")}g`],
          ["Destination", deliveryTargetLabel(deliveryTarget, character.name)],
        ]}
        warning={!canAfford ? "Gold insuficiente para esta compra." : useStatus.message}
      >
        {selectedItem ? (
          <div className="market-selected-preview">
            <ItemIcon item={selectedItem} quantity={totalQuantity} size="large" />
            <ItemTooltip inventoryItem={makePreviewInventoryItem(selectedItem, totalQuantity)} />
          </div>
        ) : null}

        <div className="market-destination-options">
          <button
            className={deliveryTarget === "character_inventory" ? "is-selected" : ""}
            onClick={() => setDeliveryTarget("character_inventory")}
            type="button"
          >
            Inventory
          </button>
          <button
            className={deliveryTarget === "character_depot" ? "is-selected" : ""}
            onClick={() => setDeliveryTarget("character_depot")}
            type="button"
          >
            Char Depot
          </button>
          <button
            className={deliveryTarget === "guild_depot" ? "is-selected" : ""}
            onClick={() => setDeliveryTarget("guild_depot")}
            type="button"
          >
            Guild Depot
          </button>
        </div>

        <div className="market-quantity-control">
          <button onClick={() => setQuantity((current) => Math.max(1, current - 1))} type="button">
            -
          </button>
          <input
            min={1}
            onChange={(event) => setQuantity(normalizeQuantity(Number(event.target.value)))}
            type="number"
            value={normalizedQuantity}
          />
          <button onClick={() => setQuantity((current) => normalizeQuantity(current + 1))} type="button">
            +
          </button>
        </div>

        {equippedItem ? <ComparisonPreview equippedItem={equippedItem} marketItem={selectedItem} /> : null}

        <button className="market-primary-action" disabled={!selectedItem || !canAfford || !useStatus.canUse || isBuying} onClick={buySelected} type="button">
          Confirm Buy
        </button>
      </MarketTransactionSummary>
    </section>
  );
}

function MarketSellTab({
  character,
  guild,
  guildDepot,
  onSellItems,
  onToggleLock,
  onSellCategory,
}: {
  character: Character;
  guild: Guild;
  guildDepot: GuildDepot;
  onSellItems: MarketPanelProps["onSellItems"];
  onToggleLock: MarketPanelProps["onToggleLock"];
  onSellCategory: MarketPanelProps["onSellCategory"];
}) {
  const [source, setSource] = useState<SellSource>("character_inventory");
  const [category, setCategory] = useState<MarketItemCategory>("all");
  const [rarity, setRarity] = useState<ItemRarity | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelling, setIsSelling] = useState(false);
  const isSellingRef = useRef(false);
  const sourceItems = getSourceItems(source, character, guildDepot);
  const filteredItems = useMemo(
    () =>
      filterMarketItems(sourceItems, {
        category,
        rarity,
        search,
        source,
      }),
    [category, rarity, search, source, sourceItems],
  );
  const sellableSelectedIds = filteredItems
    .filter((item) => selectedIds.includes(item.id) && canSellItem(item, sourceItems).canSell)
    .map((item) => item.id);
  const selectedGold = filteredItems
    .filter((item) => sellableSelectedIds.includes(item.id))
    .reduce((total, item) => total + calculateInventoryItemSellValue(item).totalValue, 0);
  const protectedCount = sourceItems.filter((item) => !canSellItem(item, sourceItems).canSell).length;

  function handleChangeSource(nextSource: SellSource) {
    setSource(nextSource);
    setSelectedIds([]);
  }

  function toggleSelected(inventoryItemId: string) {
    setSelectedIds((currentIds) =>
      currentIds.includes(inventoryItemId)
        ? currentIds.filter((id) => id !== inventoryItemId)
        : [...currentIds, inventoryItemId],
    );
  }

  function sellAndClear(ids: string[]) {
    const safeIds = ids.filter((id) => {
      const inventoryItem = sourceItems.find((item) => item.id === id);
      return canSellItem(inventoryItem, sourceItems).canSell;
    });

    if (safeIds.length === 0 || isSellingRef.current) return;

    isSellingRef.current = true;
    setIsSelling(true);
    onSellItems(source, safeIds);
    setSelectedIds([]);
    window.setTimeout(() => {
      isSellingRef.current = false;
      setIsSelling(false);
    }, 250);
  }

  return (
    <section className="market-tab-panel">
      <div className="market-sell-toolbar">
        <MarketSourceTabs activeSource={source} onChangeSource={handleChangeSource} />
        <MarketFilters
          category={category}
          onChangeCategory={setCategory}
          onChangeRarity={setRarity}
          onChangeSearch={setSearch}
          rarity={rarity}
          search={search}
        />
      </div>

      <SellSummaryPanel
        destinationLabel={`Gold sera enviado para a Guilda ${guild.name}.`}
        onSellCategory={(sellCategory) => {
          onSellCategory(source, sellCategory);
          setSelectedIds([]);
        }}
        onSellSelected={() => sellAndClear(selectedIds)}
        selectedCount={sellableSelectedIds.length}
        selectedGold={selectedGold}
        source={source}
      />

      <MarketTransactionSummary
        title="Sell Safety"
        rows={[
          ["Origem", sourceLabel(source)],
          ["Itens na origem", sourceItems.length],
          ["Itens visiveis", filteredItems.length],
          ["Protegidos", protectedCount],
          ["Gold atual", `${normalizeGold(guild.gold).toLocaleString("en-US")}g`],
          ["Gold apos venda", `${(normalizeGold(guild.gold) + selectedGold).toLocaleString("en-US")}g`],
        ]}
        warning="Itens locked, quest, imbued, containers com conteudo e sem valor continuam bloqueados. Equipment, supplies, rare, tier e upgrade aparecem com aviso."
      />

      <div className="market-item-list market-item-list-dense">
        {filteredItems.length > 0 ? (
          filteredItems.map((inventoryItem) => (
            <MarketItemRow
              actionsDisabled={isSelling}
              inventoryItem={inventoryItem}
              key={inventoryItem.id}
              onSellOne={(inventoryItemId) => sellAndClear([inventoryItemId])}
              onToggleLock={(inventoryItemId) => onToggleLock(source, inventoryItemId)}
              onToggleSelected={toggleSelected}
              selected={selectedIds.includes(inventoryItem.id)}
              source={source}
              sourceItems={sourceItems}
            />
          ))
        ) : (
          <div className="empty-list">Nenhum item encontrado nesta origem.</div>
        )}
      </div>
    </section>
  );
}

function MarketTransactionSummary({
  title,
  rows,
  warning,
  children,
}: {
  title: string;
  rows: Array<[string, string | number]>;
  warning?: string;
  children?: ReactNode;
}) {
  return (
    <aside className="market-summary">
      <strong>{title}</strong>
      <div className="market-summary-grid">
        {rows.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <em>{value}</em>
          </div>
        ))}
      </div>
      {warning ? <p className="market-warning">{warning}</p> : null}
      {children}
    </aside>
  );
}

function MarketSearchBar({
  search,
  onChangeSearch,
}: {
  search: string;
  onChangeSearch: (search: string) => void;
}) {
  return (
    <label className="market-search">
      <span>Search</span>
      <input
        onChange={(event) => onChangeSearch(event.target.value)}
        placeholder="Nome, tipo ou categoria"
        type="search"
        value={search}
      />
    </label>
  );
}

function ComparisonPreview({ equippedItem, marketItem }: { equippedItem: InventoryItem; marketItem?: Item }) {
  if (!marketItem) return null;

  const rows = [
    ["ATK", marketItem.attack, equippedItem.item.attack],
    ["DEF", marketItem.defense, equippedItem.item.defense],
    ["ARM", marketItem.armor, equippedItem.item.armor],
    ["MAG", marketItem.magicPower, equippedItem.item.magicPower],
    ["DIST", marketItem.distancePower, equippedItem.item.distancePower],
  ].filter(([, next, current]) => next !== undefined || current !== undefined);

  if (rows.length === 0) return null;

  return (
    <div className="market-comparison">
      <span>Equipped comparison</span>
      {rows.map(([label, next, current]) => {
        const diff = Number(next ?? 0) - Number(current ?? 0);
        return (
          <small className={diff >= 0 ? "is-positive" : "is-negative"} key={String(label)}>
            {label}: {Number(current ?? 0)} {"->"} {Number(next ?? 0)} ({diff >= 0 ? "+" : ""}{diff})
          </small>
        );
      })}
    </div>
  );
}

function MarketTabButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button className={active ? "is-selected" : ""} onClick={onClick} type="button">
      {label}
    </button>
  );
}

function getVisibleShopItems(category: ShopCategory | "all", search: string): ShopItem[] {
  const normalizedSearch = search.trim().toLowerCase();

  return shopItems.filter((shopItem) => {
    const item = safeGetItem(shopItem.itemId);
    if (!item) return false;

    const matchesCategory = category === "all" || shopItem.category === category;
    const matchesSearch =
      !normalizedSearch ||
      item.name.toLowerCase().includes(normalizedSearch) ||
      item.type.toLowerCase().includes(normalizedSearch) ||
      shopCategoryLabel(shopItem.category).toLowerCase().includes(normalizedSearch);

    return matchesCategory && matchesSearch;
  });
}

function safeGetItem(itemId?: string) {
  if (!itemId) return undefined;

  try {
    return getItemById(itemId);
  } catch {
    return undefined;
  }
}

function getSourceItems(source: SellSource, character: Character, guildDepot: GuildDepot): InventoryItem[] {
  if (source === "character_depot") return Array.isArray(character.characterDepot) ? character.characterDepot : [];
  if (source === "guild_depot") return Array.isArray(guildDepot.items) ? guildDepot.items : [];
  const inventory = Array.isArray(character.inventory) ? character.inventory : [];
  return inventory.filter((item) => !item.parentContainerId);
}

function makePreviewInventoryItem(item: Item, quantity: number): InventoryItem {
  return {
    id: `market-preview-${item.id}`,
    itemId: item.id,
    item,
    quantity,
    location: "guildDepot",
  };
}

function normalizeQuantity(value: number) {
  const quantity = Math.floor(Number(value));
  return Number.isFinite(quantity) && quantity > 0 ? Math.min(quantity, 999) : 1;
}

function normalizeGold(value: number) {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function applyNpcDiscount(unitPrice: number, discountPercent: number) {
  const safePrice = Number.isFinite(unitPrice) ? Math.max(0, Math.floor(unitPrice)) : 0;
  const safeDiscount = Number.isFinite(discountPercent)
    ? Math.min(25, Math.max(0, Math.floor(discountPercent)))
    : 0;
  return Math.max(1, Math.round(safePrice * (1 - safeDiscount / 100)));
}

function getUseStatus(item: Item, character: Character) {
  if (item.levelRequirement && character.level < item.levelRequirement) {
    return { canUse: false, message: `${character.name} precisa de level ${item.levelRequirement}.` };
  }

  if (item.vocationRestriction?.length && !item.vocationRestriction.includes(character.vocation)) {
    return { canUse: false, message: `${character.vocation} nao usa este item.` };
  }

  return { canUse: true, message: "Item valido para compra local offline." };
}

function shopCategoryLabel(category: ShopCategory) {
  const labels: Record<ShopCategory, string> = {
    potions: "Supplies",
    runes: "Runes",
    ammo: "Ammo / Quivers",
    containers: "Containers",
    utilities: "Utilities",
  };

  return labels[category];
}

function deliveryTargetLabel(target: ShopDeliveryTarget, characterName: string) {
  if (target === "character_depot") return `Depot de ${characterName}`;
  if (target === "guild_depot") return "Guild Depot";
  return `Inventario de ${characterName}`;
}

function sourceLabel(source: SellSource) {
  if (source === "character_depot") return "Character Depot";
  if (source === "guild_depot") return "Guild Depot";
  return "Inventory";
}
