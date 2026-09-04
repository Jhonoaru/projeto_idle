export type HuntActorMotionPhase = "windup" | "striking" | "recoiling" | "recovering" | "resolved";
export type HuntCreatureMotionPhase = "spawning" | "advancing" | "striking" | "staggered" | "guarding" | "defeated";

type CreatureState = "spawning" | "alive" | "damaged" | "defeated";

const positionVectors: Record<string, { x: number; y: number }> = {
  "top-left": { x: 1, y: 1 },
  "top-right": { x: -1, y: 1 },
  left: { x: 1, y: 0 },
  right: { x: -1, y: 0 },
  "bottom-left": { x: 1, y: -1 },
  "bottom-right": { x: -1, y: -1 },
};

export function getHuntActorMotionPhase(attackProgress: number, resolved: boolean): HuntActorMotionPhase {
  if (resolved) return "resolved";
  const progress = normalizeProgress(attackProgress);
  if (progress < 0.16) return "windup";
  if (progress < 0.62) return "striking";
  if (progress < 0.75) return "recoiling";
  return "recovering";
}

export function getHuntCreatureMotionPhase(
  state: CreatureState,
  active: boolean,
  attackProgress: number,
): HuntCreatureMotionPhase {
  if (state === "spawning") return "spawning";
  if (state === "defeated") return "defeated";
  if (!active) return state === "damaged" ? "staggered" : "guarding";

  const actorPhase = getHuntActorMotionPhase(attackProgress, false);
  if (actorPhase === "windup") return "advancing";
  if (actorPhase === "striking") return "staggered";
  if (actorPhase === "recoiling") return "striking";
  return "guarding";
}

export function getHuntMotionVector(position?: string, perspective: "actor" | "creature" = "creature") {
  const vector = positionVectors[position ?? ""] ?? { x: 0, y: 0 };
  return perspective === "actor" ? { x: -vector.x, y: -vector.y } : vector;
}

function normalizeProgress(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}
