import { useState } from "react";
import { calculateHuntRisk } from "../../game-engine/hunt/calculateHuntRisk";
import { GameButton } from "../ui/GameButton";
import { Panel } from "../ui/Panel";
import { getAccessName } from "../../data/accesses";
import type { Character, HuntArea } from "../../shared/types";

const durationOptions = [
  { label: "1 min", value: 1 },
  { label: "5 min", value: 5 },
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "1h", value: 60 },
  { label: "2h", value: 120 },
  { label: "4h", value: 240 },
];

const minHuntDuration = 1;
const maxHuntDuration = 480;

interface HuntActionPanelProps {
  character: Character;
  selectedHunt?: HuntArea;
  durationMinutes: number;
  onBackToHunts?: () => void;
  onChangeDuration: (durationMinutes: number) => void;
  onStartHunt: () => void;
}

export function HuntActionPanel({
  character,
  selectedHunt,
  durationMinutes,
  onBackToHunts,
  onChangeDuration,
  onStartHunt,
}: HuntActionPanelProps) {
  const [durationUnit, setDurationUnit] = useState<"minutes" | "hours">("minutes");

  if (!selectedHunt) {
    return (
      <Panel title="Hunt Assignment">
        <div className="hunt-action-empty">Selecione uma hunt para escolher o tempo.</div>
      </Panel>
    );
  }

  const risk = calculateHuntRisk(character, selectedHunt);
  const hasAccess =
    !selectedHunt.requiredAccess || character.accessIds.includes(selectedHunt.requiredAccess);
  const hasLevel = character.level >= selectedHunt.minLevel;
  const canStartHunt = character.status === "idle" && hasAccess && hasLevel;
  const blockReason = getHuntBlockReason(character, selectedHunt, hasAccess, hasLevel);
  const customDurationAmount =
    durationUnit === "hours" ? Number((durationMinutes / 60).toFixed(2)) : durationMinutes;

  function changeDurationFromCustom(amount: number, unit = durationUnit) {
    onChangeDuration(normalizeDuration(unit === "hours" ? amount * 60 : amount));
  }

  function selectDurationPreset(duration: number) {
    setDurationUnit(duration >= 60 ? "hours" : "minutes");
    onChangeDuration(duration);
  }

  return (
    <Panel title="Hunt Assignment">
      <div className="hunt-action-panel hunt-assignment-simple">
        <div className="assignment-summary">
          <div>
            <span>Adventurer</span>
            <strong>{character.name}</strong>
          </div>
          <div>
            <span>Hunt</span>
            <strong>{selectedHunt.name}</strong>
          </div>
          <div>
            <span>Death Risk</span>
            <strong>{hasAccess && hasLevel ? `${Math.round(risk.deathChance * 100)}% / ${risk.label}` : "Locked"}</strong>
          </div>
          <div>
            <span>Power</span>
            <strong>
              {risk.power.offensivePower} atk / {risk.power.defensivePower} def
            </strong>
          </div>
        </div>

        {!hasAccess ? (
          <div className="hunt-access-warning">
            Requer acesso: {getAccessName(selectedHunt.requiredAccess)}
          </div>
        ) : null}
        {!hasLevel ? (
          <div className="hunt-access-warning">
            Requer level {selectedHunt.minLevel}. {character.name} esta no level {character.level}.
          </div>
        ) : null}

        <div className="hunt-duration-panel">
          <div className="hunt-duration-heading">
            <div>
              <span>Duration</span>
              <strong>{formatHuntDuration(durationMinutes)}</strong>
            </div>
            <small>Escolha minutos ou horas antes de iniciar.</small>
          </div>
          <div className="duration-row" aria-label="Hunt duration presets">
            {durationOptions.map((option) => (
              <button
                className={durationMinutes === option.value ? "is-selected" : ""}
                key={option.value}
                onClick={() => selectDurationPreset(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="hunt-duration-custom">
            <label>
              Quantidade
              <input
                max={durationUnit === "hours" ? maxHuntDuration / 60 : maxHuntDuration}
                min={durationUnit === "hours" ? 0.25 : minHuntDuration}
                onChange={(event) => changeDurationFromCustom(Number(event.target.value))}
                step={durationUnit === "hours" ? 0.25 : 1}
                type="number"
                value={customDurationAmount}
              />
            </label>
            <label>
              Unidade
              <select
                onChange={(event) => setDurationUnit(event.target.value as "minutes" | "hours")}
                value={durationUnit}
              >
                <option value="minutes">Minutos</option>
                <option value="hours">Horas</option>
              </select>
            </label>
          </div>
        </div>

        <div className="hunt-action-buttons">
          <GameButton disabled={!canStartHunt} onClick={onStartHunt}>
            Iniciar Hunt
          </GameButton>
          {onBackToHunts ? (
            <button className="secondary-command-button" onClick={onBackToHunts} type="button">
              Escolher outra hunt
            </button>
          ) : null}
        </div>
        {blockReason ? <p className="action-block-reason">{blockReason}</p> : null}
      </div>
    </Panel>
  );
}

function normalizeDuration(value: number | string) {
  const numericValue = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(numericValue)) return minHuntDuration;

  return Math.min(maxHuntDuration, Math.max(minHuntDuration, Math.round(numericValue)));
}

function formatHuntDuration(durationMinutes: number) {
  const normalized = normalizeDuration(durationMinutes);
  if (normalized < 60) return `${normalized} min`;

  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
}

function getHuntBlockReason(
  character: Character,
  selectedHunt: HuntArea,
  hasAccess: boolean,
  hasLevel: boolean,
) {
  if (!hasAccess) {
    return `Requer acesso: ${getAccessName(selectedHunt.requiredAccess)}.`;
  }

  if (!hasLevel) {
    return `${character.name} precisa estar no level ${selectedHunt.minLevel} para iniciar esta hunt.`;
  }

  if (character.status === "hunting") {
    return character.currentAction?.targetId === selectedHunt.id
      ? `${character.name} ja esta cacando aqui. Volte para a cena da hunt ou cancele a acao.`
      : `${character.name} ja esta cacando. Finalize ou cancele a acao atual.`;
  }

  if (character.status !== "idle") {
    return `${character.name} esta ${character.status} e nao pode iniciar uma hunt.`;
  }

  return undefined;
}
