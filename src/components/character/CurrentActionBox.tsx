import { useEffect, useState } from "react";
import { getTravelRemainingMs } from "../../game-services/actionService";
import { CHARACTER_STATUS_LABELS, SKILL_LABELS } from "../../shared/constants";
import {
  formatDuration,
  formatDurationFromMinutes,
  getClockElapsedMs,
  getClockRemainingMs,
} from "../../shared/time";
import type { Character } from "../../shared/types";

interface CurrentActionBoxProps {
  character: Character;
  onCancelAction?: () => void;
  onFinishTravel?: () => void;
}

export function CurrentActionBox({
  character,
  onCancelAction,
  onFinishTravel,
}: CurrentActionBoxProps) {
  const action = character.currentAction;
  const totalMs = Math.max(1, (action?.durationMinutes ?? 0) * 60_000);
  const isReadyToResolve = action?.readyToResolve === true;
  const [remainingMs, setRemainingMs] = useState(
    isReadyToResolve ? 0 : getTravelRemainingMs(character),
  );
  const [elapsedMs, setElapsedMs] = useState(
    action ? (isReadyToResolve ? totalMs : getClockElapsedMs(action.startedAt)) : 0,
  );

  useEffect(() => {
    if (!action) return undefined;

    setElapsedMs(isReadyToResolve ? totalMs : getClockElapsedMs(action.startedAt));
    setRemainingMs(
      isReadyToResolve
        ? 0
        : character.status === "traveling"
        ? getTravelRemainingMs(character)
        : getClockRemainingMs(action.endsAt),
    );
    const interval = window.setInterval(() => {
      setElapsedMs(isReadyToResolve ? totalMs : getClockElapsedMs(action.startedAt));
      setRemainingMs(
        isReadyToResolve
          ? 0
          : character.status === "traveling"
          ? getTravelRemainingMs(character)
          : getClockRemainingMs(action.endsAt),
      );
    }, 1000);

    return () => window.clearInterval(interval);
  }, [action, character, isReadyToResolve, totalMs]);

  if (!action) {
    return (
      <div className="current-action-box is-idle">
        <div>
          <span>Idle</span>
          <strong>No active action</strong>
        </div>
        <p>{character.name} is waiting for a new assignment.</p>
      </div>
    );
  }

  return (
    <div className="current-action-box is-active">
      <div className="action-heading">
        <span>{CHARACTER_STATUS_LABELS[action.type]}</span>
        <strong>{action.label}</strong>
      </div>
      {isReadyToResolve ? (
        <div className="offline-ready-badge">
          Concluido offline - pronto para coletar
        </div>
      ) : null}
      {action.autoRepeat?.enabled ? (
        <div className="auto-repeat-status">
          <span>Auto-repeat ON</span>
          <strong>
            Run {action.repeatIndex ?? 1} / {action.maxRepeatIndex ?? action.autoRepeat.maxRepeats ?? "?"}
          </strong>
          <p>
            Mode: {formatAutoRepeatMode(action.autoRepeat.mode)} / Stop capacity:
            {" "}{action.autoRepeat.stopIfCapacityAbovePercent ?? "-"}% / Stamina:
            {" "}{action.autoRepeat.stopIfStaminaBelowHours ?? "-"}h
          </p>
        </div>
      ) : null}

      <div className="action-grid">
        {action.targetName ? <Detail label="Target" value={action.targetName} /> : null}
        <Detail label="Started" value={action.startedAt} />
        <Detail label="Ends" value={action.endsAt} />
        <Detail label="Active" value={formatDuration(elapsedMs)} />
        <Detail label="Remaining" value={formatDuration(remainingMs)} />
        {isReadyToResolve ? <Detail label="Progress" value="100%" /> : null}
        {action.durationMinutes ? (
          <Detail label="Duration" value={formatDurationFromMinutes(action.durationMinutes)} />
        ) : null}
        {action.trainingType ? <Detail label="Training" value={action.trainingType} /> : null}
        {action.targetSkill ? (
          <Detail label="Skill" value={SKILL_LABELS[action.targetSkill]} />
        ) : null}
        {action.cost ? (
          <Detail label="Cost" value={`${action.cost.toLocaleString("en-US")}g`} />
        ) : null}
        {action.expectedGainPercent ? (
          <Detail label="Expected Gain" value={`+${action.expectedGainPercent}%`} />
        ) : null}
        {action.risk ? <Detail label="Risk" value={action.risk} /> : null}
        {action.expectedXp ? (
          <Detail label="Expected XP" value={action.expectedXp.toLocaleString("en-US")} />
        ) : null}
        {action.expectedGold ? (
          <Detail label="Expected Gold" value={action.expectedGold.toLocaleString("en-US")} />
        ) : null}
      </div>

      {["hunting", "training", "questing", "bossing"].includes(character.status) &&
      onCancelAction &&
      !isReadyToResolve ? (
        <button className="action-command-button" onClick={onCancelAction} type="button">
          Cancelar e Retornar
        </button>
      ) : null}

      {character.status === "traveling" && onFinishTravel ? (
        <button className="action-command-button" onClick={onFinishTravel} type="button">
          Finalizar Viagem
        </button>
      ) : null}
    </div>
  );
}

function formatAutoRepeatMode(mode: string) {
  if (mode === "repeat_count") return "Repeat count";
  if (mode === "until_supplies_end") return "Until supplies end";
  if (mode === "until_capacity_full") return "Until capacity limit";
  if (mode === "until_death_or_stop") return "Until death/stop";
  return "Off";
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
