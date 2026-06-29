import { calculateHuntRisk } from "../../game-engine/hunt/calculateHuntRisk";
import { GameButton } from "../ui/GameButton";
import { Panel } from "../ui/Panel";
import { getAccessName } from "../../data/accesses";
import type { Character, HuntArea } from "../../shared/types";

const durationOptions = [
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "1h", value: 60 },
  { label: "2h", value: 120 },
];

interface HuntActionPanelProps {
  character: Character;
  selectedHunt?: HuntArea;
  durationMinutes: number;
  onChangeDuration: (durationMinutes: number) => void;
  onStartHunt: () => void;
  onFinishHunt: () => void;
}

export function HuntActionPanel({
  character,
  selectedHunt,
  durationMinutes,
  onChangeDuration,
  onStartHunt,
  onFinishHunt,
}: HuntActionPanelProps) {
  if (!selectedHunt) {
    return (
      <Panel title="Hunt Assignment">
        <div className="hunt-action-empty">Select a hunt to prepare an assignment.</div>
      </Panel>
    );
  }

  const risk = calculateHuntRisk(character, selectedHunt);
  const hasAccess =
    !selectedHunt.requiredAccess || character.accessIds.includes(selectedHunt.requiredAccess);
  const isHuntingSelectedArea =
    character.status === "hunting" &&
    character.currentAction?.targetId === selectedHunt.id;
  const canStartHunt = character.status === "idle" && hasAccess;
  const blockReason = getHuntBlockReason(character, selectedHunt, hasAccess);

  return (
    <Panel title="Hunt Assignment">
      <div className="hunt-action-panel">
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
            <strong>{hasAccess ? `${Math.round(risk.deathChance * 100)}% / ${risk.label}` : "Locked"}</strong>
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

        <div className="duration-row">
          {durationOptions.map((option) => (
            <button
              className={durationMinutes === option.value ? "is-selected" : ""}
              key={option.value}
              onClick={() => onChangeDuration(option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="hunt-action-buttons">
          <GameButton disabled={!canStartHunt} onClick={onStartHunt}>
            Iniciar Hunt
          </GameButton>
          <GameButton disabled={!isHuntingSelectedArea} onClick={onFinishHunt}>
            Finalizar Simulacao
          </GameButton>
        </div>
        {blockReason ? <p className="action-block-reason">{blockReason}</p> : null}
      </div>
    </Panel>
  );
}

function getHuntBlockReason(
  character: Character,
  selectedHunt: HuntArea,
  hasAccess: boolean,
) {
  if (!hasAccess) {
    return `Requer acesso: ${getAccessName(selectedHunt.requiredAccess)}.`;
  }

  if (character.status === "hunting") {
    return character.currentAction?.targetId === selectedHunt.id
      ? `${character.name} ja esta cacando aqui. Finalize ou cancele a acao atual.`
      : `${character.name} ja esta cacando. Selecione a hunt atual, finalize ou cancele a acao.`;
  }

  if (character.status !== "idle") {
    return `${character.name} esta ${character.status} e nao pode iniciar uma hunt.`;
  }

  return undefined;
}
