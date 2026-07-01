import { calculateOfflineCatchUp, type OfflineCatchUpMetadata } from "./calculateOfflineCatchUp";
import type { GameStateSnapshot } from "../../database/saveGameRepository";

export function applyOfflineCatchUp(
  gameState: GameStateSnapshot,
  metadata: OfflineCatchUpMetadata,
  now = new Date(),
) {
  return calculateOfflineCatchUp(gameState, metadata, now);
}
