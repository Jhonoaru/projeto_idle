import type { ItemRarity, MarketItemCategory } from "../../shared/types";

const categories: MarketItemCategory[] = [
  "all",
  "creature_product",
  "equipment",
  "consumable",
  "material",
  "misc",
];
const rarities: Array<ItemRarity | "all"> = [
  "all",
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
];

interface MarketFiltersProps {
  category: MarketItemCategory;
  rarity: ItemRarity | "all";
  search: string;
  onChangeCategory: (category: MarketItemCategory) => void;
  onChangeRarity: (rarity: ItemRarity | "all") => void;
  onChangeSearch: (search: string) => void;
}

export function MarketFilters({
  category,
  rarity,
  search,
  onChangeCategory,
  onChangeRarity,
  onChangeSearch,
}: MarketFiltersProps) {
  return (
    <div className="market-filters">
      <input
        onChange={(event) => onChangeSearch(event.target.value)}
        placeholder="Buscar item"
        type="search"
        value={search}
      />
      <select
        onChange={(event) => onChangeCategory(event.target.value as MarketItemCategory)}
        value={category}
      >
        {categories.map((entry) => (
          <option key={entry} value={entry}>
            {entry}
          </option>
        ))}
      </select>
      <select
        onChange={(event) => onChangeRarity(event.target.value as ItemRarity | "all")}
        value={rarity}
      >
        {rarities.map((entry) => (
          <option key={entry} value={entry}>
            {entry}
          </option>
        ))}
      </select>
    </div>
  );
}
