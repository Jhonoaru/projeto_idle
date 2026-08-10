export interface BossSpriteDefinition {
  src: string;
  source: "generated-original";
}

function generatedSprite(bossId: string): BossSpriteDefinition {
  return {
    src: `/assets/bosses/generated/${bossId}.png`,
    source: "generated-original",
  };
}

export const bossSprites: Readonly<Record<string, BossSpriteDefinition>> = {
  "boss-sewer-broodmother": generatedSprite("boss-sewer-broodmother"),
  "boss-grunk-camp-breaker": generatedSprite("boss-grunk-camp-breaker"),
  "boss-crypt-warden": generatedSprite("boss-crypt-warden"),
  "boss-khazgrim-gatekeeper": generatedSprite("boss-khazgrim-gatekeeper"),
  "boss-ember-matriarch": generatedSprite("boss-ember-matriarch"),
  "boss-novice-arena-champion": generatedSprite("boss-novice-arena-champion"),
};

export function getBossSprite(bossId?: string): BossSpriteDefinition | undefined {
  return bossId ? bossSprites[bossId] : undefined;
}
