import { getCollectionItemById } from "./collections";

export interface CollectionSpriteDefinition {
  src: string;
  source: "generated-original";
}

const generatedSprite = (collectionId: string): CollectionSpriteDefinition => ({
  src: `/assets/collections/generated/${collectionId}.png?v=169`,
  source: "generated-original",
});

export const collectionSprites: Record<string, CollectionSpriteDefinition> = {
  "mount-sewer-stalker": generatedSprite("mount-sewer-stalker"),
  "mount-war-boar": generatedSprite("mount-war-boar"),
  "mount-grave-charger": generatedSprite("mount-grave-charger"),
  "mount-ironhorn-ram": generatedSprite("mount-ironhorn-ram"),
  "mount-cinder-drake": generatedSprite("mount-cinder-drake"),
  "mount-victory-lion": generatedSprite("mount-victory-lion"),
  "outfit-webkeeper": generatedSprite("outfit-webkeeper"),
  "outfit-warcamp-raider": generatedSprite("outfit-warcamp-raider"),
  "outfit-crypt-sentinel": generatedSprite("outfit-crypt-sentinel"),
  "outfit-gatekeeper-plate": generatedSprite("outfit-gatekeeper-plate"),
  "outfit-ashen-warden": generatedSprite("outfit-ashen-warden"),
  "outfit-arena-champion": generatedSprite("outfit-arena-champion"),
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

export function getOutfitSprite(collectionId?: string) {
  const item = getCollectionItemById(collectionId);
  const sprite = item?.category === "outfit" ? getCollectionSprite(item.id) : undefined;
  return sprite && item ? { ...sprite, name: item.name } : undefined;
}

export function getMountSprite(collectionId?: string) {
  const item = getCollectionItemById(collectionId);
  const sprite = item?.category === "mount" ? getCollectionSprite(item.id) : undefined;
  return sprite && item ? { ...sprite, name: item.name } : undefined;
}
