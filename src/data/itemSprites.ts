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
  "light-quiver": sprite("light-quiver"),
  "adventurer-backpack": sprite("adventurer-backpack"),
  "small-backpack": sprite("small-backpack"),
  "loot-bag": sprite("loot-bag"),
  "supply-bag": sprite("supply-bag"),
  "rune-pouch": sprite("rune-pouch"),
  rope: sprite("rope"),
  shovel: sprite("shovel"),
  torch: sprite("torch"),
  "travel-scroll": sprite("travel-scroll"),
  "worn-sword": sprite("worn-sword"),
  "rusty-blade": sprite("rusty-blade"),
  "training-axe": sprite("training-axe"),
  "wooden-club": sprite("wooden-club"),
  "iron-longsword": sprite("iron-longsword"),
  "cryptsteel-blade": sprite("cryptsteel-blade"),
  "gravewood-bow": sprite("gravewood-bow"),
  "crypt-scepter": sprite("crypt-scepter"),
  "boneweave-wraps": sprite("boneweave-wraps"),
  "cryptguard-armor": sprite("cryptguard-armor"),
  "ember-blade": sprite("ember-blade"),
  "wyvern-bow": sprite("wyvern-bow"),
  "ember-staff": sprite("ember-staff"),
  "dragon-wraps": sprite("dragon-wraps"),
  "dragonscale-armor": sprite("dragonscale-armor"),
  "emberheart-amulet": sprite("emberheart-amulet"),
  "wooden-shield": sprite("wooden-shield"),
  "leather-armor": sprite("leather-armor"),
  "simple-bow": sprite("simple-bow"),
  "leather-boots": sprite("leather-boots"),
  "novice-wand": sprite("novice-wand"),
  "apprentice-robe": sprite("apprentice-robe"),
  "mystic-cap": sprite("mystic-cap"),
  "monk-wraps": sprite("monk-wraps"),
  "cloth-sash": sprite("cloth-sash"),
  "leather-helmet": sprite("leather-helmet"),
  "iron-handwraps": sprite("iron-handwraps"),
  "runed-wand": sprite("runed-wand"),
  "ironwood-bow": sprite("ironwood-bow"),
  "ranger-gloves": sprite("ranger-gloves"),
  "leather-legs": sprite("leather-legs"),
  "copper-ring": sprite("copper-ring"),
  "small-amulet": sprite("small-amulet"),
  "brass-shield": sprite("brass-shield"),
  "iron-cuirass": sprite("iron-cuirass"),
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
