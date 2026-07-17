import { getItemById } from "./items";

export interface CosmeticExchangeMaterial {
  itemId: string;
  quantity: number;
}

export interface CosmeticExchangeDefinition {
  collectionItemId: string;
  label: string;
  goldCost: number;
  materials: CosmeticExchangeMaterial[];
  requiredQuestId?: string;
}

export const cosmeticExchanges: CosmeticExchangeDefinition[] = [
  {
    collectionItemId: "outfit-noble-adventurer",
    label: "Guild tailor commission",
    goldCost: 350,
    materials: [],
  },
  {
    collectionItemId: "mount-merchant-cart",
    label: "Khazgrim trade contract",
    goldCost: 250,
    materials: [{ itemId: "dwarf-badge", quantity: 2 }],
  },
  {
    collectionItemId: "mount-ash-wolf",
    label: "Ember Matriarch trophy exchange",
    goldCost: 0,
    materials: [{ itemId: "dragon-ember", quantity: 1 }],
  },
  {
    collectionItemId: "avatar-ancient-rune-sigil",
    label: "Crypt archive inscription",
    goldCost: 0,
    materials: [{ itemId: "enchanted-dust", quantity: 2 }],
    requiredQuestId: "quest-crypt-permission",
  },
];

export function getCosmeticExchange(collectionItemId?: string) {
  return cosmeticExchanges.find((exchange) => exchange.collectionItemId === collectionItemId);
}

export function formatCosmeticExchangeCost(exchange: CosmeticExchangeDefinition) {
  const parts = [
    exchange.goldCost > 0 ? `${exchange.goldCost.toLocaleString("en-US")}g` : "",
    ...exchange.materials.map((material) => {
      const item = getItemById(material.itemId);
      return `${item?.name ?? material.itemId} x${material.quantity}`;
    }),
  ].filter(Boolean);
  return parts.join(" + ") || "No cost";
}
