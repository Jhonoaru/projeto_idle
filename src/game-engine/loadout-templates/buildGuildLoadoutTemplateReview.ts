import { items } from "../../data/items";
import type {
  Character,
  EquipmentSlot,
  GuildDepot,
  GuildLoadoutTemplate,
  GuildLoadoutTemplateTarget,
  InventoryItem,
} from "../../shared/types";
import { armoryEquipmentSlots } from "../equipment/buildGuildArmoryAudit";
import { normalizeItemTier, normalizeItemUpgradeLevel } from "../items/getItemVisualIdentity";
import { getGuildLoadoutItemCompatibility } from "./buildGuildLoadoutEditorCatalog";

export type GuildLoadoutTargetStatus =
  | "equipped"
  | "guild-depot"
  | "personal"
  | "roster"
  | "missing"
  | "incompatible";

export interface GuildLoadoutTargetReview {
  slot: EquipmentSlot;
  target?: GuildLoadoutTemplateTarget;
  item?: InventoryItem["item"];
  current?: InventoryItem;
  sourceItem?: InventoryItem;
  sourceCharacterName?: string;
  compatibilityLabel?: string;
  status: GuildLoadoutTargetStatus | "unassigned";
}

export function buildGuildLoadoutTemplateReview(
  template: GuildLoadoutTemplate | undefined,
  character: Character | undefined,
  characters: Character[],
  depot: GuildDepot,
) {
  const safeCharacters = (Array.isArray(characters) ? characters : []).filter((entry) =>
    entry && typeof entry.id === "string" && entry.id.length > 0);
  const reviews = armoryEquipmentSlots.map((slot): GuildLoadoutTargetReview => {
    const target = template?.targets.find((entry) => entry.slot === slot);
    const current = character?.equipment?.[slot];
    if (!target) return { slot, current, status: "unassigned" };
    const item = items[target.itemId];
    if (!item || item.type !== "equipment" || item.equipmentSlot !== slot || !character) {
      return { slot, target, current, item, status: "incompatible" };
    }
    const compatibility = getGuildLoadoutItemCompatibility(character, item);
    if (compatibility.status === "incompatible") {
      return { slot, target, current, item, compatibilityLabel: compatibility.label, status: "incompatible" };
    }
    if (current?.quantity === 1 && matchesTarget(current, target)) {
      return { slot, target, current, item, sourceItem: current, compatibilityLabel: compatibility.label, status: "equipped" };
    }
    const depotItem = findMatching(Array.isArray(depot?.items) ? depot.items : [], target);
    if (depotItem) return { slot, target, current, item, sourceItem: depotItem, compatibilityLabel: compatibility.label, status: "guild-depot" };
    const personalItem = findMatching([
      ...(Array.isArray(character.inventory) ? character.inventory : []),
      ...(Array.isArray(character.characterDepot) ? character.characterDepot : []),
    ], target);
    if (personalItem) return { slot, target, current, item, sourceItem: personalItem, compatibilityLabel: compatibility.label, status: "personal" };
    for (const owner of safeCharacters) {
      if (owner.id === character.id) continue;
      const sourceItem = findMatching([
        ...(Array.isArray(owner.inventory) ? owner.inventory : []),
        ...(Array.isArray(owner.characterDepot) ? owner.characterDepot : []),
        ...Object.values(owner.equipment ?? {}).filter((entry): entry is InventoryItem => Boolean(entry)),
      ], target);
      if (sourceItem) return { slot, target, current, item, sourceItem, sourceCharacterName: owner.name, compatibilityLabel: compatibility.label, status: "roster" };
    }
    return { slot, target, current, item, compatibilityLabel: compatibility.label, status: "missing" };
  });
  const assigned = reviews.filter((entry) => entry.target);
  return {
    template,
    character,
    reviews,
    summary: {
      assigned: assigned.length,
      equipped: assigned.filter((entry) => entry.status === "equipped").length,
      guildDepot: assigned.filter((entry) => entry.status === "guild-depot").length,
      personal: assigned.filter((entry) => entry.status === "personal").length,
      roster: assigned.filter((entry) => entry.status === "roster").length,
      missing: assigned.filter((entry) => entry.status === "missing" || entry.status === "incompatible").length,
    },
  };
}

function findMatching(entries: InventoryItem[], target: GuildLoadoutTemplateTarget) {
  return entries.find((entry) => matchesTarget(entry, target));
}

function matchesTarget(entry: InventoryItem | undefined, target: GuildLoadoutTemplateTarget) {
  return Boolean(
    entry
    && entry.itemId === target.itemId
    && entry.item?.id === target.itemId
    && entry.item.type === "equipment"
    && entry.item.equipmentSlot === target.slot
    && Number.isSafeInteger(entry.quantity)
    && entry.quantity > 0
    && normalizeItemTier(entry.tier) >= target.minimumTier
    && normalizeItemUpgradeLevel(entry.upgradeLevel) >= target.minimumUpgradeLevel,
  );
}
