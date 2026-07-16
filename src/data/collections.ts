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
  outfit("outfit-guild-cartographer", "Guild Cartographer", "A practical map keeper's coat earned by completing the Cartographers' Archive.", "achievement", "GC", 140, undefined, "Complete the Cartographers' Archive guild project."),
  outfit("outfit-noble-adventurer", "Noble Adventurer", "A polished formal style planned for a future cosmetic store.", "store_placeholder", "NA", 900, undefined, "Future store placeholder. No purchase is available."),

  mount("mount-none", "No Mount", "Travel on foot.", "starter", "-", 10),
  mount("mount-old-mule", "Old Mule", "A stubborn mule used by practical caravans.", "starter", "Mule", 20),
  mount("mount-brown-pony", "Brown Pony", "A steady pony for local roads.", "starter", "Pony", 30),
  mount("mount-forest-stag", "Forest Stag", "A quiet stag from elder woodland paths.", "achievement", "Stag", 110, "Future achievement unlock."),
  mount("mount-cave-boar", "Cave Boar", "A compact beast with more courage than grace.", "bestiary", "Boar", 120, "Future Bestiary unlock."),
  mount("mount-ash-wolf", "Ash Wolf", "A smoke-gray wolf mount planned for future events.", "event_placeholder", "Wolf", 130, "Future event placeholder."),
  mount("mount-merchant-cart", "Merchant Cart", "A small cart for showing guild prosperity.", "store_placeholder", "Cart", 900, "Future store placeholder. No purchase is available."),

  avatar("avatar-recruit-emblem", "Recruit Emblem", "A simple badge for new adventurers.", "starter", "R", 10),
  avatar("avatar-sword-emblem", "Sword Emblem", "A blade mark for martial characters.", "starter", "S", 20, ["Guardian"]),
  avatar("avatar-shield-emblem", "Shield Emblem", "A sturdy shield mark.", "starter", "SH", 30, ["Guardian"]),
  avatar("avatar-bow-emblem", "Bow Emblem", "A clean range mark.", "starter", "B", 40, ["Ranger"]),
  avatar("avatar-arcane-emblem", "Arcane Emblem", "A small star-shaped spell mark.", "starter", "A", 50, ["Arcanist", "Warden"]),
  avatar("avatar-monk-emblem", "Monk Emblem", "A calm hand mark.", "starter", "M", 60, ["Monk"]),
  avatar("avatar-beast-hunter-sigil", "Beast Hunter Sigil", "A sigil planned for Bestiary achievements.", "bestiary", "BH", 120, undefined, "Complete a creature family in the Bestiary."),
  avatar("avatar-dungeon-victor-sigil", "Dungeon Victor Sigil", "A sigil planned for boss victories.", "boss", "DV", 130, undefined, "Defeat a dungeon boss."),
  avatar("avatar-golden-guild-sigil", "Golden Guild Sigil", "A bright guild mark planned for future achievements.", "achievement", "GG", 140, undefined, "Future guild achievement unlock."),
  avatar("avatar-quartermaster-seal", "Quartermaster Seal", "A supply station seal earned through permanent guild work.", "achievement", "QS", 145, undefined, "Complete the Field Supply Station guild project."),
  avatar("avatar-founders-mark", "Founders' Mark", "A restrained memorial mark for a guild with lasting local works.", "achievement", "FM", 146, undefined, "Complete the Founders' Monument guild project."),
  avatar("avatar-ancient-rune-sigil", "Ancient Rune Sigil", "A rune mark planned for future events.", "event_placeholder", "AR", 150, undefined, "Future event placeholder."),
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
