import type { CollectionCategory, CollectionItem } from "../shared/types";

export const collectionItems: CollectionItem[] = [
  outfit("outfit-wanderer", "Wanderer", "A practical traveling coat for new guild hands.", "starter", "W", 10),
  outfit("outfit-field-hunter", "Field Hunter", "Leathers and cloth made for long routes.", "starter", "FH", 20),
  outfit("outfit-apprentice-mystic", "Apprentice Mystic", "A modest robe marked with a quiet focus sigil.", "starter", "AM", 30, ["Arcanist", "Warden"]),
  outfit("outfit-iron-guard", "Iron Guard", "A stern guard outfit with reinforced shoulders.", "starter", "IG", 40, ["Guardian"]),
  outfit("outfit-road-monk", "Road Monk", "Simple wraps and a weathered sash.", "starter", "RM", 50, ["Monk"]),
  outfit("outfit-rat-catcher", "Rat Catcher", "A grimy badge of sewer contracts survived.", "bestiary", "RC", 110, undefined, "Complete an early creature entry in the Bestiary."),
  outfit("outfit-cave-delver", "Cave Delver", "Heavy cloth, lamp hooks, and dust-stained boots.", "quest", "CD", 120, undefined, "Complete an early access quest."),
  outfit("outfit-bandit-breaker", "Bandit Breaker", "A rough adventurer style earned by breaking ambushes.", "boss", "BB", 130, undefined, "Defeat a bandit boss encounter."),
  outfit("outfit-raid-tactician", "Raid Tactician", "A disciplined command coat awarded for sustained precision against Boss telegraphs.", "boss", "RT", 135, undefined, "Reach Perfect chain x4 and record 12 Perfect Boss reactions."),
  outfit("outfit-webkeeper", "Webkeeper Regalia", "Layered sewer leathers bearing the Broodmother archive seal.", "boss", "WK", 151, undefined, "Master the Sewer Broodmother Raid Codex record."),
  outfit("outfit-warcamp-raider", "Warcamp Raider", "A hardened field coat archived after mastering Grunk's camp assault.", "boss", "WR", 152, undefined, "Master the Grunk Raid Codex record."),
  outfit("outfit-crypt-sentinel", "Crypt Sentinel", "Ceremonial dark plate modeled after Eldoria's sealed guardian.", "boss", "CS", 153, undefined, "Master the Crypt Warden Raid Codex record."),
  outfit("outfit-gatekeeper-plate", "Gatekeeper Plate", "Khazgrim plate etched with a veteran gate contract.", "boss", "GP", 154, undefined, "Master the Khazgrim Gatekeeper Raid Codex record."),
  outfit("outfit-ashen-warden", "Ashen Warden", "Heat-scarred regalia reserved for masters of the Ember Matriarch.", "boss", "AW", 155, undefined, "Master the Ember Matriarch Raid Codex record."),
  outfit("outfit-arena-champion", "Arena Champion", "A formal arena harness carrying the guild's mastery laurels.", "boss", "AC", 156, undefined, "Master the Novice Arena Champion Raid Codex record."),
  outfit("outfit-guild-cartographer", "Guild Cartographer", "A practical map keeper's coat earned by completing the Cartographers' Archive.", "achievement", "GC", 140, undefined, "Complete the Cartographers' Archive guild project."),
  outfit("outfit-noble-adventurer", "Noble Adventurer", "A polished formal style commissioned from the guild tailor.", "store_placeholder", "NA", 900, undefined, "Exchange 350 guild gold in the Wardrobe Exchange."),

  mount("mount-none", "No Mount", "Travel on foot.", "starter", "-", 10),
  mount("mount-old-mule", "Old Mule", "A stubborn mule used by practical caravans.", "starter", "Mule", 20),
  mount("mount-brown-pony", "Brown Pony", "A steady pony for local roads.", "starter", "Pony", 30),
  mount("mount-forest-stag", "Forest Stag", "A quiet stag from elder woodland paths.", "achievement", "Stag", 110, "Future achievement unlock."),
  mount("mount-cave-boar", "Cave Boar", "A compact beast with more courage than grace.", "bestiary", "Boar", 120, "Future Bestiary unlock."),
  mount("mount-ash-wolf", "Ash Wolf", "A smoke-gray wolf bonded through an Ember Matriarch trophy exchange.", "event_placeholder", "Wolf", 130, "Exchange a Dragon Ember in the Wardrobe Exchange."),
  mount("mount-merchant-cart", "Merchant Cart", "A small trade cart earned through a Khazgrim trophy contract.", "store_placeholder", "Cart", 900, "Exchange 250 guild gold and two Dwarf Badges in the Wardrobe Exchange."),
  mount("mount-battle-ram", "Battle Ram", "A steadfast war mount reserved for guilds with flawless Boss execution.", "boss", "Ram", 140, "Reach Perfect chain x6 and record 30 Perfect Boss reactions."),
  mount("mount-sewer-stalker", "Sewer Stalker", "A sure-footed cavern mount archived from a flawless Broodmother record.", "boss", "Stalker", 151, "Complete the flawless Sewer Broodmother Raid Codex record."),
  mount("mount-war-boar", "War Boar", "A camp-bred boar awarded for a flawless record against Grunk.", "boss", "Boar", 152, "Complete the flawless Grunk Raid Codex record."),
  mount("mount-grave-charger", "Grave Charger", "A spectral charger reserved for flawless Crypt Warden records.", "boss", "Grave", 153, "Complete the flawless Crypt Warden Raid Codex record."),
  mount("mount-ironhorn-ram", "Ironhorn Ram", "A plated Khazgrim ram carrying the gate archive standard.", "boss", "Ironhorn", 154, "Complete the flawless Khazgrim Gatekeeper Raid Codex record."),
  mount("mount-cinder-drake", "Cinder Drake", "A compact drake bonded to guilds with a flawless Ember Matriarch record.", "boss", "Drake", 155, "Complete the flawless Ember Matriarch Raid Codex record."),
  mount("mount-victory-lion", "Victory Lion", "A proud arena mount carrying a flawless champion's banner.", "boss", "Lion", 156, "Complete the flawless Novice Arena Champion Raid Codex record."),

  avatar("avatar-recruit-emblem", "Recruit Emblem", "A simple badge for new adventurers.", "starter", "R", 10),
  avatar("avatar-sword-emblem", "Sword Emblem", "A blade mark for martial characters.", "starter", "S", 20, ["Guardian"]),
  avatar("avatar-shield-emblem", "Shield Emblem", "A sturdy shield mark.", "starter", "SH", 30, ["Guardian"]),
  avatar("avatar-bow-emblem", "Bow Emblem", "A clean range mark.", "starter", "B", 40, ["Ranger"]),
  avatar("avatar-arcane-emblem", "Arcane Emblem", "A small star-shaped spell mark.", "starter", "A", 50, ["Arcanist", "Warden"]),
  avatar("avatar-monk-emblem", "Monk Emblem", "A calm hand mark.", "starter", "M", 60, ["Monk"]),
  avatar("avatar-beast-hunter-sigil", "Beast Hunter Sigil", "A sigil planned for Bestiary achievements.", "bestiary", "BH", 120, undefined, "Complete a creature family in the Bestiary."),
  avatar("avatar-dungeon-victor-sigil", "Dungeon Victor Sigil", "A sigil planned for boss victories.", "boss", "DV", 130, undefined, "Defeat a dungeon boss."),
  avatar("avatar-perfect-execution-sigil", "Perfect Execution Sigil", "A timing mark earned by chaining precise reactions during a victorious Boss operation.", "boss", "PX", 135, undefined, "Complete a victorious Boss operation with Perfect chain x2."),
  avatar("avatar-broodmother-crest", "Broodmother Crest", "A compact web crest recording the guild's first Broodmother victory.", "boss", "BC", 151, undefined, "Defeat the Sewer Broodmother and claim its Trophy Hall reward."),
  avatar("avatar-camp-breaker-mark", "Camp Breaker Mark", "A broken camp standard recording the guild's first victory over Grunk.", "boss", "CB", 152, undefined, "Defeat Grunk and claim its Trophy Hall reward."),
  avatar("avatar-crypt-warden-seal", "Crypt Warden Seal", "An old crypt seal recording the guardian's defeat.", "boss", "CW", 153, undefined, "Defeat the Crypt Warden and claim its Trophy Hall reward."),
  avatar("avatar-khazgrim-gate-sigil", "Khazgrim Gate Sigil", "An iron gate mark recording victory at Khazgrim's approach.", "boss", "KG", 154, undefined, "Defeat Khazgrim Gatekeeper and claim its Trophy Hall reward."),
  avatar("avatar-ember-crown", "Ember Crown", "A smoldering crown recording the Ember Matriarch's defeat.", "boss", "EC", 155, undefined, "Defeat the Ember Matriarch and claim its Trophy Hall reward."),
  avatar("avatar-arena-laurel", "Arena Laurel", "A guild laurel recording the first Novice Arena championship.", "boss", "AL", 156, undefined, "Defeat the Novice Arena Champion and claim its Trophy Hall reward."),
  avatar("avatar-golden-guild-sigil", "Golden Guild Sigil", "A bright guild mark awarded when the company reaches Rank S.", "achievement", "GG", 140, undefined, "Claim the Guild Level 6 reward cache."),
  avatar("avatar-quartermaster-seal", "Quartermaster Seal", "A supply station seal earned through permanent guild work.", "achievement", "QS", 145, undefined, "Complete the Field Supply Station guild project."),
  avatar("avatar-founders-mark", "Founders' Mark", "A restrained memorial mark for a guild with lasting local works.", "achievement", "FM", 146, undefined, "Complete the Founders' Monument guild project."),
  avatar("avatar-ancient-rune-sigil", "Ancient Rune Sigil", "A rune mark inscribed from recovered crypt dust.", "event_placeholder", "AR", 150, undefined, "Complete the Crypt Permission quest and exchange two Enchanted Dust."),
];

export function getCollectionItemById(itemId?: string) {
  return collectionItems.find((item) => item.id === itemId);
}

export function getCollectionItemsByCategory(category: CollectionCategory) {
  return collectionItems
    .filter((item) => item.category === category)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name));
}

export function getStarterCollectionItems() {
  return collectionItems.filter((item) => item.unlockSource === "starter");
}

function outfit(
  id: string,
  name: string,
  description: string,
  unlockSource: CollectionItem["unlockSource"],
  previewValue: string,
  sortOrder: number,
  allowedVocations?: CollectionItem["allowedVocations"],
  unlockRequirementText?: string,
): CollectionItem {
  return item(id, "outfit", name, description, unlockSource, previewValue, sortOrder, allowedVocations, unlockRequirementText);
}

function mount(
  id: string,
  name: string,
  description: string,
  unlockSource: CollectionItem["unlockSource"],
  previewValue: string,
  sortOrder: number,
  unlockRequirementText?: string,
): CollectionItem {
  return item(id, "mount", name, description, unlockSource, previewValue, sortOrder, undefined, unlockRequirementText);
}

function avatar(
  id: string,
  name: string,
  description: string,
  unlockSource: CollectionItem["unlockSource"],
  previewValue: string,
  sortOrder: number,
  allowedVocations?: CollectionItem["allowedVocations"],
  unlockRequirementText?: string,
): CollectionItem {
  return item(id, "avatar", name, description, unlockSource, previewValue, sortOrder, allowedVocations, unlockRequirementText);
}

function item(
  id: string,
  category: CollectionCategory,
  name: string,
  description: string,
  unlockSource: CollectionItem["unlockSource"],
  previewValue: string,
  sortOrder: number,
  allowedVocations?: CollectionItem["allowedVocations"],
  unlockRequirementText?: string,
): CollectionItem {
  return {
    id,
    category,
    name,
    description,
    rarity: unlockSource === "starter" ? "common" : unlockSource === "store_placeholder" ? "epic" : "uncommon",
    unlockSource,
    previewType: "badge",
    previewValue,
    allowedVocations,
    unlockRequirementText,
    sortOrder,
  };
}
