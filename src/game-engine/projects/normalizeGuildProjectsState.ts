import { getGuildProject, guildProjects } from "../../data/guildProjects";
import type { GuildProjectProgress, GuildProjectsState } from "../../shared/types";

export function createDefaultGuildProjectsState(): GuildProjectsState {
  return { progress: [], totalCompleted: 0, totalInvestedGold: 0, totalDonatedMaterials: 0 };
}

export function normalizeGuildProjectsState(value: unknown): GuildProjectsState {
  if (!value || typeof value !== "object") return createDefaultGuildProjectsState();
  const candidate = value as Partial<GuildProjectsState>;
  const byProject = new Map<string, GuildProjectProgress>();
  if (Array.isArray(candidate.progress)) {
    for (const raw of candidate.progress) {
      const normalized = normalizeProgress(raw);
      if (!normalized) continue;
      const current = byProject.get(normalized.projectId);
      if (!current || normalized.completedPhases > current.completedPhases) byProject.set(normalized.projectId, normalized);
    }
  }
  const progress = guildProjects.flatMap((project) => {
    const entry = byProject.get(project.id);
    return entry && entry.completedPhases > 0 ? [entry] : [];
  });
  return {
    progress,
    totalCompleted: progress.filter((entry) => entry.completedAt).length,
    totalInvestedGold: normalizeInteger(candidate.totalInvestedGold),
    totalDonatedMaterials: normalizeInteger(candidate.totalDonatedMaterials),
  };
}

function normalizeProgress(value: unknown): GuildProjectProgress | undefined {
  if (!value || typeof value !== "object") return undefined;
  const candidate = value as Partial<GuildProjectProgress>;
  const project = typeof candidate.projectId === "string" ? getGuildProject(candidate.projectId) : undefined;
  if (!project) return undefined;
  const completedPhases = Math.min(project.phases.length, normalizeInteger(candidate.completedPhases));
  const completedAt = completedPhases === project.phases.length && typeof candidate.completedAt === "string" && Number.isFinite(Date.parse(candidate.completedAt))
    ? candidate.completedAt
    : completedPhases === project.phases.length ? new Date(0).toISOString() : undefined;
  return { projectId: project.id, completedPhases, completedAt };
}

function normalizeInteger(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(parsed))) : 0;
}
