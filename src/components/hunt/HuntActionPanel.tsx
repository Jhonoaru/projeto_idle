import { useMemo, useState } from "react";
import { calculateHuntRisk } from "../../game-engine/hunt/calculateHuntRisk";
import { calculateCharmBonusesForHunt } from "../../game-engine/bestiary/calculateCharmBonusesForHunt";
import { checkHuntSupplies } from "../../game-engine/supplies/checkHuntSupplies";
import { HuntPrepPanel } from "../hunt-prep/HuntPrepPanel";
import { GameButton } from "../ui/GameButton";
import { Panel } from "../ui/Panel";
import { getAccessName } from "../../data/accesses";
import type {
  Character,
  Guild,
  GuildBestiaryState,
  GuildDepot,
  HuntArea,
  HuntAutoRepeatConfig,
  HuntAutoRepeatMode,
  HuntPreparationResult,
  HuntSupplyPreset,
} from "../../shared/types";

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
  guild: Guild;
  guildDepot: GuildDepot;
  selectedHunt?: HuntArea;
  durationMinutes: number;
  presets: HuntSupplyPreset[];
  lastPreparationResult?: HuntPreparationResult;
  bestiary?: GuildBestiaryState;
  onChangeDuration: (durationMinutes: number) => void;
  onStartHunt: (autoRepeat?: HuntAutoRepeatConfig) => void;
  onFinishHunt: () => void;
  onStopAutoRepeat: () => void;
  onCreateRecommendedPreset: () => void;
  onPrepareHunt: (preset: HuntSupplyPreset) => void;
  onDeletePreset: (presetId: string) => void;
}

export function HuntActionPanel({
  character,
  guild,
  guildDepot,
  selectedHunt,
  durationMinutes,
  presets,
  lastPreparationResult,
  bestiary,
  onChangeDuration,
  onStartHunt,
  onFinishHunt,
  onStopAutoRepeat,
  onCreateRecommendedPreset,
  onPrepareHunt,
  onDeletePreset,
}: HuntActionPanelProps) {
  const [durationUnit, setDurationUnit] = useState<"minutes" | "hours">("minutes");
  const [autoRepeatEnabled, setAutoRepeatEnabled] = useState(false);
  const [autoRepeatMode, setAutoRepeatMode] = useState<HuntAutoRepeatMode>("repeat_count");
  const [maxRepeats, setMaxRepeats] = useState(3);
  const [capacityLimit, setCapacityLimit] = useState(90);
  const [staminaLimit, setStaminaLimit] = useState(10);
  const autoRepeatConfig = useMemo(() => {
    if (!autoRepeatEnabled) return undefined;

    const now = new Date().toISOString();
    return {
      enabled: true,
      mode: autoRepeatMode,
      maxRepeats: clampRepeats(maxRepeats),
      completedRepeats: 0,
      stopIfCapacityAbovePercent: clampPercent(capacityLimit),
      stopIfSuppliesMissing: true,
      stopIfStaminaBelowHours: Math.max(0, staminaLimit),
      stopIfDeath: true,
      autoPrepareBetweenRuns: false,
      createdAt: now,
      updatedAt: now,
    } satisfies HuntAutoRepeatConfig;
  }, [autoRepeatEnabled, autoRepeatMode, capacityLimit, maxRepeats, staminaLimit]);

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
  const hasLevel = character.level >= selectedHunt.minLevel;
  const isHuntingSelectedArea =
    character.status === "hunting" &&
    character.currentAction?.targetId === selectedHunt.id;
  const supplyCheck = checkHuntSupplies(character, selectedHunt, durationMinutes);
  const charmBonuses = calculateCharmBonusesForHunt(bestiary, selectedHunt);
  const canStartHunt =
    character.status === "idle" && hasAccess && hasLevel && supplyCheck.hasRequiredSupplies;
  const blockReason = getHuntBlockReason(character, selectedHunt, hasAccess, hasLevel);
  const activeAutoRepeat =
    isHuntingSelectedArea && character.currentAction?.autoRepeat?.enabled === true;
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
            <small>Escolha minutos ou horas antes de iniciar a hunt.</small>
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
                onChange={(event) => {
                  const nextUnit = event.target.value as "minutes" | "hours";
                  setDurationUnit(nextUnit);
                }}
                value={durationUnit}
              >
                <option value="minutes">Minutos</option>
                <option value="hours">Horas</option>
              </select>
            </label>
          </div>
        </div>

        <div className="supplies-panel">
          <div className="supplies-heading">
            <span>Supplies</span>
            <strong>
              {supplyCheck.hasRequiredSupplies
                ? `Supplies OK para ${durationMinutes}min.`
                : "Supplies insuficientes: compre no Market NPC."}
            </strong>
          </div>
          {supplyCheck.availableSupplies.length > 0 ? (
            <div className="supplies-list">
              {supplyCheck.availableSupplies.map((entry) => (
                <div
                  className={entry.missingQuantity > 0 ? "is-missing" : "is-ok"}
                  key={entry.itemId}
                >
                  <span>{entry.itemName}</span>
                  <strong>
                    {entry.availableQuantity}/{entry.requiredQuantity}
                  </strong>
                  <em>
                    {entry.missingQuantity > 0
                      ? `Faltam ${entry.missingQuantity}`
                      : entry.optional ? "Opcional OK" : "OK"}
                  </em>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-list">Esta hunt nao exige supplies especiais.</div>
          )}
          {supplyCheck.warnings.map((warning) => (
            <p className="action-block-reason" key={warning}>{warning}</p>
          ))}
        </div>

        <HuntPrepPanel
          character={character}
          durationMinutes={durationMinutes}
          guild={guild}
          guildDepot={guildDepot}
          hunt={selectedHunt}
          lastPreparationResult={lastPreparationResult}
          onCreateRecommendedPreset={onCreateRecommendedPreset}
          onDeletePreset={onDeletePreset}
          onPrepareHunt={onPrepareHunt}
          presets={presets}
        />

        {charmBonuses.logs.length > 0 ? (
          <div className="charm-bonus-panel">
            <span>Charms ativos nesta hunt</span>
            <strong>{charmBonuses.logs.length} bonus aplicado(s)</strong>
            <ul>
              {charmBonuses.logs.map((log) => (
                <li key={log}>{log}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="auto-repeat-panel">
          <div className="auto-repeat-heading">
            <div>
              <span>Auto-repeat</span>
              <strong>{autoRepeatEnabled ? "Enabled for next hunt" : activeAutoRepeat ? "Running" : "Off"}</strong>
            </div>
            <label>
              <input
                checked={autoRepeatEnabled}
                disabled={character.status !== "idle"}
                onChange={(event) => setAutoRepeatEnabled(event.target.checked)}
                type="checkbox"
              />
              Enable
            </label>
          </div>
          <div className="auto-repeat-grid">
            <label>
              Mode
              <select
                disabled={!autoRepeatEnabled || character.status !== "idle"}
                onChange={(event) => setAutoRepeatMode(event.target.value as HuntAutoRepeatMode)}
                value={autoRepeatMode}
              >
                <option value="repeat_count">Repeat X times</option>
                <option value="until_supplies_end">Until supplies end</option>
                <option value="until_capacity_full">Until capacity limit</option>
                <option value="until_death_or_stop">Until death or stop</option>
              </select>
            </label>
            <label>
              Repeats
              <input
                disabled={!autoRepeatEnabled || character.status !== "idle"}
                max={10}
                min={1}
                onChange={(event) => setMaxRepeats(Number(event.target.value))}
                type="number"
                value={maxRepeats}
              />
            </label>
            <label>
              Stop capacity %
              <input
                disabled={!autoRepeatEnabled || character.status !== "idle"}
                max={100}
                min={1}
                onChange={(event) => setCapacityLimit(Number(event.target.value))}
                type="number"
                value={capacityLimit}
              />
            </label>
            <label>
              Stop stamina h
              <input
                disabled={!autoRepeatEnabled || character.status !== "idle"}
                min={0}
                onChange={(event) => setStaminaLimit(Number(event.target.value))}
                type="number"
                value={staminaLimit}
              />
            </label>
          </div>
          <p>
            {autoRepeatEnabled
              ? `This hunt will repeat up to ${clampRepeats(maxRepeats)} run(s). Auto-prepare between runs is off.`
              : "Auto-repeat is optional and starts only when enabled before the hunt."}
          </p>
          {activeAutoRepeat ? (
            <button onClick={onStopAutoRepeat} type="button">Parar próximas repetições</button>
          ) : null}
        </div>

        <div className="hunt-action-buttons">
          <GameButton disabled={!canStartHunt} onClick={() => onStartHunt(autoRepeatConfig)}>
            {autoRepeatConfig?.enabled ? "Iniciar Hunt com Auto-repeat" : "Iniciar Hunt"}
          </GameButton>
          <GameButton disabled={!isHuntingSelectedArea} onClick={onFinishHunt}>
            Finalizar Simulacao
          </GameButton>
        </div>
        {isHuntingSelectedArea ? (
          <div className="hunt-access-warning">
            Hunt iniciada: {selectedHunt.name}. Use Finalizar Simulacao ou Cancelar e Retornar.
          </div>
        ) : null}
        {blockReason ? <p className="action-block-reason">{blockReason}</p> : null}
        {!supplyCheck.hasRequiredSupplies ? (
          <p className="action-block-reason">
            {supplyCheck.missingSupplies
              .map((entry) => `Faltam ${entry.missingQuantity} ${entry.itemName}`)
              .join(". ")}
          </p>
        ) : null}
      </div>
    </Panel>
  );
}

function clampRepeats(value: number) {
  return Math.min(10, Math.max(1, Math.floor(Number.isFinite(value) ? value : 3)));
}

function clampPercent(value: number) {
  return Math.min(100, Math.max(1, Math.floor(Number.isFinite(value) ? value : 90)));
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
      ? `${character.name} ja esta cacando aqui. Finalize ou cancele a acao atual.`
      : `${character.name} ja esta cacando. Selecione a hunt atual, finalize ou cancele a acao.`;
  }

  if (character.status !== "idle") {
    return `${character.name} esta ${character.status} e nao pode iniciar uma hunt.`;
  }

  return undefined;
}
