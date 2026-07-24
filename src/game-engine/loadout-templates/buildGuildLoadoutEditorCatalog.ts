import { bazaarEquipmentItemIds } from "../../data/bazaarCatalog";
import { bosses } from "../../data/bosses";
import { craftingRecipes } from "../../data/craftingRecipes";
import { hunts } from "../../data/hunts";
import { items } from "../../data/items";
import type {
  Character,
  EquipmentSlot,
  Guild,
  GuildDepot,
  InventoryItem,
  Item,
} from "../../shared/types";
import { getCraftingAvailability } from "../crafting/getCraftingAvailability";
import { canEquipItem } from "../equipment/canEquipItem";
import { armoryEquipmentSlots } from "../equipment/buildGuildArmoryAudit";

export type GuildLoadoutCatalogCompatibility = "ready" | "future" | "incompatible";
export type GuildLoadoutCatalogSourceKind = "holding" | "hunt" | "boss" | "crafting" | "bazaar";

export interface GuildLoadoutCatalogSource {
  id: string;
  kind: GuildLoadoutCatalogSourceKind;
  label: string;
  detail: string;
  availableNow: boolean;
}

export interface GuildLoadoutCatalogEntry {
  item: Item;
  slot: EquipmentSlot;
  compatibility: GuildLoadoutCatalogCompatibility;
  compatibilityLabel: string;
  sources: GuildLoadoutCatalogSource[];
}

export function buildGuildLoadoutEditorCatalog(
  guild: Guild,
  characters: Character[],
  depot: GuildDepot,
  characterId: string,
) {
  const safeCharacters = (Array.isArray(characters) ? characters : []).filter((entry) =>
    entry && typeof entry.id === "string" && entry.id.length > 0);
  const character = safeCharacters.find((entry) => entry.id === characterId);
  if (!character) return { character: undefined, entries: [] as GuildLoadoutCatalogEntry[] };
  const sourceIndex = buildSourceIndex(guild, safeCharacters, depot);
  const entries = Object.values(items)
    .filter((item): item is Item & { equipmentSlot: EquipmentSlot } =>
      item.type === "equipment" && Boolean(item.equipmentSlot) && armoryEquipmentSlots.includes(item.equipmentSlot!))
    .map((item): GuildLoadoutCatalogEntry => {
      const compatibility = getGuildLoadoutItemCompatibility(character, item);
      return {
        item,
        slot: item.equipmentSlot,
        compatibility: compatibility.status,
        compatibilityLabel: compatibility.label,
        sources: sourceIndex.get(item.id) ?? [],
      };
    })
    .sort((left, right) =>
      armoryEquipmentSlots.indexOf(left.slot) - armoryEquipmentSlots.indexOf(right.slot)
      || compatibilityPriority(left.compatibility) - compatibilityPriority(right.compatibility)
      || normalizeLevel(left.item.levelRequirement) - normalizeLevel(right.item.levelRequirement)
      || left.item.name.localeCompare(right.item.name)
      || left.item.id.localeCompare(right.item.id));
  return { character, entries };
}

export function getGuildLoadoutItemCompatibility(character: Character, item: Item) {
  if (item.type !== "equipment" || !item.equipmentSlot || !armoryEquipmentSlots.includes(item.equipmentSlot)) {
    return { status: "incompatible" as const, label: "Not equippable" };
  }
  const candidate = createCandidate(item);
  const current = canEquipItem(character, candidate);
  if (current.canEquip) return { status: "ready" as const, label: "Compatible now" };
  const requiredLevel = normalizeLevel(item.levelRequirement);
  if (requiredLevel > normalizeLevel(character.level)) {
    const future = canEquipItem({ ...character, level: requiredLevel }, candidate);
    if (future.canEquip) return { status: "future" as const, label: `Future target / Lv ${requiredLevel}` };
  }
  return {
    status: "incompatible" as const,
    label: current.reason ? capitalize(current.reason) : "Vocation incompatible",
  };
}

function buildSourceIndex(guild: Guild, characters: Character[], depot: GuildDepot) {
  const index = new Map<string, GuildLoadoutCatalogSource[]>();
  const add = (itemId: string, source: GuildLoadoutCatalogSource) => {
    const current = index.get(itemId) ?? [];
    if (!current.some((entry) => entry.id === source.id)) index.set(itemId, [...current, source]);
  };

  addHoldings(add, "Guild Depot", Array.isArray(depot?.items) ? depot.items : []);
  for (const character of characters) {
    addHoldings(add, `${character.name} / Inventory`, character.inventory);
    addHoldings(add, `${character.name} / Personal Depot`, character.characterDepot);
    addHoldings(add, `${character.name} / Equipped`, Object.values(character.equipment ?? {}));
  }

  for (const hunt of hunts) {
    const drops = new Map<string, Array<{ monster: string; chance: number }>>();
    for (const monster of hunt.monsters) {
      for (const drop of monster.lootTable) {
        if (items[drop.itemId]?.type !== "equipment") continue;
        drops.set(drop.itemId, [...(drops.get(drop.itemId) ?? []), {
          monster: monster.name,
          chance: normalizeChance(drop.chance),
        }]);
      }
    }
    for (const [itemId, entries] of drops) {
      add(itemId, {
        id: `hunt-${hunt.id}-${itemId}`,
        kind: "hunt",
        label: hunt.name,
        detail: `${[...new Set(entries.map((entry) => entry.monster))].join(", ")} / ${formatChance(Math.max(...entries.map((entry) => entry.chance)))}`,
        availableNow: characters.some((entry) => entry.status === "idle"
          && !entry.currentAction
          && normalizeLevel(entry.level) >= hunt.minLevel
          && (!hunt.requiredAccess || entry.accessIds?.includes(hunt.requiredAccess))),
      });
    }
  }

  for (const boss of bosses) {
    for (const drop of boss.reward.lootTable) {
      if (items[drop.itemId]?.type !== "equipment") continue;
      add(drop.itemId, {
        id: `boss-${boss.id}-${drop.itemId}`,
        kind: "boss",
        label: boss.name,
        detail: `${boss.city} / ${formatChance(normalizeChance(drop.chance))} / Entry ${normalizeLevel(boss.entryCost).toLocaleString("en-US")}g`,
        availableNow: normalizeLevel(guild.gold) >= normalizeLevel(boss.entryCost)
          && characters.some((entry) => entry.status === "idle"
            && !entry.currentAction
            && normalizeLevel(entry.level) >= boss.requirements.requiredLevel
            && (boss.requirements.requiredAccessIds ?? []).every((id) => entry.accessIds?.includes(id))
            && (boss.requirements.requiredQuestIds ?? []).every((id) => entry.completedQuestIds?.includes(id))
            && (!boss.requirements.requiredVocations || boss.requirements.requiredVocations.includes(entry.vocation))),
      });
    }
  }

  for (const recipe of craftingRecipes) {
    if (items[recipe.outputItemId]?.type !== "equipment") continue;
    const availability = getCraftingAvailability(guild, depot, recipe.id);
    add(recipe.outputItemId, {
      id: `crafting-${recipe.id}`,
      kind: "crafting",
      label: recipe.name,
      detail: `Workshop Rank ${recipe.requiredWorkshopRank} / ${normalizeLevel(recipe.goldCost).toLocaleString("en-US")}g`,
      availableNow: availability.available,
    });
  }

  const currentOffers = new Map(
    (Array.isArray(guild.bazaar?.offers) ? guild.bazaar.offers : [])
      .filter((offer) => offer && typeof offer.itemId === "string")
      .map((offer) => [offer.itemId, offer]),
  );
  for (const itemId of bazaarEquipmentItemIds) {
    const offer = currentOffers.get(itemId);
    add(itemId, {
      id: `bazaar-${itemId}`,
      kind: "bazaar",
      label: offer ? "Current Bazaar Rotation" : "Offline Bazaar Rotation",
      detail: offer
        ? `${normalizeLevel(offer.price).toLocaleString("en-US")}g / ${offer.purchasedAt ? "Already purchased" : "Available now"}`
        : "Eligible for a deterministic 10-minute rotation",
      availableNow: Boolean(offer && !offer.purchasedAt),
    });
  }

  for (const [itemId, sources] of index) {
    index.set(itemId, sources.sort((left, right) =>
      Number(right.availableNow) - Number(left.availableNow)
      || sourcePriority(left.kind) - sourcePriority(right.kind)
      || left.label.localeCompare(right.label)
      || left.id.localeCompare(right.id)));
  }
  return index;
}

function addHoldings(
  add: (itemId: string, source: GuildLoadoutCatalogSource) => void,
  label: string,
  entries: Array<InventoryItem | undefined> | undefined,
) {
  const quantities = new Map<string, number>();
  for (const entry of Array.isArray(entries) ? entries : []) {
    const definition = entry && typeof entry.itemId === "string" ? items[entry.itemId] : undefined;
    const quantity = normalizeQuantity(entry?.quantity);
    if (!entry || !definition || definition.type !== "equipment" || entry.item?.id !== definition.id || quantity <= 0) continue;
    quantities.set(definition.id, (quantities.get(definition.id) ?? 0) + quantity);
  }
  for (const [itemId, quantity] of quantities) {
    add(itemId, {
      id: `holding-${label}-${itemId}`,
      kind: "holding",
      label,
      detail: `${quantity} valid ${quantity === 1 ? "copy" : "copies"}`,
      availableNow: true,
    });
  }
}

function createCandidate(item: Item): InventoryItem {
  return { id: `loadout-editor-${item.id}`, itemId: item.id, item, quantity: 1, location: "guildDepot" };
}

function compatibilityPriority(value: GuildLoadoutCatalogCompatibility) {
  return value === "ready" ? 0 : value === "future" ? 1 : 2;
}

function sourcePriority(value: GuildLoadoutCatalogSourceKind) {
  if (value === "holding") return 0;
  if (value === "crafting") return 1;
  if (value === "hunt") return 2;
  if (value === "boss") return 3;
  return 4;
}

function normalizeLevel(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, Math.floor(parsed))) : 0;
}

function normalizeQuantity(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 0;
}

function normalizeChance(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.min(1, parsed)) : 0;
}

function formatChance(value: number) {
  const percent = value * 100;
  return `${percent.toFixed(percent < 1 ? 1 : 0)}% drop`;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
