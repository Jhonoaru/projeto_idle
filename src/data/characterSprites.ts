export interface CharacterSpriteDefinition {
  src: string;
  source: "generated-original";
}

const generatedSprite = (characterId: string): CharacterSpriteDefinition => ({
  src: `/assets/characters/generated/${characterId}.png`,
  source: "generated-original",
});

export const characterSprites: Record<string, CharacterSpriteDefinition> = {
  "char-arkon": generatedSprite("char-arkon"),
  "char-ayla": generatedSprite("char-ayla"),
  "char-mira": generatedSprite("char-mira"),
  "char-lyra": generatedSprite("char-lyra"),
  "char-shen": generatedSprite("char-shen"),
};

export function getCharacterSprite(characterId?: string) {
  return characterId ? characterSprites[characterId] : undefined;
}
