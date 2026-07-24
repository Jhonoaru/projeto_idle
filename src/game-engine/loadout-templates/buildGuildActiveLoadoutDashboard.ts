import type { Character, Guild, GuildDepot } from "../../shared/types";
import { buildGuildLoadoutTemplateReview } from "./buildGuildLoadoutTemplateReview";
import { normalizeGuildLoadoutTemplatesState } from "./normalizeGuildLoadoutTemplatesState";

export type GuildActiveLoadoutStatus =
  | "inactive"
  | "ready"
  | "quartermaster"
  | "transfer"
  | "sourcing"
  | "invalid";

export function buildGuildActiveLoadoutDashboard(
  guild: Guild,
  characters: Character[],
  depot: GuildDepot,
) {
  const safeCharacters = (Array.isArray(characters) ? characters : []).filter((entry) =>
    entry && typeof entry.id === "string" && entry.id.length > 0);
  const state = normalizeGuildLoadoutTemplatesState(
    guild.loadoutTemplates,
    safeCharacters.map((character) => character.id),
  );
  const entries = safeCharacters.map((character) => {
    const assignment = state.activeAssignments.find((entry) => entry.characterId === character.id);
    const template = assignment
      ? state.templates.find((entry) =>
          entry.characterId === character.id && entry.id === assignment.templateId)
      : undefined;
    const review = buildGuildLoadoutTemplateReview(template, character, safeCharacters, depot);
    const incompatible = review.summary.invalid;
    const status: GuildActiveLoadoutStatus = !template
      ? "inactive"
      : incompatible > 0
        ? "invalid"
        : review.summary.equipped === review.summary.assigned
          ? "ready"
          : review.summary.guildDepot > 0
            ? "quartermaster"
            : review.summary.personal + review.summary.roster > 0
              ? "transfer"
              : "sourcing";
    return {
      character,
      assignment,
      template,
      review,
      status,
      incompatible,
      completionPercent: review.summary.assigned > 0
        ? Math.round((review.summary.equipped / review.summary.assigned) * 100)
        : 0,
      nextAction: getNextAction(status),
    };
  });
  const active = entries.filter((entry) => entry.template);
  return {
    state,
    entries,
    summary: {
      activePlans: active.length,
      readyPlans: active.filter((entry) => entry.status === "ready").length,
      targets: active.reduce((total, entry) => total + entry.review.summary.assigned, 0),
      equipped: active.reduce((total, entry) => total + entry.review.summary.equipped, 0),
      depotReady: active.reduce((total, entry) => total + entry.review.summary.guildDepot, 0),
      missing: active.reduce((total, entry) => total + entry.review.summary.missing, 0),
      invalid: active.reduce((total, entry) => total + entry.review.summary.invalid, 0),
    },
  };
}

function getNextAction(status: GuildActiveLoadoutStatus) {
  if (status === "ready") return "Loadout complete";
  if (status === "quartermaster") return "Review Guild Depot allocation";
  if (status === "transfer") return "Consolidate personal holdings";
  if (status === "invalid") return "Edit incompatible targets";
  if (status === "sourcing") return "Review acquisition routes";
  return "Activate a saved template";
}
