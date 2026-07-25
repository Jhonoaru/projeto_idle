import { guildLoadoutTemplateSlots, getGuildLoadoutTemplateSlot } from "../../data/guildLoadoutTemplates";
import { items } from "../../data/items";
import type {
  EquipmentSlot,
  GuildLoadoutActiveAssignment,
  GuildLoadoutFulfillmentRecord,
  GuildLoadoutProcurementOrder,
  GuildLoadoutProcurementReservation,
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
  if (!value || typeof value !== "object") {
    return {
      templates: [],
      activeAssignments: [],
      procurementOrders: [],
      procurementReservations: [],
      procurementAlerts: { notifiedReadyKeys: [], unreadReadyKeys: [] },
      fulfillmentHistory: [],
    };
  }
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
  const assignmentKeys = new Set(activeAssignments.map((assignment) =>
    `${assignment.characterId}:${assignment.templateId}`));
  const targetKeys = new Set(templates.flatMap((template) =>
    template.targets.map((target) =>
      `${template.characterId}:${template.id}:${target.slot}:${target.itemId}`)));
  const seenOrders = new Set<string>();
  const procurementOrders = (Array.isArray(candidate.procurementOrders) ? candidate.procurementOrders : [])
    .map((entry) => normalizeProcurementOrder(entry, characterIds, assignmentKeys, targetKeys))
    .filter((entry): entry is GuildLoadoutProcurementOrder => Boolean(entry))
    .filter((entry) => {
      const key = procurementOrderKey(entry);
      if (seenOrders.has(key)) return false;
      seenOrders.add(key);
      return true;
    })
    .slice(0, 5);
  const orderKeys = new Set(procurementOrders.map(procurementAlertKey));
  const reservedOrderKeys = new Set<string>();
  const reservedInventoryItemIds = new Set<string>();
  const procurementReservations = (
    Array.isArray(candidate.procurementReservations) ? candidate.procurementReservations : []
  )
    .map((entry) => normalizeProcurementReservation(entry, orderKeys))
    .filter((entry): entry is GuildLoadoutProcurementReservation => Boolean(entry))
    .filter((entry) => {
      const orderKey = procurementAlertKey(entry);
      if (
        reservedOrderKeys.has(orderKey)
        || reservedInventoryItemIds.has(entry.inventoryItemId)
      ) return false;
      reservedOrderKeys.add(orderKey);
      reservedInventoryItemIds.add(entry.inventoryItemId);
      return true;
    })
    .slice(0, 5);
  const activeOrderKeys = procurementOrders.map(procurementAlertKey);
  const notifiedReadyKeys = normalizeAlertKeys(
    candidate.procurementAlerts?.notifiedReadyKeys,
    activeOrderKeys,
  );
  const unreadReadyKeys = normalizeAlertKeys(
    candidate.procurementAlerts?.unreadReadyKeys,
    notifiedReadyKeys,
  );
  const seenFulfillmentIds = new Set<string>();
  const seenFulfillmentInventoryIds = new Set<string>();
  const fulfillmentHistory = (
    Array.isArray(candidate.fulfillmentHistory) ? candidate.fulfillmentHistory : []
  )
    .map(normalizeFulfillmentRecord)
    .filter((entry): entry is GuildLoadoutFulfillmentRecord => Boolean(entry))
    .filter((entry) => {
      if (
        seenFulfillmentIds.has(entry.id)
        || seenFulfillmentInventoryIds.has(entry.inventoryItemId)
      ) return false;
      seenFulfillmentIds.add(entry.id);
      seenFulfillmentInventoryIds.add(entry.inventoryItemId);
      return true;
    })
    .slice(-30);
  return {
    templates,
    activeAssignments,
    procurementOrders,
    procurementReservations,
    procurementAlerts: { notifiedReadyKeys, unreadReadyKeys },
    fulfillmentHistory,
  };
}

function normalizeFulfillmentRecord(value: unknown): GuildLoadoutFulfillmentRecord | undefined {
  if (!value || typeof value !== "object") return undefined;
  const candidate = value as Partial<GuildLoadoutFulfillmentRecord>;
  const id = normalizeIdentity(candidate.id, 120);
  const characterId = normalizeIdentity(candidate.characterId, 80);
  const characterName = normalizeHistoricalName(candidate.characterName, 40);
  const template = getGuildLoadoutTemplateSlot(candidate.templateId);
  const templateName = normalizeHistoricalName(candidate.templateName, 40);
  const slot = armoryEquipmentSlots.includes(candidate.slot as EquipmentSlot)
    ? candidate.slot as EquipmentSlot
    : undefined;
  const itemId = normalizeIdentity(candidate.itemId, 80);
  const item = items[itemId];
  const itemName = normalizeHistoricalName(candidate.itemName, 60);
  const inventoryItemId = normalizeIdentity(candidate.inventoryItemId, 140);
  const fulfilledAt = normalizeValidTimestamp(candidate.fulfilledAt);
  if (
    !id
    || !characterId
    || !characterName
    || !template
    || !templateName
    || !slot
    || !item
    || item.type !== "equipment"
    || item.equipmentSlot !== slot
    || !itemName
    || !inventoryItemId
    || !fulfilledAt
  ) return undefined;
  const previousItemId = normalizeIdentity(candidate.previousItemId, 80);
  const previousCatalogItem = previousItemId ? items[previousItemId] : undefined;
  const previousItemName = normalizeHistoricalName(candidate.previousItemName, 60);
  return {
    id,
    characterId,
    characterName,
    templateId: template.id,
    templateName,
    slot,
    itemId,
    itemName,
    inventoryItemId,
    previousItemId: previousCatalogItem?.type === "equipment"
      && previousCatalogItem.equipmentSlot === slot
      && previousItemName
      ? previousItemId
      : undefined,
    previousItemName: previousCatalogItem?.type === "equipment"
      && previousCatalogItem.equipmentSlot === slot
      && previousItemName
      ? previousItemName
      : undefined,
    fulfilledAt,
  } satisfies GuildLoadoutFulfillmentRecord;
}

function normalizeProcurementReservation(
  value: unknown,
  orderKeys: Set<string>,
) {
  if (!value || typeof value !== "object") return undefined;
  const candidate = value as Partial<GuildLoadoutProcurementReservation>;
  const characterId = typeof candidate.characterId === "string" ? candidate.characterId.trim() : "";
  const template = getGuildLoadoutTemplateSlot(candidate.templateId);
  const slot = armoryEquipmentSlots.includes(candidate.slot as EquipmentSlot)
    ? candidate.slot as EquipmentSlot
    : undefined;
  const itemId = typeof candidate.itemId === "string" ? candidate.itemId : "";
  const inventoryItemId = typeof candidate.inventoryItemId === "string"
    ? candidate.inventoryItemId.trim()
    : "";
  if (!characterId || !template || !slot || !itemId || !inventoryItemId) return undefined;
  const reservation = {
    characterId,
    templateId: template.id,
    slot,
    itemId,
    inventoryItemId,
    reservedAt: normalizeTimestamp(candidate.reservedAt),
  } satisfies GuildLoadoutProcurementReservation;
  return orderKeys.has(procurementAlertKey(reservation)) ? reservation : undefined;
}

function normalizeProcurementOrder(
  value: unknown,
  validCharacterIds: Set<string> | undefined,
  assignmentKeys: Set<string>,
  targetKeys: Set<string>,
) {
  if (!value || typeof value !== "object") return undefined;
  const candidate = value as Partial<GuildLoadoutProcurementOrder>;
  const characterId = typeof candidate.characterId === "string" ? candidate.characterId.trim() : "";
  const template = getGuildLoadoutTemplateSlot(candidate.templateId);
  const slot = armoryEquipmentSlots.includes(candidate.slot as EquipmentSlot)
    ? candidate.slot as EquipmentSlot
    : undefined;
  const itemId = typeof candidate.itemId === "string" ? candidate.itemId : "";
  if (
    !characterId
    || !template
    || !slot
    || (validCharacterIds && !validCharacterIds.has(characterId))
    || !assignmentKeys.has(`${characterId}:${template.id}`)
    || !targetKeys.has(`${characterId}:${template.id}:${slot}:${itemId}`)
  ) return undefined;
  return {
    characterId,
    templateId: template.id,
    slot,
    itemId,
    queuedAt: normalizeTimestamp(candidate.queuedAt),
  } satisfies GuildLoadoutProcurementOrder;
}

function procurementOrderKey(order: Pick<GuildLoadoutProcurementOrder, "characterId" | "templateId" | "slot">) {
  return `${order.characterId}:${order.templateId}:${order.slot}`;
}

function procurementAlertKey(
  order: Pick<GuildLoadoutProcurementOrder, "characterId" | "templateId" | "slot" | "itemId">,
) {
  return `${order.characterId}:${order.templateId}:${order.slot}:${order.itemId}`;
}

function normalizeAlertKeys(value: unknown, allowedKeys: string[]) {
  if (!Array.isArray(value)) return [];
  const keys: string[] = [];
  for (const entry of value) {
    if (
      typeof entry !== "string"
      || !allowedKeys.includes(entry)
      || keys.includes(entry)
    ) continue;
    keys.push(entry);
    if (keys.length === 5) break;
  }
  return keys;
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

function normalizeHistoricalName(value: unknown, limit: number) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, limit);
}

function normalizeIdentity(value: unknown, limit: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, limit);
}

function normalizeValidTimestamp(value: unknown) {
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) return undefined;
  return new Date(value).toISOString();
}

function normalizeTimestamp(value: unknown) {
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) return new Date(0).toISOString();
  return new Date(value).toISOString();
}

function templateSlotIndex(id: GuildLoadoutTemplate["id"]) {
  return guildLoadoutTemplateSlots.findIndex((slot) => slot.id === id);
}
