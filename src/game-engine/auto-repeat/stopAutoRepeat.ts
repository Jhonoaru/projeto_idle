import type { AutoRepeatStopReason, Character } from "../../shared/types";

export function stopAutoRepeat(character: Character, reason: AutoRepeatStopReason) {
  if (!character.currentAction?.autoRepeat) {
    return { character, logs: [`Auto-repeat stopped: ${formatAutoRepeatStopReason(reason)}.`] };
  }

  return {
    character: {
      ...character,
      currentAction: {
        ...character.currentAction,
        autoRepeat: {
          ...character.currentAction.autoRepeat,
          enabled: false,
          updatedAt: new Date().toISOString(),
        },
      },
    },
    logs: [`Auto-repeat stopped: ${formatAutoRepeatStopReason(reason)}.`],
  };
}

export function formatAutoRepeatStopReason(reason: AutoRepeatStopReason) {
  if (reason === "completed_max_repeats") return "max repeats completed";
  if (reason === "missing_supplies") return "missing supplies";
  if (reason === "capacity_full") return "capacity above limit";
  if (reason === "stamina_low") return "stamina too low";
  if (reason === "character_dead") return "character died";
  if (reason === "invalid_hunt") return "invalid hunt";
  if (reason === "manual_stop") return "manual stop";
  if (reason === "offline_cap_reached") return "offline cap reached";
  return reason;
}

