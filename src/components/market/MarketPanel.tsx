import { useMemo, useState } from "react";
import { getItemById } from "../../data/items";
import { shopItems } from "../../data/shopItems";
import { calculateSellValue } from "../../game-engine/market/calculateSellValue";
import { filterMarketItems } from "../../game-engine/market/filterMarketItems";
import { getSellableItems } from "../../game-engine/market/getSellableItems";
import { MarketFilters } from "./MarketFilters";
import { MarketItemRow } from "./MarketItemRow";
import { QuickSellWindow } from "./QuickSellWindow";
import { MarketSourceTabs } from "./MarketSourceTabs";
import { SellSummaryPanel } from "./SellSummaryPanel";
import type {
  Character,
  Guild,
  GuildDepot,
  InventoryItem,
  ItemRarity,
  MarketItemCategory,
  SellSource,
  ShopCategory,
  ShopDeliveryTarget,
} from "../../shared/types";

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
  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [shopCategory, setShopCategory] = useState<ShopCategory>("potions");
  const [deliveryTarget, setDeliveryTarget] = useState<ShopDeliveryTarget>("character_inventory");
  const [source, setSource] = useState<SellSource>("character_inventory");
  const [category, setCategory] = useState<MarketItemCategory>("all");
  const [rarity, setRarity] = useState<ItemRarity | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const sourceItems = getSourceItems(source, character, guildDepot);
  const filteredItems = useMemo(
    () =>
      filterMarketItems(getSellableItems(sourceItems), {
        category,
        rarity,
        search,
        source,
      }),
    [category, rarity, search, source, sourceItems],
  );
  const selectedGold = filteredItems
    .filter((item) => selectedIds.includes(item.id))
    .reduce(
      (total, item) => total + calculateSellValue(item.item, item.quantity).totalValue,
      0,
    );

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
    onSellItems(source, ids);
    setSelectedIds([]);
  }

  return (
    <div className="market-panel">
      <div className="market-heading">
        <div>
          <span>Mercador</span>
          <strong>Market NPC</strong>
        </div>
        <p>
          {mode === "buy"
            ? `Compras para ${deliveryTargetLabel(deliveryTarget, character.name)}`
            : getDestinationLabel(guild.name)}
        </p>
      </div>

      <div className="market-source-tabs">
        <button
          className={mode === "buy" ? "is-selected" : ""}
          onClick={() => setMode("buy")}
          type="button"
        >
          Comprar
        </button>
        <button
          className={mode === "sell" ? "is-selected" : ""}
          onClick={() => setMode("sell")}
          type="button"
        >
          Vender
        </button>
      </div>

      {mode === "buy" ? (
        <BuyShop
          character={character}
          deliveryTarget={deliveryTarget}
          guild={guild}
          onBuyItem={onBuyItem}
          onChangeDeliveryTarget={setDeliveryTarget}
          onChangeShopCategory={setShopCategory}
          shopCategory={shopCategory}
        />
      ) : (
        <>
          <MarketSourceTabs activeSource={source} onChangeSource={handleChangeSource} />
          <QuickSellWindow
            character={character}
            guildDepot={guildDepot}
            onSellItems={onSellItems}
          />
          <MarketFilters
            category={category}
            onChangeCategory={setCategory}
            onChangeRarity={setRarity}
            onChangeSearch={setSearch}
            rarity={rarity}
            search={search}
          />

          <SellSummaryPanel
            destinationLabel={getDestinationLabel(guild.name)}
            onSellCategory={(sellCategory) => {
              onSellCategory(source, sellCategory);
              setSelectedIds([]);
            }}
            onSellSelected={() => sellAndClear(selectedIds)}
            selectedCount={selectedIds.length}
            selectedGold={selectedGold}
            source={source}
          />

          <div className="market-list">
            {filteredItems.length > 0 ? (
              filteredItems.map((inventoryItem) => (
                <MarketItemRow
                  inventoryItem={inventoryItem}
                  key={inventoryItem.id}
                  onSellOne={(inventoryItemId) => sellAndClear([inventoryItemId])}
                  onToggleLock={(inventoryItemId) => onToggleLock(source, inventoryItemId)}
                  onToggleSelected={toggleSelected}
                  selected={selectedIds.includes(inventoryItem.id)}
                  source={source}
                />
              ))
            ) : (
              <div className="empty-list">Nenhum item vendavel nesta origem.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function BuyShop({
  character,
  guild,
  shopCategory,
  deliveryTarget,
  onChangeShopCategory,
  onChangeDeliveryTarget,
  onBuyItem,
}: {
  character: Character;
  guild: Guild;
  shopCategory: ShopCategory;
  deliveryTarget: ShopDeliveryTarget;
  onChangeShopCategory: (category: ShopCategory) => void;
  onChangeDeliveryTarget: (target: ShopDeliveryTarget) => void;
  onBuyItem: MarketPanelProps["onBuyItem"];
}) {
  return (
    <>
      <div className="market-destination">
        <span>Comprar usando</span>
        <strong>
          Compra usando gold da Guilda {guild.name}. Saldo: {guild.gold.toLocaleString("en-US")}g
        </strong>
      </div>

      <div className="market-destination">
        <span>Comprar para</span>
        <div className="market-destination-options">
          <button
            className={deliveryTarget === "character_inventory" ? "is-selected" : ""}
            onClick={() => onChangeDeliveryTarget("character_inventory")}
            type="button"
          >
            Inventario
          </button>
          <button
            className={deliveryTarget === "character_depot" ? "is-selected" : ""}
            onClick={() => onChangeDeliveryTarget("character_depot")}
            type="button"
          >
            Depot do Personagem
          </button>
          <button
            className={deliveryTarget === "guild_depot" ? "is-selected" : ""}
            onClick={() => onChangeDeliveryTarget("guild_depot")}
            type="button"
          >
            Guild Depot
          </button>
        </div>
        <strong>{deliveryTargetLabel(deliveryTarget, character.name)}</strong>
      </div>

      <div className="market-source-tabs">
        {(["potions", "runes", "ammo", "containers", "utilities"] as ShopCategory[]).map(
          (entry) => (
            <button
              className={shopCategory === entry ? "is-selected" : ""}
              key={entry}
              onClick={() => onChangeShopCategory(entry)}
              type="button"
            >
              {shopCategoryLabel(entry)}
            </button>
          ),
        )}
      </div>

      <div className="market-list">
        {shopItems
          .filter((shopItem) => shopItem.category === shopCategory)
          .map((shopItem) => {
            const item = getItemById(shopItem.itemId);
            const total = shopItem.buyPrice * shopItem.defaultQuantity;

            return (
              <article className={`market-row rarity-${item.rarity}`} key={shopItem.itemId}>
                <label>
                  <span>{item.name}</span>
                </label>
                <div className="market-row-meta">
                  <span>{shopCategoryLabel(shopItem.category)}</span>
                  <span>{item.rarity}</span>
                  <span>x{shopItem.defaultQuantity}</span>
                </div>
                <div className="market-row-value">
                  <span>{shopItem.buyPrice.toLocaleString("en-US")}g cada</span>
                  <strong>{total.toLocaleString("en-US")}g</strong>
                </div>
                <div className="market-row-actions">
                  <button
                    onClick={() =>
                      onBuyItem(
                        shopItem.itemId,
                        shopItem.defaultQuantity,
                        shopItem.buyPrice,
                        deliveryTarget,
                      )
                    }
                    type="button"
                  >
                    Comprar
                  </button>
                </div>
              </article>
            );
          })}
      </div>
    </>
  );
}

function getSourceItems(
  source: SellSource,
  character: Character,
  guildDepot: GuildDepot,
): InventoryItem[] {
  if (source === "character_depot") return character.characterDepot;
  if (source === "guild_depot") return guildDepot.items;
  return character.inventory;
}

function getDestinationLabel(guildName: string) {
  return `Gold sera enviado para a Guilda ${guildName}.`;
}

function shopCategoryLabel(category: ShopCategory) {
  const labels: Record<ShopCategory, string> = {
    potions: "Potions",
    runes: "Runes",
    ammo: "Municoes / Quivers",
    containers: "Bags / Containers",
    utilities: "Utilidades",
  };

  return labels[category];
}

function deliveryTargetLabel(target: ShopDeliveryTarget, characterName: string) {
  if (target === "character_depot") return `Depot de ${characterName}`;
  if (target === "guild_depot") return "Guild Depot";
  return `Inventario de ${characterName}`;
}
