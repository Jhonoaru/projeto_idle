import { getGuildLoadoutTemplateSlot } from "../../data/guildLoadoutTemplates";
import { items } from "../../data/items";
import type {
  Character,
  Guild,
  GuildLoadoutTemplateSlotId,
  GuildLoadoutTemplateTarget,
} from "../../shared/types";
import { armoryEquipmentSlots } from "../equipment/buildGuildArmoryAudit";
import { normalizeItemTier, normalizeItemUpgradeLevel } from "../items/getItemVisualIdentity";
import { normalizeGuildLoadoutTemplatesState } from "./normalizeGuildLoadoutTemplatesState";

export function saveGuildLoadoutTemplate(
  guild: Guild,
  characters: Character[],
  characterId: string,
  templateSlotId: GuildLoadoutTemplateSlotId,
  name: string,
  now = new Date(),
) {
  const validCharacters = (Array.isArray(characters) ? characters : []).filter((entry) =>
    entry && typeof entry.id === "string" && entry.id.length > 0);
  const character = validCharacters.find((entry) => entry.id === characterId);
  const slot = getGuildLoadoutTemplateSlot(templateSlotId);
  const current = normalizeGuildLoadoutTemplatesState(guild.loadoutTemplates, validCharacters.map((entry) => entry.id));
  if (!character || !slot) return blocked(guild, current, "Choose a valid adventurer and loadout slot.");
  if (!Number.isFinite(now.getTime())) return blocked(guild, current, "Loadout template timestamp is invalid.");
  const targets = getGuildLoadoutCaptureTargets(character);
  if (targets.length === 0) return blocked(guild, current, `${character.name} has no valid equipment to capture.`);
  const loadoutTemplates = normalizeGuildLoadoutTemplatesState({
    templates: [
      {
        id: slot.id,
        characterId: character.id,
        name,
        targets,
        updatedAt: now.toISOString(),
      },
      ...current.templates.filter((template) =>
        template.characterId !== character.id || template.id !== slot.id),
    ],
  }, validCharacters.map((entry) => entry.id));
  const template = loadoutTemplates.templates.find((entry) =>
    entry.characterId === character.id && entry.id === slot.id)!;
  return {
    success: true,
    guild: { ...guild, loadoutTemplates },
    template,
    message: `${template.name} saved for ${character.name} with ${template.targets.length} equipment target${template.targets.length === 1 ? "" : "s"}.`,
  };
}

export function clearGuildLoadoutTemplate(
  guild: Guild,
  characters: Character[],
  characterId: string,
  templateSlotId: GuildLoadoutTemplateSlotId,
) {
  const validCharacters = (Array.isArray(characters) ? characters : []).filter((character) =>
    character && typeof character.id === "string" && character.id.length > 0);
  const validCharacterIds = validCharacters.map((character) => character.id);
  const current = normalizeGuildLoadoutTemplatesState(guild.loadoutTemplates, validCharacterIds);
  const templates = current.templates.filter((template) =>
    template.characterId !== characterId || template.id !== templateSlotId);
  if (!getGuildLoadoutTemplateSlot(templateSlotId) || templates.length === current.templates.length) {
    return blocked(guild, current, "This loadout template is already empty.");
  }
  const characterName = validCharacters.find((character) => character.id === characterId)?.name ?? "Adventurer";
  return {
    success: true,
    guild: { ...guild, loadoutTemplates: { templates } },
    template: undefined,
    message: `${characterName}'s loadout template was cleared.`,
  };
}

export function getGuildLoadoutCaptureTargets(character: Character | undefined): GuildLoadoutTemplateTarget[] {
  if (!character || !character.equipment || typeof character.equipment !== "object") return [];
  return armoryEquipmentSlots.flatMap((equipmentSlot) => {
    const equipped = character.equipment?.[equipmentSlot];
    const catalogItem = equipped && typeof equipped.itemId === "string" ? items[equipped.itemId] : undefined;
    const valid = Boolean(
      equipped
      && catalogItem
      && catalogItem.type === "equipment"
      && catalogItem.equipmentSlot === equipmentSlot
      && equipped.item?.id === catalogItem.id
      && equipped.item.type === "equipment"
      && equipped.item.equipmentSlot === equipmentSlot
      && Number.isSafeInteger(equipped.quantity)
      && equipped.quantity === 1
    );
    return valid
      ? [{
          slot: equipmentSlot,
          itemId: catalogItem!.id,
          minimumTier: normalizeItemTier(equipped!.tier),
          minimumUpgradeLevel: normalizeItemUpgradeLevel(equipped!.upgradeLevel),
        }]
      : [];
  });
}

function blocked(guild: Guild, loadoutTemplates: ReturnType<typeof normalizeGuildLoadoutTemplatesState>, message: string) {
  return { success: false, guild: { ...guild, loadoutTemplates }, template: undefined, message };
}
