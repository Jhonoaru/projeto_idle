import type { calculateMissingSuppliesForPreset } from "../../game-engine/hunt-prep/calculateMissingSuppliesForPreset";

export type ReturnTypeHack = ReturnType<typeof calculateMissingSuppliesForPreset>[number];
