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
import { getGuildLoadoutItemCompatibility } from "./buildGuildLoadoutEditorCatalog";
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
    activeAssignments: current.activeAssignments,
    procurementOrders: current.procurementOrders,
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
    guild: {
      ...guild,
      loadoutTemplates: normalizeGuildLoadoutTemplatesState({
        templates,
        activeAssignments: current.activeAssignments.filter((assignment) =>
          assignment.characterId !== characterId || assignment.templateId !== templateSlotId),
        procurementOrders: current.procurementOrders,
      }, validCharacterIds),
    },
    template: undefined,
    message: `${characterName}'s loadout template was cleared.`,
  };
}

export function assignGuildLoadoutTemplate(
  guild: Guild,
  characters: Character[],
  characterId: string,
  templateSlotId: GuildLoadoutTemplateSlotId | null,
  now = new Date(),
) {
  const validCharacters = (Array.isArray(characters) ? characters : []).filter((entry) =>
    entry && typeof entry.id === "string" && entry.id.length > 0);
  const character = validCharacters.find((entry) => entry.id === characterId);
  const current = normalizeGuildLoadoutTemplatesState(guild.loadoutTemplates, validCharacters.map((entry) => entry.id));
  if (!character) return blocked(guild, current, "Choose a valid adventurer.");
  if (!Number.isFinite(now.getTime())) return blocked(guild, current, "Loadout assignment timestamp is invalid.");
  const existing = current.activeAssignments.find((assignment) => assignment.characterId === character.id);
  if (templateSlotId === null) {
    if (!existing) return blocked(guild, current, `${character.name} has no active loadout plan.`);
    const activeTemplate = current.templates.find((entry) =>
      entry.characterId === character.id && entry.id === existing.templateId);
    return {
      success: true,
      guild: {
        ...guild,
        loadoutTemplates: normalizeGuildLoadoutTemplatesState({
          ...current,
          activeAssignments: current.activeAssignments.filter((assignment) =>
            assignment.characterId !== character.id),
        }, validCharacters.map((entry) => entry.id)),
      },
      template: undefined,
      message: `${activeTemplate?.name ?? "Loadout plan"} is no longer active for ${character.name}.`,
    };
  }
  const slot = getGuildLoadoutTemplateSlot(templateSlotId);
  const template = current.templates.find((entry) =>
    entry.characterId === character.id && entry.id === slot?.id && entry.targets.length > 0);
  if (!slot || !template) {
    return blocked(guild, current, "Only a saved loadout with at least one target can become active.");
  }
  if (existing?.templateId === slot.id) {
    return blocked(guild, current, `${template.name} is already active for ${character.name}.`);
  }
  const activeAssignments = [
    {
      characterId: character.id,
      templateId: slot.id,
      assignedAt: now.toISOString(),
    },
    ...current.activeAssignments.filter((assignment) => assignment.characterId !== character.id),
  ].sort((left, right) => left.characterId.localeCompare(right.characterId));
  return {
    success: true,
    guild: {
      ...guild,
      loadoutTemplates: normalizeGuildLoadoutTemplatesState(
        { ...current, activeAssignments },
        validCharacters.map((entry) => entry.id),
      ),
    },
    template,
    message: `${template.name} is now the active loadout plan for ${character.name}.`,
  };
}

export function saveEditedGuildLoadoutTemplate(
  guild: Guild,
  characters: Character[],
  characterId: string,
  templateSlotId: GuildLoadoutTemplateSlotId,
  name: string,
  targets: GuildLoadoutTemplateTarget[],
  now = new Date(),
) {
  const validCharacters = (Array.isArray(characters) ? characters : []).filter((entry) =>
    entry && typeof entry.id === "string" && entry.id.length > 0);
  const character = validCharacters.find((entry) => entry.id === characterId);
  const slot = getGuildLoadoutTemplateSlot(templateSlotId);
  const current = normalizeGuildLoadoutTemplatesState(guild.loadoutTemplates, validCharacters.map((entry) => entry.id));
  if (!character || !slot) return blocked(guild, current, "Choose a valid adventurer and loadout slot.");
  if (!Number.isFinite(now.getTime())) return blocked(guild, current, "Loadout template timestamp is invalid.");
  if (!Array.isArray(targets) || targets.length === 0) {
    return blocked(guild, current, "Assign at least one compatible equipment target.");
  }
  const seenSlots = new Set<string>();
  const normalizedTargets: GuildLoadoutTemplateTarget[] = [];
  for (const target of targets) {
    if (!target || typeof target !== "object" || seenSlots.has(target.slot)) {
      return blocked(guild, current, "Loadout targets contain an invalid or duplicate slot.");
    }
    seenSlots.add(target.slot);
    const item = typeof target.itemId === "string" ? items[target.itemId] : undefined;
    if (!item || item.type !== "equipment" || !item.equipmentSlot || item.equipmentSlot !== target.slot) {
      return blocked(guild, current, "Loadout target item and equipment slot do not match.");
    }
    if (getGuildLoadoutItemCompatibility(character, item).status === "incompatible") {
      return blocked(guild, current, `${item.name} is incompatible with ${character.name}.`);
    }
    normalizedTargets.push({
      slot: item.equipmentSlot,
      itemId: item.id,
      minimumTier: normalizeItemTier(target.minimumTier),
      minimumUpgradeLevel: normalizeItemUpgradeLevel(target.minimumUpgradeLevel),
    });
  }
  const loadoutTemplates = normalizeGuildLoadoutTemplatesState({
    templates: [{
      id: slot.id,
      characterId: character.id,
      name,
      targets: normalizedTargets,
      updatedAt: now.toISOString(),
    }, ...current.templates.filter((template) =>
      template.characterId !== character.id || template.id !== slot.id)],
    activeAssignments: current.activeAssignments,
    procurementOrders: current.procurementOrders,
  }, validCharacters.map((entry) => entry.id));
  const template = loadoutTemplates.templates.find((entry) =>
    entry.characterId === character.id && entry.id === slot.id);
  if (!template || template.targets.length !== normalizedTargets.length) {
    return blocked(guild, current, "Loadout targets could not be normalized safely.");
  }
  return {
    success: true,
    guild: { ...guild, loadoutTemplates },
    template,
    message: `${template.name} updated for ${character.name} with ${template.targets.length} planned target${template.targets.length === 1 ? "" : "s"}.`,
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
