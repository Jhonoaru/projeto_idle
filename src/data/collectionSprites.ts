export interface CollectionSpriteDefinition {
  src: string;
  source: "generated-original";
}

const generatedSprite = (collectionId: string): CollectionSpriteDefinition => ({
  src: `/assets/collections/generated/${collectionId}.png`,
  source: "generated-original",
});

export const collectionSprites: Record<string, CollectionSpriteDefinition> = {
  "avatar-broodmother-crest": generatedSprite("avatar-broodmother-crest"),
  "avatar-camp-breaker-mark": generatedSprite("avatar-camp-breaker-mark"),
  "avatar-crypt-warden-seal": generatedSprite("avatar-crypt-warden-seal"),
  "avatar-khazgrim-gate-sigil": generatedSprite("avatar-khazgrim-gate-sigil"),
  "avatar-ember-crown": generatedSprite("avatar-ember-crown"),
  "avatar-arena-laurel": generatedSprite("avatar-arena-laurel"),
};

export function getCollectionSprite(collectionId?: string) {
  return collectionId && Object.hasOwn(collectionSprites, collectionId) ? collectionSprites[collectionId] : undefined;
}
