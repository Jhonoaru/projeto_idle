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
};

export function getCreatureSprite(monsterId?: string): CreatureSpriteDefinition | undefined {
  return monsterId ? creatureSprites[monsterId] : undefined;
}
