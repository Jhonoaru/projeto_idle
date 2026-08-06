export interface CreatureSpriteDefinition {
  src: string;
  source: "generated-original";
}

function generatedSprite(monsterId: string): CreatureSpriteDefinition {
  return {
    src: `/assets/creatures/generated/${monsterId}.png`,
    source: "generated-original",
  };
}

export const creatureSprites: Readonly<Record<string, CreatureSpriteDefinition>> = {
  "monster-sewer-rat": generatedSprite("monster-sewer-rat"),
  "monster-cave-spider": generatedSprite("monster-cave-spider"),
  "monster-forest-troll": generatedSprite("monster-forest-troll"),
  "monster-mud-rotter": generatedSprite("monster-mud-rotter"),
  "monster-young-minotaur": generatedSprite("monster-young-minotaur"),
  "monster-orc-raider": generatedSprite("monster-orc-raider"),
  "monster-dwarf-guard": generatedSprite("monster-dwarf-guard"),
  "monster-ancient-skeleton": generatedSprite("monster-ancient-skeleton"),
  "monster-cyclops-brute": generatedSprite("monster-cyclops-brute"),
  "monster-wyvern-hatchling": generatedSprite("monster-wyvern-hatchling"),
  "monster-dragon-whelp": generatedSprite("monster-dragon-whelp"),
  "monster-cult-acolyte": generatedSprite("monster-cult-acolyte"),
};

export function getCreatureSprite(monsterId?: string): CreatureSpriteDefinition | undefined {
  return monsterId ? creatureSprites[monsterId] : undefined;
}
