import { bosses } from "../../data/bosses";
import { craftingRecipes } from "../../data/craftingRecipes";
import { hunts } from "../../data/hunts";
import { items } from "../../data/items";
import type {
  Boss,
  Character,
  CraftingRecipeDefinition,
  EquipmentSlot,
  Guild,
  GuildDepot,
  HuntArea,
  InventoryItem,
  Item,
} from "../../shared/types";
import { getCraftingAvailability } from "../crafting/getCraftingAvailability";
import { canEquipItem } from "./canEquipItem";
import { armoryEquipmentSlots, scoreEquipmentItem } from "./buildGuildArmoryAudit";

export type EquipmentAcquisitionSourceStatus = "ready" | "busy" | "locked";

interface EquipmentAcquisitionSourceBase {
  id: string;
  kind: "holding" | "hunt" | "boss" | "crafting";
  status: EquipmentAcquisitionSourceStatus;
  statusLabel: string;
}

export interface EquipmentHoldingSource extends EquipmentAcquisitionSourceBase {
  kind: "holding";
  characterId: string;
  characterName: string;
  locationLabel: string;
  quantity: number;
}

export interface EquipmentHuntSource extends EquipmentAcquisitionSourceBase {
  kind: "hunt";
  hunt: HuntArea;
  monsterNames: string[];
  dropChance: number;
  quantityRange: string;
}

export interface EquipmentBossSource extends EquipmentAcquisitionSourceBase {
  kind: "boss";
  boss: Boss;
  dropChance: number;
  quantityRange: string;
  readyCharacterNames: string[];
}

export interface EquipmentCraftingSource extends EquipmentAcquisitionSourceBase {
  kind: "crafting";
  recipe: CraftingRecipeDefinition;
  missingMaterialCount: number;
}

export type EquipmentAcquisitionSource =
  | EquipmentHoldingSource
  | EquipmentHuntSource
  | EquipmentBossSource
  | EquipmentCraftingSource;

export interface EquipmentAcquisitionTarget {
  slot: EquipmentSlot;
  item: Item;
  currentItem?: InventoryItem;
  currentScore: number;
  targetScore: number;
  delta: number;
  sources: EquipmentAcquisitionSource[];
}

export function buildEquipmentAcquisitionPlan(
  guild: Guild,
  characters: Character[],
  depot: GuildDepot,
  now = new Date(),
) {
  const safeCharacters = Array.isArray(characters) ? characters : [];
  const depotItemIds = new Set(
    (Array.isArray(depot?.items) ? depot.items : [])
      .filter((entry) => normalizeQuantity(entry?.quantity) > 0)
      .map((entry) => entry.itemId),
  );
  const sourceIndex = buildSourceIndex(guild, safeCharacters, depot, now);
  const equipmentCatalog = Object.values(items).filter((item) => item.type === "equipment" && item.equipmentSlot);
  const roster = safeCharacters.map((character) => {
    const level = normalizeInteger(character.level);
    const auditableCharacter = level === character.level ? character : { ...character, level };
    const targets = armoryEquipmentSlots.flatMap((slot) => {
      const currentItem = character.equipment?.[slot];
      const currentScore = scoreEquipmentItem(character, currentItem);
      const target = equipmentCatalog
        .filter((item) => item.equipmentSlot === slot && !depotItemIds.has(item.id))
        .map((item) => {
          const inventoryItem = createCandidate(item);
          return {
            item,
            inventoryItem,
            targetScore: scoreEquipmentItem(character, inventoryItem),
            sources: sourceIndex.get(item.id) ?? [],
          };
        })
        .filter((entry) => entry.sources.length > 0)
        .filter((entry) => canEquipItem(auditableCharacter, entry.inventoryItem).canEquip)
        .filter((entry) => entry.targetScore > currentScore)
        .sort((left, right) => right.targetScore - left.targetScore || left.item.name.localeCompare(right.item.name) || left.item.id.localeCompare(right.item.id))[0];
      return target ? [{
        slot,
        item: target.item,
        currentItem,
        currentScore,
        targetScore: target.targetScore,
        delta: target.targetScore - currentScore,
        sources: target.sources,
      }] : [];
    });

    return {
      characterId: character.id,
      name: character.name,
      vocation: character.vocation,
      level,
      status: character.status,
      targets,
      readyTargets: targets.filter((target) => target.sources.some((source) => source.status === "ready")).length,
    };
  });
  const allTargets = roster.flatMap((entry) => entry.targets);

  return {
    roster,
    summary: {
      characters: roster.length,
      charactersWithTargets: roster.filter((entry) => entry.targets.length > 0).length,
      targetSlots: allTargets.length,
      readyTargets: allTargets.filter((target) => target.sources.some((source) => source.status === "ready")).length,
      huntRoutes: allTargets.reduce((total, target) => total + target.sources.filter((source) => source.kind === "hunt").length, 0),
      bossRoutes: allTargets.reduce((total, target) => total + target.sources.filter((source) => source.kind === "boss").length, 0),
      craftingRoutes: allTargets.reduce((total, target) => total + target.sources.filter((source) => source.kind === "crafting").length, 0),
    },
  };
}

export type EquipmentAcquisitionPlan = ReturnType<typeof buildEquipmentAcquisitionPlan>;
export type CharacterEquipmentAcquisitionPlan = EquipmentAcquisitionPlan["roster"][number];

function buildSourceIndex(guild: Guild, characters: Character[], depot: GuildDepot, now: Date) {
  const index = new Map<string, EquipmentAcquisitionSource[]>();
  const add = (itemId: string, source: EquipmentAcquisitionSource) => index.set(itemId, [...(index.get(itemId) ?? []), source]);

  for (const character of characters) {
    addCharacterHoldings(add, character, "Inventory", character.inventory);
    addCharacterHoldings(add, character, "Personal Depot", character.characterDepot);
    for (const [slot, entry] of Object.entries(character.equipment ?? {})) {
      if (entry) addCharacterHoldings(add, character, `Equipped / ${slot}`, [entry]);
    }
  }

  for (const hunt of hunts) {
    const dropsByItem = new Map<string, Array<{ monsterName: string; chance: number; minimum: number; maximum: number }>>();
    for (const monster of hunt.monsters) {
      for (const drop of monster.lootTable) {
        if (items[drop.itemId]?.type !== "equipment") continue;
        dropsByItem.set(drop.itemId, [...(dropsByItem.get(drop.itemId) ?? []), {
          monsterName: monster.name,
          chance: normalizeChance(drop.chance),
          minimum: normalizeQuantity(drop.minQuantity),
          maximum: normalizeQuantity(drop.maxQuantity),
        }]);
      }
    }
    for (const [itemId, drops] of dropsByItem) {
      const route = getHuntRouteStatus(hunt, characters);
      const minimum = Math.min(...drops.map((drop) => drop.minimum));
      const maximum = Math.max(...drops.map((drop) => drop.maximum));
      add(itemId, {
        id: `hunt-${hunt.id}-${itemId}`,
        kind: "hunt",
        hunt,
        monsterNames: [...new Set(drops.map((drop) => drop.monsterName))],
        dropChance: Math.max(...drops.map((drop) => drop.chance)),
        quantityRange: minimum === maximum ? `${minimum}` : `${minimum}-${maximum}`,
        ...route,
      });
    }
  }

  for (const boss of bosses) {
    for (const drop of boss.reward.lootTable) {
      if (items[drop.itemId]?.type !== "equipment") continue;
      const route = getBossRouteStatus(boss, guild, characters, now);
      const minimum = normalizeQuantity(drop.minQuantity);
      const maximum = normalizeQuantity(drop.maxQuantity);
      add(drop.itemId, {
        id: `boss-${boss.id}-${drop.itemId}`,
        kind: "boss",
        boss,
        dropChance: normalizeChance(drop.chance),
        quantityRange: minimum === maximum ? `${minimum}` : `${minimum}-${maximum}`,
        ...route,
      });
    }
  }

  for (const recipe of craftingRecipes) {
    const output = items[recipe.outputItemId];
    if (!output || output.type !== "equipment") continue;
    const availability = getCraftingAvailability(guild, depot, recipe.id);
    add(output.id, {
      id: `crafting-${recipe.id}`,
      kind: "crafting",
      recipe,
      missingMaterialCount: availability.missingMaterials.reduce((total, entry) => total + Math.max(0, entry.quantity - entry.available), 0),
      status: availability.available ? "ready" : "locked",
      statusLabel: availability.available ? "Ready to craft" : availability.reason ?? "Requirements pending",
    });
  }

  for (const [itemId, sources] of index) {
    index.set(itemId, sources.sort((left, right) => sourcePriority(left) - sourcePriority(right) || left.id.localeCompare(right.id)));
  }
  return index;
}

function addCharacterHoldings(
  add: (itemId: string, source: EquipmentAcquisitionSource) => void,
  character: Character,
  locationLabel: string,
  entries: InventoryItem[] | undefined,
) {
  for (const entry of Array.isArray(entries) ? entries : []) {
    const quantity = normalizeQuantity(entry?.quantity);
    if (entry?.item?.type !== "equipment" || quantity <= 0) continue;
    add(entry.itemId, {
      id: `holding-${character.id}-${locationLabel}-${entry.id}`,
      kind: "holding",
      characterId: character.id,
      characterName: character.name,
      locationLabel,
      quantity,
      status: "ready",
      statusLabel: `${character.name} / ${locationLabel}`,
    });
  }
}

function getHuntRouteStatus(hunt: HuntArea, characters: Character[]) {
  const eligible = characters.filter((character) => normalizeInteger(character.level) >= hunt.minLevel
    && (!hunt.requiredAccess || (Array.isArray(character.accessIds) && character.accessIds.includes(hunt.requiredAccess))));
  const ready = eligible.filter((character) => character.status === "idle" && !character.currentAction);
  if (ready.length > 0) return { status: "ready" as const, statusLabel: `Ready: ${ready.map((entry) => entry.name).join(", ")}` };
  if (eligible.length > 0) return { status: "busy" as const, statusLabel: "Eligible adventurers are busy" };
  const hasLevel = characters.some((character) => normalizeInteger(character.level) >= hunt.minLevel);
  return { status: "locked" as const, statusLabel: hasLevel && hunt.requiredAccess ? "Access required" : `Requires level ${hunt.minLevel}` };
}

function getBossRouteStatus(boss: Boss, guild: Guild, characters: Character[], now: Date) {
  const nowMs = Number.isFinite(now.getTime()) ? now.getTime() : 0;
  const eligible = characters.filter((character) => normalizeInteger(character.level) >= boss.requirements.requiredLevel
    && (boss.requirements.requiredAccessIds ?? []).every((id) => Array.isArray(character.accessIds) && character.accessIds.includes(id))
    && (boss.requirements.requiredQuestIds ?? []).every((id) => Array.isArray(character.completedQuestIds) && character.completedQuestIds.includes(id))
    && (!boss.requirements.requiredVocations || boss.requirements.requiredVocations.includes(character.vocation))
    && !(Array.isArray(character.bossCooldowns) ? character.bossCooldowns : [])
      .some((cooldown) => cooldown.bossId === boss.id && safeDateMs(cooldown.availableAt) > nowMs));
  const ready = eligible.filter((character) => character.status === "idle" && !character.currentAction);
  const enoughGold = normalizeInteger(guild.gold) >= normalizeInteger(boss.entryCost);
  const requiredRoleCount = Object.values(boss.requirements.requiredRoles ?? {})
    .reduce((total, count) => total + normalizeInteger(count), 0);
  const requiredPartySize = Math.max(normalizeInteger(boss.requirements.minPartySize), requiredRoleCount);
  const status: EquipmentAcquisitionSourceStatus = ready.length >= requiredPartySize && enoughGold
    ? "ready" : eligible.length >= requiredPartySize ? "busy" : "locked";
  const statusLabel = !enoughGold
    ? `Requires ${normalizeInteger(boss.entryCost).toLocaleString("en-US")}g`
    : ready.length >= requiredPartySize
      ? `Ready party: ${ready.slice(0, boss.requirements.maxPartySize).map((entry) => entry.name).join(", ")}`
      : eligible.length >= requiredPartySize
        ? "Eligible adventurers are busy"
        : `Requires ${requiredPartySize} eligible adventurer(s)`;
  return { status, statusLabel, readyCharacterNames: ready.map((entry) => entry.name) };
}

function createCandidate(item: Item): InventoryItem {
  return { id: `acquisition-${item.id}`, itemId: item.id, item, quantity: 1, location: "guildDepot" };
}

function sourcePriority(source: EquipmentAcquisitionSource) {
  const status = source.status === "ready" ? 0 : source.status === "busy" ? 10 : 20;
  const kind = source.kind === "holding" ? 0 : source.kind === "crafting" ? 1 : source.kind === "hunt" ? 2 : 3;
  return status + kind;
}

function normalizeInteger(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(parsed))) : 0;
}

function normalizeQuantity(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
}

function normalizeChance(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : 0;
}

function safeDateMs(value: unknown) {
  const time = typeof value === "string" ? new Date(value).getTime() : Number.NaN;
  return Number.isFinite(time) ? time : 0;
}
