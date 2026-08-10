export interface BossArenaBackgroundDefinition {
  src: string;
  className: string;
  label: string;
  source: "generated-original";
}

const generatedArena = (
  fileName: string,
  className: string,
  label: string,
): BossArenaBackgroundDefinition => ({
  src: `/assets/boss-arenas/generated/${fileName}.jpg`,
  className,
  label,
  source: "generated-original",
});

export const bossArenaBackgrounds: Record<string, BossArenaBackgroundDefinition> = {
  "boss-sewer-broodmother": generatedArena("sewer-broodmother-arena", "boss-arena-sewer", "Brood chamber"),
  "boss-grunk-camp-breaker": generatedArena("grunk-war-camp", "boss-arena-camp", "War camp"),
  "boss-crypt-warden": generatedArena("crypt-warden-sanctum", "boss-arena-crypt", "Warden sanctum"),
  "boss-khazgrim-gatekeeper": generatedArena("khazgrim-gate-arena", "boss-arena-mountain", "Khazgrim gate"),
  "boss-ember-matriarch": generatedArena("ember-matriarch-nest", "boss-arena-ember", "Matriarch nest"),
  "boss-novice-arena-champion": generatedArena("novice-guild-arena", "boss-arena-guild", "Thaeron guild arena"),
};

export function getBossArenaBackground(bossId?: string) {
  return bossId ? bossArenaBackgrounds[bossId] : undefined;
}
