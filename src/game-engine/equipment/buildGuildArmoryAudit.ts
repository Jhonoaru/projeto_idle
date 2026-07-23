import { calculateEnhancedItemBonuses } from "../forge/calculateEnhancedItemBonuses";
import { getItemVisualIdentity } from "../items/getItemVisualIdentity";
import { getEquipmentSetProgress } from "./calculateEquipmentSetBonuses";
import { canEquipItem } from "./canEquipItem";
import type { Character, EquipmentSlot, GuildDepot, InventoryItem } from "../../shared/types";

export const armoryEquipmentSlots: readonly EquipmentSlot[] = [
  "weapon", "offhand", "helmet", "armor", "legs", "boots", "amulet", "ring", "backpack",
];

export type GuildArmoryStatus = "upgrade" | "incomplete" | "equipped";

export function buildGuildArmoryAudit(characters: Character[], depot: GuildDepot) {
  const depotEquipment = depot.items.filter((entry) => entry.item?.type === "equipment" && entry.item.equipmentSlot);
  const roster = characters.map((character) => buildCharacterArmoryAudit(character, depotEquipment));
  return {
    roster,
    summary: {
      characters: roster.length,
      equippedSlots: roster.reduce((total, entry) => total + entry.equippedCount, 0),
      totalSlots: roster.length * armoryEquipmentSlots.length,
      missingSlots: roster.reduce((total, entry) => total + entry.missingCount, 0),
      upgradeCharacters: roster.filter((entry) => entry.recommendations.length > 0).length,
      depotEquipment: depotEquipment.reduce((total, entry) => total + normalizeQuantity(entry.quantity), 0),
      activeSetBonuses: roster.reduce((total, entry) => total + entry.activeSetBonuses, 0),
    },
  };
}

export type GuildArmoryAudit = ReturnType<typeof buildGuildArmoryAudit>;
export type CharacterArmoryAudit = GuildArmoryAudit["roster"][number];

function buildCharacterArmoryAudit(character: Character, depotEquipment: InventoryItem[]) {
  const slots = armoryEquipmentSlots.map((slot) => {
    const equipped = character.equipment?.[slot];
    const currentScore = scoreEquipmentItem(character, equipped);
    const candidates = depotEquipment
      .filter((entry) => entry.item.equipmentSlot === slot && canEquipItem(character, entry).canEquip)
      .map((entry) => ({ item: entry, score: scoreEquipmentItem(character, entry) }))
      .filter((entry) => entry.score > currentScore)
      .sort((left, right) => right.score - left.score
        || left.item.item.name.localeCompare(right.item.item.name)
        || left.item.id.localeCompare(right.item.id));
    const recommendation = candidates[0]
      ? { ...candidates[0], delta: candidates[0].score - currentScore }
      : undefined;
    return { slot, equipped, currentScore, recommendation };
  });
  const setProgress = getEquipmentSetProgress(character.equipment)
    .filter((entry) => entry.equippedPieces > 0)
    .sort((left, right) => right.equippedPieces - left.equippedPieces || left.definition.name.localeCompare(right.definition.name));
  const equippedCount = slots.filter((slot) => slot.equipped).length;
  const recommendations = slots.flatMap((slot) => slot.recommendation ? [{ slot: slot.slot, ...slot.recommendation }] : []);
  const activeSetBonuses = setProgress.reduce((total, entry) => total + entry.activeThresholds.length, 0);
  const status: GuildArmoryStatus = recommendations.length > 0 ? "upgrade" : equippedCount < slots.length ? "incomplete" : "equipped";

  return {
    characterId: character.id,
    name: character.name,
    vocation: character.vocation,
    level: normalizeInteger(character.level),
    characterStatus: character.status,
    status,
    slots,
    equippedCount,
    missingCount: slots.length - equippedCount,
    totalScore: slots.reduce((total, slot) => total + slot.currentScore, 0),
    recommendations,
    setProgress,
    activeSetBonuses,
  };
}

export function scoreEquipmentItem(character: Character, inventoryItem?: InventoryItem) {
  if (!inventoryItem?.item || inventoryItem.item.type !== "equipment") return 0;
  const bonuses = calculateEnhancedItemBonuses(inventoryItem);
  const vocationPower = character.vocation === "Ranger"
    ? bonuses.distancePower
    : character.vocation === "Arcanist" || character.vocation === "Warden"
      ? bonuses.magicPower
      : character.vocation === "Monk"
        ? bonuses.fistPower
        : bonuses.attack;
  const identity = getItemVisualIdentity(inventoryItem.item, inventoryItem);
  return Math.max(0, Math.round(
    bonuses.attack
    + vocationPower * 2
    + bonuses.defense * 1.5
    + bonuses.armor * 4
    + bonuses.healthBonus / 10
    + bonuses.manaBonus / 10
    + bonuses.capacityBonus / 20
    + bonuses.speedBonus * 5
    + bonuses.xpBonusPercent * 5
    + bonuses.supplyReductionPercent * 5
    + identity.tier * 2
    + identity.upgradeLevel,
  ));
}

function normalizeQuantity(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
}

function normalizeInteger(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
}
