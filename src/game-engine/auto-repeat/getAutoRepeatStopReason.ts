import { formatAutoRepeatStopReason } from "./stopAutoRepeat";
import type { AutoRepeatStopReason } from "../../shared/types";

export function getAutoRepeatStopReason(reason?: AutoRepeatStopReason) {
  return reason ? formatAutoRepeatStopReason(reason) : "unknown";
}
