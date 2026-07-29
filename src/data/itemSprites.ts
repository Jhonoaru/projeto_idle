export interface ItemSpriteDefinition {
  src: string;
  source: "generated-original";
}

const ITEM_SPRITES: Readonly<Record<string, ItemSpriteDefinition>> = {
  "minor-health-potion": sprite("minor-health-potion"),
  "health-potion": sprite("health-potion"),
  "mana-potion": sprite("mana-potion"),
  "strong-health-potion": sprite("strong-health-potion"),
  "strong-mana-potion": sprite("strong-mana-potion"),
  "light-magic-rune": sprite("light-magic-rune"),
  "fire-burst-rune": sprite("fire-burst-rune"),
  "healing-rune": sprite("healing-rune"),
  "energy-strike-rune": sprite("energy-strike-rune"),
  "simple-arrow": sprite("simple-arrow"),
  "piercing-arrow": sprite("piercing-arrow"),
  "iron-ore": sprite("iron-ore"),
  "enchanted-dust": sprite("enchanted-dust"),
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
