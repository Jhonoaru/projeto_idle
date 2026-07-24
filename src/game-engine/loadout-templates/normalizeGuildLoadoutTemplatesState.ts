import { guildLoadoutTemplateSlots, getGuildLoadoutTemplateSlot } from "../../data/guildLoadoutTemplates";
import { items } from "../../data/items";
import type {
  EquipmentSlot,
  GuildLoadoutActiveAssignment,
  GuildLoadoutTemplate,
  GuildLoadoutTemplatesState,
  GuildLoadoutTemplateTarget,
} from "../../shared/types";
import { armoryEquipmentSlots } from "../equipment/buildGuildArmoryAudit";
import { normalizeItemTier, normalizeItemUpgradeLevel } from "../items/getItemVisualIdentity";

export function normalizeGuildLoadoutTemplatesState(
  value: unknown,
  validCharacterIds?: readonly string[],
): GuildLoadoutTemplatesState {
  if (!value || typeof value !== "object") return { templates: [], activeAssignments: [] };
  const candidate = value as Partial<GuildLoadoutTemplatesState>;
  const characterIds = validCharacterIds ? new Set(validCharacterIds) : undefined;
  const seen = new Set<string>();
  const templates = (Array.isArray(candidate.templates) ? candidate.templates : [])
    .map((entry) => normalizeTemplate(entry, characterIds))
    .filter((entry): entry is GuildLoadoutTemplate => Boolean(entry))
    .filter((entry) => {
      const key = `${entry.characterId}:${entry.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((left, right) =>
      left.characterId.localeCompare(right.characterId)
      || templateSlotIndex(left.id) - templateSlotIndex(right.id))
    .slice(0, 150);
  const templateKeys = new Set(
    templates
      .filter((template) => template.targets.length > 0)
      .map((template) => `${template.characterId}:${template.id}`),
  );
  const assignedCharacters = new Set<string>();
  const activeAssignments = (Array.isArray(candidate.activeAssignments) ? candidate.activeAssignments : [])
    .map((entry) => normalizeActiveAssignment(entry, characterIds, templateKeys))
    .filter((entry): entry is GuildLoadoutActiveAssignment => Boolean(entry))
    .filter((entry) => {
      if (assignedCharacters.has(entry.characterId)) return false;
      assignedCharacters.add(entry.characterId);
      return true;
    })
    .sort((left, right) => left.characterId.localeCompare(right.characterId))
    .slice(0, 50);
  return { templates, activeAssignments };
}

function normalizeActiveAssignment(
  value: unknown,
  validCharacterIds: Set<string> | undefined,
  templateKeys: Set<string>,
) {
  if (!value || typeof value !== "object") return undefined;
  const candidate = value as Partial<GuildLoadoutActiveAssignment>;
  const characterId = typeof candidate.characterId === "string" ? candidate.characterId.trim() : "";
  const template = getGuildLoadoutTemplateSlot(candidate.templateId);
  if (
    !characterId
    || !template
    || (validCharacterIds && !validCharacterIds.has(characterId))
    || !templateKeys.has(`${characterId}:${template.id}`)
  ) return undefined;
  return {
    characterId,
    templateId: template.id,
    assignedAt: normalizeTimestamp(candidate.assignedAt),
  } satisfies GuildLoadoutActiveAssignment;
}

function normalizeTemplate(value: unknown, validCharacterIds?: Set<string>) {
  if (!value || typeof value !== "object") return undefined;
  const candidate = value as Partial<GuildLoadoutTemplate>;
  const slot = getGuildLoadoutTemplateSlot(candidate.id);
  const characterId = typeof candidate.characterId === "string" ? candidate.characterId.trim() : "";
  if (!slot || !characterId || (validCharacterIds && !validCharacterIds.has(characterId))) return undefined;
  const seenSlots = new Set<EquipmentSlot>();
  const targets = (Array.isArray(candidate.targets) ? candidate.targets : [])
    .map(normalizeTarget)
    .filter((entry): entry is GuildLoadoutTemplateTarget => Boolean(entry))
    .filter((entry) => {
      if (seenSlots.has(entry.slot)) return false;
      seenSlots.add(entry.slot);
      return true;
    })
    .sort((left, right) => armoryEquipmentSlots.indexOf(left.slot) - armoryEquipmentSlots.indexOf(right.slot))
    .slice(0, armoryEquipmentSlots.length);
  return {
    id: slot.id,
    characterId,
    name: normalizeName(candidate.name, slot.name),
    targets,
    updatedAt: normalizeTimestamp(candidate.updatedAt),
  } satisfies GuildLoadoutTemplate;
}

function normalizeTarget(value: unknown): GuildLoadoutTemplateTarget | undefined {
  if (!value || typeof value !== "object") return undefined;
  const candidate = value as Partial<GuildLoadoutTemplateTarget>;
  const itemId = typeof candidate.itemId === "string" ? candidate.itemId : "";
  const item = items[itemId];
  if (!item || item.type !== "equipment" || !item.equipmentSlot || item.equipmentSlot !== candidate.slot) return undefined;
  return {
    slot: item.equipmentSlot,
    itemId,
    minimumTier: normalizeItemTier(candidate.minimumTier),
    minimumUpgradeLevel: normalizeItemUpgradeLevel(candidate.minimumUpgradeLevel),
  };
}

function normalizeName(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const clean = value.replace(/\s+/g, " ").trim().slice(0, 28);
  return clean || fallback;
}

function normalizeTimestamp(value: unknown) {
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) return new Date(0).toISOString();
  return new Date(value).toISOString();
}

function templateSlotIndex(id: GuildLoadoutTemplate["id"]) {
  return guildLoadoutTemplateSlots.findIndex((slot) => slot.id === id);
}
