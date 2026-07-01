import { useEffect, useState } from "react";
import { canReviveCharacter } from "../../game-engine/death/reviveCharacter";
import { formatDuration } from "../../shared/time";
import type { Character } from "../../shared/types";

interface DeathPanelProps {
  character: Character;
  onRevive: () => void;
}

export function DeathPanel({ character, onRevive }: DeathPanelProps) {
  const [tick, setTick] = useState(0);
  const deathState = character.deathState;

  useEffect(() => {
    if (!deathState) return undefined;

    const interval = window.setInterval(() => setTick((current) => current + 1), 1000);

    return () => window.clearInterval(interval);
  }, [deathState]);

  if (!deathState) return null;

  const now = Date.now() + tick * 0;
  const recoveryEndsAt = deathState.recoveryEndsAt
    ? new Date(deathState.recoveryEndsAt).getTime()
    : now;
  const diedAt = new Date(deathState.diedAt).getTime();
  const remainingMs = Math.max(0, recoveryEndsAt - now);
  const canRevive = canReviveCharacter(character, now);

  return (
    <div className="death-panel">
      <div className="death-panel-heading">
        <span>Death Report</span>
        <strong>Morto</strong>
      </div>

      <div className="death-grid">
        <DeathStat label="Causa" value={formatCause(deathState.cause)} />
        <DeathStat label="Local" value={deathState.sourceName ?? "Desconhecido"} />
        <DeathStat label="Templo" value={deathState.templeName} />
        <DeathStat label="Desde a morte" value={formatDuration(Math.max(0, now - diedAt))} />
        <DeathStat
          label="Recovery"
          value={remainingMs > 0 ? formatDuration(remainingMs) : "Disponivel"}
        />
        <DeathStat
          label="XP perdida"
          value={deathState.penalty.experienceLost.toLocaleString("en-US")}
        />
        <DeathStat
          label="Gold perdido"
          value={`${deathState.penalty.goldLost.toLocaleString("en-US")}g`}
        />
        <DeathStat
          label="Bless"
          value={deathState.penalty.blessProtected ? "Protegeu" : "Nenhuma"}
        />
      </div>

      <button disabled={!canRevive} onClick={onRevive} type="button">
        {canRevive ? "Reviver no Templo" : "Aguardando recuperacao"}
      </button>
    </div>
  );
}

function DeathStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatCause(cause: string) {
  if (cause === "hunt") return "Hunt";
  if (cause === "boss") return "Boss";
  if (cause === "quest") return "Quest";
  return "Desconhecida";
}
