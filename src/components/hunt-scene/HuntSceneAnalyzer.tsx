import { calculateMonsterFocusBonuses } from "../../game-engine/monster-focus/calculateMonsterFocusBonuses";
import { calculateSupplyUsage } from "../../game-engine/supplies/calculateSupplyUsage";
import { formatDuration } from "../../shared/time";
import type { Character, HuntArea } from "../../shared/types";

interface HuntSceneAnalyzerProps {
  character: Character;
  hunt?: HuntArea;
  elapsedMs: number;
  remainingMs: number;
  totalMs: number;
  progress: number;
}

export function HuntSceneAnalyzer({
  character,
  hunt,
  elapsedMs,
  remainingMs,
  totalMs,
  progress,
}: HuntSceneAnalyzerProps) {
  const action = character.currentAction;
  const supplyValue = hunt
    ? calculateSupplyUsage(character, hunt, action?.durationMinutes ?? 0)
        .reduce((total, usage) => total + usage.valueUsed, 0)
    : 0;
  const focus = hunt ? calculateMonsterFocusBonuses(character, hunt).applied[0] : undefined;
  const rows = [
    ["Hunt", hunt?.name ?? action?.targetName ?? "Unknown"],
    ["Time", `${formatDuration(elapsedMs)} / ${formatDuration(totalMs)}`],
    ["Remaining", formatDuration(remainingMs)],
    ["Progress", `${Math.round(progress * 100)}%`],
    ["XP est.", (action?.expectedXp ?? 0).toLocaleString("en-US")],
    ["Gold est.", (action?.expectedGold ?? 0).toLocaleString("en-US")],
    ["Supplies est.", `-${supplyValue.toLocaleString("en-US")}g`],
    ["Risk", action?.risk ?? hunt?.risk ?? "safe"],
    ["Monster Focus", focus ? `${focus.monsterName} +${focus.effectivePercent}% ${focus.bonusType}` : "No active match"],
    [
      "Auto-repeat",
      action?.autoRepeat?.enabled
        ? `ON ${action.repeatIndex ?? 1}/${action.maxRepeatIndex ?? action.autoRepeat.maxRepeats ?? "?"}`
        : "Off",
    ],
  ];

  return (
    <div className="hunt-scene-analyzer">
      {rows.map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}
