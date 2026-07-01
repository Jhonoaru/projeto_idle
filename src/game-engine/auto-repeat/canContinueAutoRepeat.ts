import { checkHuntSupplies } from "../supplies/checkHuntSupplies";
import { MAX_AUTO_REPEAT_RUNS } from "./constants";
import type {
  AutoRepeatStopReason,
  Character,
  Guild,
  GuildDepot,
  HuntArea,
  HuntAutoRepeatConfig,
} from "../../shared/types";

export function canContinueAutoRepeat(
  character: Character,
  hunt: HuntArea | undefined,
  _guild: Guild,
  _depot: GuildDepot,
  config: HuntAutoRepeatConfig | undefined,
  durationMinutes: number,
): { canContinue: boolean; reason?: AutoRepeatStopReason; message: string } {
  if (!config?.enabled) {
    return { canContinue: false, reason: "manual_stop", message: "Auto-repeat disabled." };
  }

  if (!hunt) {
    return { canContinue: false, reason: "invalid_hunt", message: "Auto-repeat stopped: invalid hunt." };
  }

  if (!["repeat_count", "until_supplies_end", "until_capacity_full", "until_death_or_stop"].includes(config.mode)) {
    return { canContinue: false, reason: "invalid_hunt", message: "Auto-repeat stopped: invalid mode." };
  }

  if (character.status === "dead") {
    return { canContinue: false, reason: "character_dead", message: `Auto-repeat stopped: ${character.name} died.` };
  }

  if (config.stopIfDeath && character.deathState) {
    return { canContinue: false, reason: "character_dead", message: `Auto-repeat stopped: ${character.name} died.` };
  }

  const maxRepeats = clampMaxRepeats(config.maxRepeats);
  const completedRepeats = normalizeCompletedRepeats(config.completedRepeats);
  const effectiveCap = config.mode === "repeat_count" ? maxRepeats : MAX_AUTO_REPEAT_RUNS;
  if (completedRepeats >= effectiveCap) {
    return {
      canContinue: false,
      reason: "completed_max_repeats",
      message: "Auto-repeat stopped: max repeats completed.",
    };
  }

  const staminaLimit = normalizeOptionalNumber(config.stopIfStaminaBelowHours);
  if (staminaLimit !== undefined && character.staminaHours < staminaLimit) {
    return { canContinue: false, reason: "stamina_low", message: "Auto-repeat stopped: stamina too low." };
  }

  const capacityLimit = normalizeOptionalNumber(config.stopIfCapacityAbovePercent);
  if (capacityLimit !== undefined && character.capacityMax > 0) {
    const usedPercent = (character.capacityUsed / character.capacityMax) * 100;
    if (usedPercent >= capacityLimit) {
      return {
        canContinue: false,
        reason: "capacity_full",
        message: `Auto-repeat stopped: capacity above ${capacityLimit}%.`,
      };
    }
  }

  if (config.stopIfSuppliesMissing) {
    const supplyCheck = checkHuntSupplies(character, hunt, durationMinutes);
    if (!supplyCheck.hasRequiredSupplies) {
      const missing = supplyCheck.missingSupplies[0];
      return {
        canContinue: false,
        reason: "missing_supplies",
        message: missing
          ? `Auto-repeat stopped: missing ${missing.itemName}.`
          : "Auto-repeat stopped: missing supplies.",
      };
    }
  }

  return { canContinue: true, message: "Auto-repeat can continue." };
}

export function clampMaxRepeats(maxRepeats?: number) {
  const normalized = Number.isFinite(maxRepeats) ? Math.floor(maxRepeats as number) : 3;
  return Math.min(MAX_AUTO_REPEAT_RUNS, Math.max(1, normalized));
}

export function normalizeCompletedRepeats(completedRepeats?: number) {
  const normalized = Number.isFinite(completedRepeats)
    ? Math.floor(completedRepeats as number)
    : 0;
  return Math.max(0, normalized);
}

function normalizeOptionalNumber(value?: number) {
  return Number.isFinite(value) ? value : undefined;
}
