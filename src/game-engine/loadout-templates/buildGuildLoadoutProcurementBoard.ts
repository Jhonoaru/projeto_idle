import { items } from "../../data/items";
import type {
  Character,
  EquipmentSlot,
  Guild,
  GuildDepot,
  GuildLoadoutTemplateTarget,
  Item,
} from "../../shared/types";
import {
  buildGuildLoadoutEditorCatalog,
  type GuildLoadoutCatalogSource,
} from "./buildGuildLoadoutEditorCatalog";
import {
  buildGuildActiveLoadoutDashboard,
  type GuildActiveLoadoutStatus,
} from "./buildGuildActiveLoadoutDashboard";
import type { GuildLoadoutTargetStatus } from "./buildGuildLoadoutTemplateReview";

export type GuildLoadoutProcurementRouteKind =
  | "quartermaster"
  | "inventory"
  | "hunt"
  | "boss"
  | "crafting"
  | "bazaar"
  | "invalid"
  | "unknown";

export interface GuildLoadoutProcurementCandidate {
  key: string;
  kind: GuildLoadoutProcurementRouteKind;
  label: string;
  detail: string;
  availableNow: boolean;
  targetId?: string;
  actorCharacterId?: string;
}

export interface GuildLoadoutProcurementObjective {
  id: string;
  character: Character;
  templateName: string;
  slot: EquipmentSlot;
  target: GuildLoadoutTemplateTarget;
  item: Item;
  reviewStatus: GuildLoadoutTargetStatus;
  candidates: GuildLoadoutProcurementCandidate[];
  recommended: GuildLoadoutProcurementCandidate;
}

export interface GuildLoadoutProcurementRoute {
  key: string;
  kind: GuildLoadoutProcurementRouteKind;
  label: string;
  detail: string;
  availableNow: boolean;
  targetId?: string;
  actorCharacterId?: string;
  objectives: GuildLoadoutProcurementObjective[];
  characterNames: string[];
}

export function buildGuildLoadoutProcurementBoard(
  guild: Guild,
  characters: Character[],
  depot: GuildDepot,
  now = new Date(),
) {
  const seenCharacterIds = new Set<string>();
  const safeCharacters = (Array.isArray(characters) ? characters : []).filter((entry) => {
    if (!entry || typeof entry.id !== "string" || entry.id.length === 0 || seenCharacterIds.has(entry.id)) {
      return false;
    }
    seenCharacterIds.add(entry.id);
    return true;
  });
  const dashboard = buildGuildActiveLoadoutDashboard(guild, safeCharacters, depot);
  const catalogs = new Map(safeCharacters.map((character) => [
    character.id,
    buildGuildLoadoutEditorCatalog(guild, safeCharacters, depot, character.id, now),
  ]));
  const drafts = dashboard.entries.flatMap((entry) => {
    if (!entry.assignment || !entry.template) return [];
    const template = entry.template;
    const catalog = catalogs.get(entry.character.id);
    return entry.review.reviews.flatMap((review) => {
      if (!review.target || review.status === "equipped" || review.status === "unassigned") return [];
      const item = items[review.target.itemId];
      if (!item) return [];
      const candidates = buildCandidates(
        entry.character,
        review.status,
        review.sourceItem?.ownerCharacterId,
        review.sourceCharacterName,
        review.target,
        catalog?.entries.find((candidate) => candidate.item.id === item.id)?.sources ?? [],
      );
      return [{
        id: `${entry.character.id}:${template.id}:${review.target.slot}`,
        character: entry.character,
        templateName: template.name,
        slot: review.target.slot,
        target: review.target,
        item,
        reviewStatus: review.status,
        candidates,
      }];
    });
  });
  const coverage = new Map<string, number>();
  for (const draft of drafts) {
    for (const key of new Set(draft.candidates.map((candidate) => candidate.key))) {
      coverage.set(key, (coverage.get(key) ?? 0) + 1);
    }
  }
  const objectives: GuildLoadoutProcurementObjective[] = drafts.map((draft) => ({
    ...draft,
    recommended: [...draft.candidates].sort((left, right) =>
      Number(right.availableNow) - Number(left.availableNow)
      || (coverage.get(right.key) ?? 0) - (coverage.get(left.key) ?? 0)
      || routePriority(left.kind) - routePriority(right.kind)
      || left.label.localeCompare(right.label)
      || left.key.localeCompare(right.key))[0],
  })).sort((left, right) =>
    routePriority(left.recommended.kind) - routePriority(right.recommended.kind)
    || left.character.name.localeCompare(right.character.name)
    || left.slot.localeCompare(right.slot));
  const routeIndex = new Map<string, GuildLoadoutProcurementRoute>();
  for (const objective of objectives) {
    const candidate = objective.recommended;
    const existing = routeIndex.get(candidate.key);
    if (existing) {
      existing.objectives.push(objective);
      if (!existing.characterNames.includes(objective.character.name)) {
        existing.characterNames.push(objective.character.name);
      }
      continue;
    }
    routeIndex.set(candidate.key, {
      ...candidate,
      objectives: [objective],
      characterNames: [objective.character.name],
    });
  }
  const routes = [...routeIndex.values()].sort((left, right) =>
    Number(right.availableNow) - Number(left.availableNow)
    || right.objectives.length - left.objectives.length
    || routePriority(left.kind) - routePriority(right.kind)
    || left.label.localeCompare(right.label)
    || left.key.localeCompare(right.key));
  const activeEntries = dashboard.entries.filter((entry) => entry.template);
  return {
    objectives,
    routes,
    dashboard,
    summary: {
      activePlans: dashboard.summary.activePlans,
      totalTargets: dashboard.summary.targets,
      equippedTargets: dashboard.summary.equipped,
      pendingTargets: objectives.length,
      operations: routes.length,
      readyOperations: routes.filter((route) => route.availableNow && isActionable(route.kind)).length,
      invalidTargets: objectives.filter((objective) => objective.reviewStatus === "incompatible").length,
      completePlans: activeEntries.filter((entry) => entry.status === "ready").length,
      blockedPlans: activeEntries.filter((entry) =>
        isBlockedStatus(entry.status)).length,
    },
  };
}

function buildCandidates(
  character: Character,
  status: GuildLoadoutTargetStatus,
  sourceOwnerId: string | undefined,
  sourceCharacterName: string | undefined,
  target: GuildLoadoutTemplateTarget,
  sources: GuildLoadoutCatalogSource[],
): GuildLoadoutProcurementCandidate[] {
  if (status === "incompatible") {
    return [{
      key: `invalid:${character.id}`,
      kind: "invalid",
      label: `${character.name} Loadout`,
      detail: "Edit the incompatible target before procurement.",
      availableNow: false,
      targetId: character.id,
    }];
  }
  if (status === "guild-depot") {
    return [{
      key: "quartermaster:guild-depot",
      kind: "quartermaster",
      label: "Guild Depot Allocation",
      detail: "An exact target copy is ready for Quartermaster review.",
      availableNow: true,
      targetId: character.id,
    }];
  }
  if (status === "personal" || status === "roster") {
    const ownerId = sourceOwnerId || character.id;
    return [{
      key: `inventory:${ownerId}`,
      kind: "inventory",
      label: `${sourceCharacterName ?? character.name} Holdings`,
      detail: status === "roster"
        ? `Review the copy held by ${sourceCharacterName ?? "another adventurer"}.`
        : "Review the exact target copy in personal holdings.",
      availableNow: true,
      targetId: ownerId,
    }];
  }
  const forgeSuffix = target.minimumTier > 0 || target.minimumUpgradeLevel > 0
    ? ` / then Forge to T${target.minimumTier} +${target.minimumUpgradeLevel}`
    : "";
  const candidates = sources.flatMap((source): GuildLoadoutProcurementCandidate[] => {
    if (source.kind === "holding") return [];
    return [{
      key: `${source.kind}:${source.targetId ?? source.label}`,
      kind: source.kind,
      label: source.label,
      detail: `${source.detail}${forgeSuffix}`,
      availableNow: source.availableNow,
      targetId: source.targetId,
      actorCharacterId: source.actorCharacterId,
    }];
  });
  return candidates.length > 0 ? candidates : [{
    key: `unknown:${target.itemId}`,
    kind: "unknown",
    label: "No Known Route",
    detail: `${items[target.itemId]?.name ?? "This item"} has no registered acquisition source.`,
    availableNow: false,
  }];
}

function routePriority(kind: GuildLoadoutProcurementRouteKind) {
  if (kind === "quartermaster") return 0;
  if (kind === "inventory") return 1;
  if (kind === "crafting") return 2;
  if (kind === "hunt") return 3;
  if (kind === "boss") return 4;
  if (kind === "bazaar") return 5;
  if (kind === "invalid") return 6;
  return 7;
}

function isActionable(kind: GuildLoadoutProcurementRouteKind) {
  return kind !== "invalid" && kind !== "unknown";
}

function isBlockedStatus(status: GuildActiveLoadoutStatus) {
  return status === "invalid" || status === "sourcing";
}
