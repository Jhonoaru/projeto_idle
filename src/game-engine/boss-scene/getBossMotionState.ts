export type BossMotionPhase = "guarding" | "preparing" | "lunging" | "impacting" | "recovering" | "defeated";
export type BossPartyMotionPhase = "advancing" | "striking" | "recoiling" | "recovering" | "dodging" | "guarding" | "victorious";

type BossAbilityState = "idle" | "telegraphing" | "cooldown" | "resolved";
type PartyPositioning = "mobile" | "selective" | "anchored";

interface BossMotionContext {
  cycleProgress: number;
  ready: boolean;
  abilityState: BossAbilityState;
  abilityProgressPercent?: number;
}

interface BossPartyMotionContext extends BossMotionContext {
  memberIndex: number;
  targeted: boolean;
  positioning: PartyPositioning;
}

const partyVectors = [
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 1, y: -1 },
  { x: 1, y: 1 },
  { x: 1, y: -1 },
] as const;

export function getBossMotionPhase(context: BossMotionContext): BossMotionPhase {
  if (context.ready || context.abilityState === "resolved") return "defeated";
  if (context.abilityState === "telegraphing") {
    return normalizePercent(context.abilityProgressPercent) >= 72 ? "lunging" : "preparing";
  }
  if (context.abilityState === "cooldown") return "recovering";

  const progress = normalizeProgress(context.cycleProgress);
  if (progress < 0.2) return "guarding";
  if (progress < 0.5) return "lunging";
  if (progress < 0.66) return "impacting";
  return "recovering";
}

export function getBossPartyMotionPhase(context: BossPartyMotionContext): BossPartyMotionPhase {
  if (context.ready || context.abilityState === "resolved") return "victorious";
  if (context.targeted && context.abilityState === "telegraphing") {
    return context.positioning === "anchored" ? "guarding" : "dodging";
  }

  const staggeredProgress = normalizeProgress(context.cycleProgress + normalizeIndex(context.memberIndex) * 0.13);
  if (staggeredProgress < 0.18) return "advancing";
  if (staggeredProgress < 0.52) return "striking";
  if (staggeredProgress < 0.66) return "recoiling";
  if (staggeredProgress < 0.82) return "recovering";
  return "guarding";
}

export function getBossPartyMotionVector(memberIndex: number) {
  return partyVectors[normalizeIndex(memberIndex) % partyVectors.length];
}

function normalizeProgress(value: number) {
  if (!Number.isFinite(value)) return 0;
  const wrapped = value % 1;
  return wrapped < 0 ? wrapped + 1 : wrapped;
}

function normalizePercent(value: number | undefined) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value ?? 0));
}

function normalizeIndex(value: number) {
  return Number.isInteger(value) && value >= 0 ? value : 0;
}
