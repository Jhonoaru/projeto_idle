export interface ItemSpriteDefinition {
  src: string;
  source: "generated-original";
}

const ITEM_SPRITES: Readonly<Record<string, ItemSpriteDefinition>> = {
  "old-cloth": sprite("old-cloth"),
  "spider-silk": sprite("spider-silk"),
  "rat-tail": sprite("rat-tail"),
  "dwarf-badge": sprite("dwarf-badge"),
  "dragon-ember": sprite("dragon-ember"),
};

export function getItemSprite(itemId?: string): ItemSpriteDefinition | undefined {
  return itemId ? ITEM_SPRITES[itemId] : undefined;
}

function sprite(itemId: string): ItemSpriteDefinition {
  return {
    src: `/assets/items/generated/${itemId}.png`,
    source: "generated-original",
  };
}
